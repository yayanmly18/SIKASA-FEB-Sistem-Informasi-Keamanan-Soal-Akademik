<?php

namespace App\Http\Controllers;

use App\Models\BankSoal;
use App\Models\LogAktivitas;
use App\Models\LogCetak;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Statistik ringkasan, disesuaikan dengan peran pengguna.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        return match ($user->role) {
            'dosen' => $this->dosenStats($user->id),
            'kaprodi' => $this->kaprodiStats(),
            'panitia' => $this->panitiaStats(),
            default => $this->adminStats(),
        };
    }

    private function dosenStats(int $userId): JsonResponse
    {
        $soal = BankSoal::where('user_id', $userId)->get();

        return response()->json([
            'role' => 'dosen',
            'cards' => [
                ['label' => 'Total Soal Saya', 'value' => $soal->count()],
                ['label' => 'Siap Cetak', 'value' => $soal->where('status', 'siap_cetak')->count()],
                ['label' => 'Terkunci', 'value' => $soal->where('status', 'terkunci')->count()],
                ['label' => 'Diarsip', 'value' => $soal->where('status', 'arsip')->count()],
            ],
            'aktivitas' => LogAktivitas::where('user_id', $userId)
                ->orderByDesc('waktu')->limit(10)->get()
                ->map(fn (LogAktivitas $l) => [
                    'aksi' => $l->aksi,
                    'waktu' => optional($l->waktu)->format('d M Y H:i'),
                ]),
        ]);
    }

    private function kaprodiStats(): JsonResponse
    {
        $totalMk = DB::table('mata_kuliah')->count();
        $sudahUpload = DB::table('bank_soal')->distinct('mk_id')->count('mk_id');
        $revisiMenunggu = DB::table('revisi_soal')->where('status', 'menunggu')->count();

        return response()->json([
            'role' => 'kaprodi',
            'cards' => [
                ['label' => 'Mata Kuliah', 'value' => $totalMk],
                ['label' => 'Sudah Upload', 'value' => $sudahUpload],
                ['label' => 'Belum Upload', 'value' => max(0, $totalMk - $sudahUpload)],
                ['label' => 'Revisi Menunggu', 'value' => $revisiMenunggu],
            ],
        ]);
    }

    private function panitiaStats(): JsonResponse
    {
        $siapCetak = BankSoal::where('status', 'siap_cetak')->count();
        $totalCetak = LogCetak::sum('jumlah_cetak');

        return response()->json([
            'role' => 'panitia',
            'cards' => [
                ['label' => 'Siap Dicetak', 'value' => $siapCetak],
                ['label' => 'Total Lembar Dicetak', 'value' => $totalCetak],
                ['label' => 'Total Percetakan', 'value' => LogCetak::count()],
                ['label' => 'Download', 'value' => 'Dilarang'],
            ],
        ]);
    }

    private function adminStats(): JsonResponse
    {
        return response()->json([
            'role' => 'admin_it',
            'cards' => [
                ['label' => 'Total Pengguna', 'value' => DB::table('users')->count()],
                ['label' => 'Pengguna Aktif', 'value' => DB::table('users')->where('is_active', true)->count()],
                ['label' => 'Aktivitas 24 Jam', 'value' => LogAktivitas::where('waktu', '>=', now()->subDay())->count()],
                ['label' => 'Akses Isi Soal', 'value' => 'Terlarang'],
            ],
        ]);
    }
}
