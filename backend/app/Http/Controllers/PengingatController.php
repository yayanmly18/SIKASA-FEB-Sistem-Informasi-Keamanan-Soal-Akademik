<?php

namespace App\Http\Controllers;

use App\Models\BankSoal;
use App\Models\MataKuliah;
use App\Services\ActivityLogger;
use App\Services\NotifikasiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PengingatController extends Controller
{
    /**
     * Kaprodi mengirim pengingat ke dosen yang mata kuliahnya BELUM mengunggah
     * soal. Notifikasi dibuat untuk setiap dosen terkait + dicatat di log.
     */
    public function kirim(Request $request): JsonResponse
    {
        // Mata kuliah yang belum punya soal di bank_soal.
        $mkBelum = MataKuliah::whereDoesntHave('bankSoal')
            ->with('dosen')
            ->get();

        $dosenDinotifikasi = [];
        $mkTanpaDosen = [];

        foreach ($mkBelum as $mk) {
            if ($mk->dosen->isEmpty()) {
                $mkTanpaDosen[] = $mk->nama_mk;
                continue;
            }

            foreach ($mk->dosen as $dosen) {
                NotifikasiService::keUser(
                    $dosen->id,
                    'Pengingat unggah soal',
                    "Soal untuk mata kuliah {$mk->nama_mk} ({$mk->kode_mk}) belum diunggah. Segera unggah dan kunci sebelum batas waktu.",
                    'peringatan',
                    'Upload Soal',
                );
                $dosenDinotifikasi[$dosen->id] = $dosen->nama;
            }
        }

        ActivityLogger::log('kirim_pengingat', [
            'jumlah_dosen' => count($dosenDinotifikasi),
            'mk_belum_upload' => $mkBelum->count(),
        ], null, $request->user());

        return response()->json([
            'message' => count($dosenDinotifikasi) > 0
                ? 'Pengingat terkirim ke '.count($dosenDinotifikasi).' dosen.'
                : 'Tidak ada dosen yang perlu diingatkan (semua mata kuliah sudah unggah).',
            'jumlah_dosen' => count($dosenDinotifikasi),
            'dosen' => array_values($dosenDinotifikasi),
            'mk_tanpa_dosen' => $mkTanpaDosen,
        ]);
    }
}
