<?php

namespace App\Http\Controllers;

use App\Models\Printer;
use Illuminate\Http\JsonResponse;

class PrinterController extends Controller
{
    /**
     * Status printer untuk UI Panitia: daftar printer aktif + status OS
     * Windows yang sebenarnya (bukan hardcode).
     */
    public function status(): JsonResponse
    {
        $printers = Printer::orderBy('id')->get()->map(function (Printer $p) {
            $cek = $this->cekWindows($p->nama_printer);

            return [
                'id' => $p->id,
                'nama_printer' => $p->nama_printer,
                'lokasi' => $p->lokasi,
                'status_db' => $p->status,
                'ada_di_windows' => $cek['ada'],
                'default' => $cek['default'],
                'offline' => $cek['offline'],
                // Online = aktif di DB + terdaftar di Windows + tidak offline.
                'online' => $p->status === 'aktif' && $cek['ada'] && ! $cek['offline'],
            ];
        });

        $utama = $printers->firstWhere('online', true) ?? $printers->first();

        return response()->json([
            'data' => $printers,
            'utama' => $utama,
            'print_command_aktif' => (bool) config('ebrankas.print_command'),
        ]);
    }

    /**
     * Cek printer di Windows via wmic (cocok nama persis / mengandung).
     * Non-Windows / gagal cek = dianggap tidak ada (offline) agar UI jujur.
     */
    private function cekWindows(string $nama): array
    {
        $hasil = ['ada' => false, 'default' => false, 'offline' => true];

        if (PHP_OS_FAMILY !== 'Windows') {
            return $hasil;
        }

        $out = [];
        @exec('wmic printer get name,default,workoffline /format:list 2>&1', $out);
        $blok = implode("\n", $out);

        // Pecah per printer (blok dipisah baris kosong).
        foreach (preg_split('/\R{2,}/', $blok) as $bagian) {
            if (! preg_match('/^Name=(.+)$/mi', $bagian, $m)) {
                continue;
            }
            $namaOs = trim($m[1]);
            // Cocok longgar: nama DB mengandung nama OS atau sebaliknya.
            $cocok = stripos($namaOs, $nama) !== false || stripos($nama, $namaOs) !== false;
            if (! $cocok) {
                continue;
            }
            $hasil['ada'] = true;
            if (preg_match('/^Default=(.+)$/mi', $bagian, $d)) {
                $hasil['default'] = strtoupper(trim($d[1])) === 'TRUE';
            }
            if (preg_match('/^WorkOffline=(.+)$/mi', $bagian, $w)) {
                $hasil['offline'] = strtoupper(trim($w[1])) === 'TRUE';
            }
            break;
        }

        return $hasil;
    }
}
