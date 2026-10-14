<?php

namespace App\Http\Controllers;

use App\Models\BankSoal;
use App\Models\Printer;
use App\Models\User;
use App\Services\ActivityLogger;
use App\Services\NotifikasiService;
use App\Services\PrintService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class CetakController extends Controller
{
    public function __construct(
        private readonly PrintService $prints,
    ) {}

    /**
     * Antrian cetak untuk TU/Panitia: hanya soal berstatus siap_cetak.
     * Urutan: terbaru ke terlama (unggahan paling baru berada di atas).
     * TIDAK mengirim isi/file — hanya metadata + tombol cetak.
     */
    public function antrian(Request $request): JsonResponse
    {
        $soal = BankSoal::with(['mataKuliah', 'dosen'])
            ->where('status', 'siap_cetak')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (BankSoal $s) {
                $cek = $this->prints->canPrint($s);

                return [
                    'id' => $s->id,
                    'kode_mk' => $s->mataKuliah?->kode_mk,
                    'nama_mk' => $s->mataKuliah?->nama_mk,
                    'kelas' => $s->mataKuliah?->kelas,
                    'dosen' => $s->dosen?->nama,
                    'jenis' => $s->jenis,
                    'jadwal_ujian' => optional($s->jadwal_ujian)->format('d M Y H:i'),
                    'jumlah_mahasiswa' => $s->jumlah_mahasiswa,
                    'status_cetak' => $cek['allowed'] ? 'bisa_cetak' : 'tertunda',
                    'alasan' => $cek['reason'] ?? null,
                ];
            });

        return response()->json(['data' => $soal]);
    }

    /**
     * Langkah 2 — Panitia cetak. Wajib masukkan PIN Cetak Kaprodi untuk otorisasi.
     * PIN terpisah dari password login (kolom users.pin_cetak, ter-hash).
     * File dikirim ke printer jaringan + watermark; tidak disimpan di laptop TU.
     */
    public function cetak(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'jumlah_cetak' => ['required', 'integer', 'min:1', 'max:500'],
            'pin_kaprodi' => ['required', 'string', 'regex:/^[0-9]{6}$/'],
            'printer_id' => ['nullable', 'integer', 'exists:printer,id'],
        ], [
            'pin_kaprodi.regex' => 'PIN Cetak harus 6 digit angka.',
        ]);

        $soal = BankSoal::with('mataKuliah')->findOrFail($id);

        // Validasi kewenangan cetak (status + jendela H-1).
        $cek = $this->prints->canPrint($soal);
        if (! $cek['allowed']) {
            return response()->json(['message' => $cek['reason']], 422);
        }

        // Otorisasi PIN Cetak HARIAN — cocokkan PIN dengan kaprodi aktif mana
        // pun yang memilikinya, DAN pin_cetak_at-nya jatuh hari ini
        // (Asia/Jakarta). PIN kemarin otomatis kedaluwarsa; dalam sehari yang
        // sama PIN bisa dipakai berkali-kali (tidak hangus per cetakan).
        $kaprodi = User::where('role', 'kaprodi')
            ->where('is_active', true)
            ->whereNotNull('pin_cetak')
            ->whereNotNull('pin_cetak_at')
            ->orderBy('id')
            ->get()
            ->filter(fn (User $u) => $u->pinHarianBerlaku())
            ->first(fn (User $u) => Hash::check($data['pin_kaprodi'], $u->pin_cetak));

        if (! $kaprodi) {
            ActivityLogger::log('cetak_ditolak', [
                'alasan' => 'PIN Cetak salah / kedaluwarsa',
                'bank_soal_id' => $soal->id,
            ], $soal->id, $request->user());

            throw ValidationException::withMessages([
                'pin_kaprodi' => ['PIN Cetak tidak valid atau sudah kedaluwarsa. Minta PIN hari ini ke Kaprodi.'],
            ]);
        }

        // Tentukan printer tujuan ala Word: prioritas pilihan petugas (printer_id),
        // lalu printer aktif pertama, lalu printer pertama yang ada. Job TETAP
        // masuk antrian walau printer belum terhubung secara fisik — jadi tidak
        // ada lagi pesan "Tidak ada printer aktif" yang memblokir alur.
        $printer = null;
        if (! empty($data['printer_id'])) {
            $printer = Printer::find($data['printer_id']);
        }
        $printer ??= Printer::where('status', 'aktif')->orderBy('id')->first();
        $printer ??= Printer::orderBy('id')->first();
        if (! $printer) {
            return response()->json(['message' => 'Belum ada printer terdaftar. Minta Admin IT menambahkan printer.'], 422);
        }

        // Render watermark + kirim ke printer (internal, tanpa ekspos file ke TU).
        $pdf = $this->prints->renderForPrint($soal, $request->user());
        $logCetak = $this->prints->recordLog($soal, $request->user(), $kaprodi, $printer, $data['jumlah_cetak']);
        $status = $this->prints->dispatchToPrinter($pdf, $printer, $logCetak);

        // Perbarui status job cetak sesuai hasil pengiriman ke printer.
        // Nilai wajib sesuai enum log_cetak: menunggu/diproses/berhasil/gagal.
        $logCetak->update(['status' => $status]);

        ActivityLogger::log('cetak', [
            'jumlah_cetak' => $data['jumlah_cetak'],
            'printer_id' => $printer->id,
            'disetujui_oleh' => $kaprodi->id,
            'job_id' => $logCetak->job_id,
            'status' => $status,
        ], $soal->id, $request->user());

        $pesan = match ($status) {
            'berhasil' => "Dokumen terkirim ke printer {$printer->nama_printer}.",
            'menunggu' => "Dokumen masuk antrian cetak untuk printer {$printer->nama_printer}. Akan tercetak otomatis saat printer terhubung.",
            default => "Dokumen gagal diteruskan ke printer {$printer->nama_printer}. Hubungi Admin IT.",
        };

        // PIN HARIAN: tidak hangus per cetakan — berlaku penuh hari ini untuk
        // semua job cetak. Kedaluwarsa otomatis besok via pinHarianBerlaku().
        NotifikasiService::keUser(
            $kaprodi->id,
            'Soal telah dicetak',
            "{$request->user()->nama} mencetak {$data['jumlah_cetak']} eksemplar {$soal->mataKuliah?->nama_mk} pada printer {$printer->nama_printer}. PIN hari ini tetap berlaku sampai pergantian hari.",
            'info',
            'Log Cetak',
        );

        return response()->json([
            'message' => $pesan,
            'job_id' => $logCetak->job_id,
            'status' => $status,
            'printer' => $printer->nama_printer,
            'watermark' => $this->prints->buildWatermark($soal, $request->user()),
            'jumlah_cetak' => $data['jumlah_cetak'],
            'pin_hangus' => false,
        ]);
    }
}
