<?php

namespace App\Http\Controllers;

use App\Models\BankSoal;
use App\Models\LogAktivitas;
use App\Models\LogCetak;
use Dompdf\Dompdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class LaporanController extends Controller
{
    /**
     * Berita Acara Ujian (PDF): rekap pengumpulan soal + riwayat cetak.
     * Hanya untuk Kaprodi. Dikirim sebagai unduhan (bukan disimpan di klien).
     */
    public function beritaAcara(Request $request): Response
    {
        $rekap = DB::table('mata_kuliah')
            ->leftJoin('bank_soal', 'bank_soal.mk_id', '=', 'mata_kuliah.id')
            ->leftJoin('users', 'users.id', '=', 'bank_soal.user_id')
            ->select(
                'mata_kuliah.kode_mk',
                'mata_kuliah.nama_mk',
                'mata_kuliah.kelas',
                'users.nama as dosen',
                'bank_soal.status',
                'bank_soal.jenis',
            )
            ->orderBy('mata_kuliah.kode_mk')
            ->get();

        $logCetak = LogCetak::with(['bankSoal.mataKuliah', 'petugas', 'printer'])
            ->orderByDesc('waktu_cetak')
            ->limit(200)
            ->get();

        $totalMk = $rekap->count();
        $sudahUpload = $rekap->whereNotNull('status')->count();
        $belumUpload = $totalMk - $sudahUpload;

        $html = view('laporan.berita_acara', [
            'rekap' => $rekap,
            'logCetak' => $logCetak,
            'totalMk' => $totalMk,
            'sudahUpload' => $sudahUpload,
            'belumUpload' => $belumUpload,
            'penanggungJawab' => $request->user(),
            'dibuatPada' => now(),
        ])->render();

        $dompdf = new Dompdf(['isRemoteEnabled' => false]);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        $filename = 'berita-acara-ujian-'.now()->format('Ymd-His').'.pdf';

        return response($dompdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }
}
