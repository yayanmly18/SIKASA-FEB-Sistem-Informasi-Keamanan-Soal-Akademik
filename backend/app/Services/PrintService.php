<?php

namespace App\Services;

use App\Models\BankSoal;
use App\Models\LogCetak;
use App\Models\Printer;
use App\Models\User;
use Dompdf\Dompdf;
use Illuminate\Support\Facades\Log;
use setasign\Fpdi\Fpdi;

class PrintService
{
    public function __construct(
        private readonly FileProtectionService $files,
    ) {}

    /**
     * Cek apakah soal boleh dicetak sekarang:
     *  - status harus 'siap_cetak'
     *  - waktu sekarang >= waktu_mulai_cetak (H-1 07:00)
     *  - belum diarsip
     */
    public function canPrint(BankSoal $soal): array
    {
        if ($soal->status === 'arsip') {
            return ['allowed' => false, 'reason' => 'Soal sudah diarsipkan dan dikunci permanen.'];
        }
        if ($soal->status !== 'siap_cetak') {
            return ['allowed' => false, 'reason' => 'Soal belum dibuka untuk cetak oleh Kaprodi.'];
        }
        if ($soal->waktu_mulai_cetak === null) {
            return ['allowed' => false, 'reason' => 'Jadwal buka cetak belum diatur.'];
        }
        if (now()->lessThan($soal->waktu_mulai_cetak)) {
            return [
                'allowed' => false,
                'reason' => 'Soal baru bisa dicetak '.$soal->waktu_mulai_cetak->translatedFormat('d F Y H:i').'.',
            ];
        }

        return ['allowed' => true];
    }

    /**
     * Buat watermark footer sesuai spesifikasi:
     * DOKUMEN RAHASIA - DICETAK OLEH {petugas} - {tanggal jam} - MK {mata kuliah}
     */
    public function buildWatermark(BankSoal $soal, User $petugas): string
    {
        $mk = $soal->mataKuliah?->nama_mk ?? '-';
        $waktu = now()->format('d-m-Y H:i');

        return "DOKUMEN RAHASIA - DICETAK OLEH {$petugas->nama} - {$waktu} - MK {$mk}";
    }

    /**
     * Susun PDF siap cetak yang BENAR-BENAR berisi naskah soal asli yang
     * diunggah dosen (bukan sekadar halaman sampul):
     *  1. Buka enkripsi berkas asli dari disk privat (FileProtectionService).
     *  2. Impor SETIAP halaman PDF asli via FPDI, tempel watermark keamanan.
     *  3. Sisipkan halaman "Berita Acara" (sampul) di bagian paling depan.
     *  4. Fallback: bila berkas asli tidak terbaca (mis. data seed lama tanpa
     *     berkas nyata), kembali ke mode sampul-saja agar alur tidak macet.
     *
     * File asli TIDAK PERNAH dikirim ke perangkat TU — hanya dibaca internal
     * lalu dikirim ke printer jaringan/server.
     *
     * @return string Isi PDF (biner) siap cetak.
     */
    public function renderForPrint(BankSoal $soal, User $petugas): string
    {
        $watermark = $this->buildWatermark($soal, $petugas);

        // Ambil berkas ASLI yang di-decrypt dari disk privat.
        $originalBytes = $this->files->readDecrypted($soal->file_path);

        // Pastikan benar-benar PDF (magic header %PDF).
        if (is_string($originalBytes) && str_starts_with(ltrim($originalBytes), '%PDF')) {
            $pdf = $this->composePdf($originalBytes, $watermark, $soal, $petugas);
            if ($pdf !== null) {
                return $pdf;
            }
        }

        // Fallback: berkas asli tidak tersedia/valid -> render sampul saja.
        Log::warning('Soal #'.$soal->id.' tidak punya berkas PDF asli yang valid; cetak mode sampul saja.', [
            'file_path' => $soal->file_path,
        ]);

        return $this->renderCoverOnly($soal, $petugas, $watermark);
    }

    /**
     * Gabungkan sampul Berita Acara + semua halaman PDF asli (ber-watermark)
     * menggunakan FPDI. Mengembalikan string PDF, atau null bila gagal.
     */
    private function composePdf(string $originalBytes, string $watermark, BankSoal $soal, User $petugas): ?string
    {
        $coverTmp = null;
        $soalTmp = null;

        try {
            $pdf = new Fpdi();
            $pdf->SetCompression(true);

            // --- 1) Sampul Berita Acara (halaman paling depan) ---
            $coverPdf = $this->renderCoverOnly($soal, $petugas, $watermark);
            $coverTmp = tempnam(sys_get_temp_dir(), 'ebrankas_cover_').'.pdf';
            file_put_contents($coverTmp, $coverPdf);

            $coverCount = (int) $pdf->setSourceFile($coverTmp);
            for ($i = 1; $i <= $coverCount; $i++) {
                $tpl = $pdf->importPage($i);
                $size = $pdf->getTemplateSize($tpl);
                $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                $pdf->useTemplate($tpl);
            }

            // --- 2) Semua halaman PDF ASLI soal (ber-watermark) ---
            $soalTmp = tempnam(sys_get_temp_dir(), 'ebrankas_soal_').'.pdf';
            file_put_contents($soalTmp, $originalBytes);

            $soalCount = (int) $pdf->setSourceFile($soalTmp);
            for ($i = 1; $i <= $soalCount; $i++) {
                $tpl = $pdf->importPage($i);
                $size = $pdf->getTemplateSize($tpl);
                $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                $pdf->useTemplate($tpl);

                // Tempel watermark keamanan di bagian bawah halaman.
                $this->stampWatermark($pdf, $size, $watermark, $i, $soalCount);
            }

            return $pdf->Output('S');
        } catch (\Throwable $e) {
            Log::error('Gagal menyusun PDF FPDI untuk soal #'.$soal->id, [
                'error' => $e->getMessage(),
            ]);

            return null;
        } finally {
            if ($coverTmp && is_file($coverTmp)) {
                @unlink($coverTmp);
            }
            if ($soalTmp && is_file($soalTmp)) {
                @unlink($soalTmp);
            }
        }
    }

