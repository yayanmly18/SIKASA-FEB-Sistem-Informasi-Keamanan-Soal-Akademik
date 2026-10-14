<?php

namespace App\Http\Controllers;

use App\Models\BankSoal;
use App\Models\RevisiSoal;
use App\Services\ActivityLogger;
use App\Services\FileProtectionService;
use App\Services\NotifikasiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RevisiController extends Controller
{
    public function __construct(
        private readonly FileProtectionService $files,
    ) {}

    /**
     * Dosen mengajukan revisi soal (butuh approval Kaprodi).
     */
    public function store(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'alasan_revisi' => ['required', 'string', 'max:1000'],
            'file' => ['required', 'file', 'mimetypes:application/pdf', 'max:10240'],
        ]);

        $soal = BankSoal::findOrFail($id);

        // Pastikan hanya pemilik soal yang boleh mengajukan revisi.
        abort_unless($soal->user_id === $request->user()->id, 403, 'Hanya dosen pemilik soal yang dapat mengajukan revisi.');

        $stored = $this->files->storeEncrypted($request->file('file'));

        $revisi = RevisiSoal::create([
            'bank_soal_id' => $soal->id,
            'diajukan_oleh' => $request->user()->id,
            'file_path' => $stored['file_path'],
            'alasan_revisi' => $data['alasan_revisi'],
            'status' => 'menunggu',
            'diajukan_pada' => now(),
        ]);

        ActivityLogger::log('revisi', ['alasan' => $data['alasan_revisi']], $soal->id, $request->user());

        NotifikasiService::keRoles(
            ['kaprodi'],
            'Permintaan revisi soal',
            "{$request->user()->nama} mengajukan revisi untuk {$soal->mataKuliah?->nama_mk}. Alasan: {$data['alasan_revisi']}",
            'peringatan',
            'Approval Revisi',
        );

        return response()->json([
            'message' => 'Permintaan revisi dikirim, menunggu persetujuan Kaprodi.',
            'data' => $revisi,
        ], 201);
    }

    /**
     * Kaprodi melihat daftar permintaan revisi yang menunggu.
     */
    public function index(Request $request): JsonResponse
    {
        $data = RevisiSoal::with(['bankSoal.mataKuliah', 'pengaju'])
            ->where('status', 'menunggu')
            ->orderByDesc('diajukan_pada')
            ->get()
            ->map(fn (RevisiSoal $r) => [
                'id' => $r->id,
                'nama_mk' => $r->bankSoal?->mataKuliah?->nama_mk,
                'kode_mk' => $r->bankSoal?->mataKuliah?->kode_mk,
                'dosen' => $r->pengaju?->nama,
                'alasan_revisi' => $r->alasan_revisi,
                'diajukan_pada' => optional($r->diajukan_pada)->format('d M Y H:i'),
                'bank_soal_id' => $r->bank_soal_id,
            ]);

        return response()->json(['data' => $data]);
    }

    /**
     * Kaprodi menyetujui / menolak revisi.
     */
    public function putuskan(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'keputusan' => ['required', 'in:disetujui,ditolak'],
            'catatan_persetujuan' => ['nullable', 'string', 'max:1000'],
        ]);

        $revisi = RevisiSoal::with('bankSoal')->findOrFail($id);

        $revisi->update([
            'status' => $data['keputusan'],
            'diputuskan_oleh' => $request->user()->id,
            'catatan_persetujuan' => $data['catatan_persetujuan'] ?? null,
            'diputuskan_pada' => now(),
        ]);

        // Jika disetujui, ganti file soal utama dengan file revisi.
        if ($data['keputusan'] === 'disetujui' && $revisi->bankSoal) {
            $revisi->bankSoal->update([
                'file_path' => $revisi->file_path,
                'status' => 'terkunci',
            ]);
        }

        ActivityLogger::log('approval_revisi', [
            'keputusan' => $data['keputusan'],
            'revisi_id' => $revisi->id,
        ], $revisi->bank_soal_id, $request->user());

        // Beri tahu dosen pengaju tentang keputusan Kaprodi.
        if ($revisi->diajukan_oleh) {
            $disetujui = $data['keputusan'] === 'disetujui';
            NotifikasiService::keUser(
                $revisi->diajukan_oleh,
                $disetujui ? 'Revisi disetujui' : 'Revisi ditolak',
                "Permintaan revisi untuk {$revisi->bankSoal?->mataKuliah?->nama_mk} telah ".($disetujui ? 'disetujui' : 'ditolak')." oleh Kaprodi.",
                $disetujui ? 'sukses' : 'bahaya',
                'Soal Saya',
            );
        }

        return response()->json([
            'message' => "Revisi {$data['keputusan']}.",
            'data' => $revisi->fresh(),
        ]);
    }
}
