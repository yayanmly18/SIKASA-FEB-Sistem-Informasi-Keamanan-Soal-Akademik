<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileProtectionService
{
    /**
     * Simpan berkas soal dengan aman:
     *  - rename jadi nama acak (X7s9d2f3.pdf)
     *  - isi dienkripsi (AES-256 via Laravel Encryption) sebelum ditulis ke disk
     *  - simpan di luar public path
     *
     * @return array{file_path: string, original_filename: string, file_hash: string}
     */
    public function storeEncrypted(UploadedFile $file): array
    {
        $randomName = Str::lower(Str::random(10)).'.pdf';
        $plainBytes = file_get_contents($file->getRealPath());
        $encrypted = Crypt::encryptString($plainBytes);

        // Disk privat (storage/app/private/soal) — tidak bisa diakses publik.
        $path = 'soal/'.date('Y/m').'/'.$randomName;
        Storage::disk('local')->put($path, $encrypted);

        return [
            'file_path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'file_hash' => hash('sha256', $plainBytes),
        ];
    }

    /**
     * Ambil isi PDF asli (terdekripsi) untuk dicetak. Tidak pernah mengirim file
     * ke klien — hanya dipakai internal oleh PrintService.
     */
    public function readDecrypted(string $path): ?string
    {
        if (! Storage::disk('local')->exists($path)) {
            return null;
        }

        return Crypt::decryptString(Storage::disk('local')->get($path));
    }

    /**
     * Hapus berkas fisik dari disk (soft-delete data tetap ada di DB).
     */
    public function destroy(string $path): void
    {
        if (Storage::disk('local')->exists($path)) {
            Storage::disk('local')->delete($path);
        }
    }

    /**
     * Hitung jendela buka cetak: H-1 jam 07:00 pagi (default dari pengaturan).
     */
    public function hitungWaktuMulaiCetak(\DateTimeInterface $jadwalUjian, int $jamBuka = 7, int $hariSebelum = 1): \DateTime
    {
        $mulai = (new \DateTime($jadwalUjian->format('Y-m-d').' '.str_pad((string) $jamBuka, 2, '0', STR_PAD_LEFT).':00:00'))
            ->modify('-'.$hariSebelum.' day');

        return $mulai;
    }
}