    /**
     * Tulis watermark rahasia + penomoran halaman di bawah halaman PDF asli.
     */
    private function stampWatermark(Fpdi $pdf, array $size, string $watermark, int $pageNo, int $totalPages): void
    {
        $pageHeight = isset($size['height']) && $size['height'] > 0 ? $size['height'] : 297;
        $pageWidth = isset($size['width']) && $size['width'] > 0 ? $size['width'] : 210;

        $pdf->SetFont('Helvetica', '', 7);
        $pdf->SetTextColor(150, 150, 150);
        $pdf->SetXY(10, $pageHeight - 14);
        $pdf->Cell(0, 4, $watermark, 0, 0, 'L');

        $pdf->SetXY($pageWidth - 60, $pageHeight - 14);
        $pdf->Cell(50, 4, 'Hal. '.$pageNo.'/'.$totalPages, 0, 0, 'R');
    }

    /**
     * Render halaman Berita Acara (sampul) saja via DomPDF. Dipakai sebagai
     * sampul pada composePdf() maupun fallback bila berkas asli tak tersedia.
     */
    private function renderCoverOnly(BankSoal $soal, User $petugas, string $watermark): string
    {
        $html = view('print.watermark', [
            'soal' => $soal,
            'mataKuliah' => $soal->mataKuliah,
            'petugas' => $petugas,
            'watermark' => $watermark,
            'jumlah' => $soal->jumlah_mahasiswa,
        ])->render();

        $dompdf = new Dompdf(['isRemoteEnabled' => false]);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return $dompdf->output();
    }

    /**
     * Catat job cetak ke log_cetak dengan status awal "menunggu" (antrian).
     * Status final diperbarui controller setelah mencoba kirim ke printer.
     */
    public function recordLog(BankSoal $soal, User $petugas, User $penyetuju, Printer $printer, int $jumlah): LogCetak
    {
        return LogCetak::create([
            'bank_soal_id' => $soal->id,
            'dicetak_oleh' => $petugas->id,
            'disetujui_oleh' => $penyetuju->id,
            'printer_id' => $printer->id,
            'jumlah_cetak' => $jumlah,
            'status' => 'menunggu',
            'job_id' => 'JOB-'.now()->format('YmdHis').'-'.$soal->id,
            'ip_address' => request()->ip(),
            'waktu_cetak' => now(),
        ]);
    }

    /**
     * Kirim job ke printer jaringan (ala Word: job tetap masuk antrian walau
     * printer belum terhubung):
     *  1. Tulis PDF ber-watermark ke folder spool privat di server.
     *  2. (Opsional) Jalankan perintah OS untuk mengirim ke printer fisik.
     *
     * File TIDAK PERNAH dikirim ke perangkat TU. Mengembalikan status job:
     *   - "berhasil" : berhasil diteruskan ke perintah printer fisik.
     *   - "gagal"    : perintah printer dikonfigurasi tetapi gagal dijalankan.
     *   - "menunggu" : mode spool saja (printer belum dikonfigurasi/terhubung) —
     *                 job tersimpan di antrian, tinggal dicetak nanti.
     */
    public function dispatchToPrinter(string $pdfContent, Printer $printer, LogCetak $logCetak): string
    {
        $spoolDir = rtrim((string) config('ebrankas.spool_path'), DIRECTORY_SEPARATOR);
        if (! is_dir($spoolDir)) {
            @mkdir($spoolDir, 0770, true);
        }

        $spoolFile = $spoolDir.DIRECTORY_SEPARATOR.$logCetak->job_id.'.pdf';
        file_put_contents($spoolFile, $pdfContent);

        $command = config('ebrankas.print_command');

        if (is_string($command) && trim($command) !== '') {
            $target = str_replace(
                ['{file}', '{printer}'],
                [$spoolFile, $printer->alamat_printer ?: $printer->nama_printer],
                $command,
            );

            $exitCode = 0;
            $output = [];
            // escapeshellarg pada path agar aman terhadap spasi/karakter khusus.
            $safeTarget = $this->quotePaths($target);
            @exec($safeTarget.' 2>&1', $output, $exitCode);

            Log::info('Print job dispatch', [
                'printer' => $printer->nama_printer,
                'alamat' => $printer->alamat_printer,
                'job_id' => $logCetak->job_id,
                'spool_file' => $spoolFile,
                'exit_code' => $exitCode,
                'output' => implode("\n", $output),
            ]);

            return $exitCode === 0 ? 'berhasil' : 'gagal';
        }

        Log::info('Print job masuk antrian (perintah printer belum dikonfigurasi)', [
            'printer' => $printer->nama_printer,
            'job_id' => $logCetak->job_id,
            'spool_file' => $spoolFile,
            'bytes' => strlen($pdfContent),
        ]);

        return 'menunggu';
    }

    /**
     * Beri tanda kutip pada placeholder {file} yang mungkin mengandung spasi.
     */
    private function quotePaths(string $command): string
    {
        return preg_replace_callback('/\{([^}]*)\}/', function ($m) {
            return '"'.str_replace('"', '', $m[1]).'"';
        }, $command) ?? $command;
    }
}

