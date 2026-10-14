<?php

namespace App\Http\Controllers;

use App\Models\LogAktivitas;
use App\Models\LogCetak;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LogController extends Controller
{
    /**
     * Log aktivitas — dosen hanya miliknya; kaprodi/panitia/admin sesuai aksi.
     */
    public function aktivitas(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = LogAktivitas::with(['user', 'bankSoal.mataKuliah'])
            ->orderByDesc('waktu');

        if ($user->role === 'dosen') {
            $query->where('user_id', $user->id);
        } elseif ($user->role === 'panitia') {
            $query->where('aksi', 'cetak');
        }

        $logs = $query->limit(300)->get()->map(fn (LogAktivitas $l) => [
            'id' => $l->id,
            'waktu' => optional($l->waktu)->format('d M Y H:i'),
            'pengguna' => $l->user?->nama ?? 'Sistem',
            'aksi' => $l->aksi,
            'mata_kuliah' => $l->bankSoal?->mataKuliah?->nama_mk,
            'detail' => $l->detail,
            'ip_address' => $l->ip_address,
        ]);

        return response()->json(['data' => $logs]);
    }

    /**
     * Log cetak — khusus Kaprodi (siapa cetak, berapa, kapan, printer).
     */
    public function cetak(Request $request): JsonResponse
    {
        $logs = LogCetak::with(['bankSoal.mataKuliah', 'petugas', 'printer'])
            ->orderByDesc('waktu_cetak')
            ->limit(300)
            ->get()
            ->map(fn (LogCetak $l) => [
                'id' => $l->id,
                'waktu' => optional($l->waktu_cetak)->format('d M Y H:i'),
                'mata_kuliah' => $l->bankSoal?->mataKuliah?->nama_mk,
                'kode_mk' => $l->bankSoal?->mataKuliah?->kode_mk,
                'dicetak_oleh' => $l->petugas?->nama,
                'disetujui_oleh' => $l->penyetuju?->nama,
                'jumlah_cetak' => $l->jumlah_cetak,
                'printer' => $l->printer?->nama_printer,
                'status' => $l->status,
                'job_id' => $l->job_id,
                'ip_address' => $l->ip_address,
            ]);

        return response()->json(['data' => $logs]);
    }
}
