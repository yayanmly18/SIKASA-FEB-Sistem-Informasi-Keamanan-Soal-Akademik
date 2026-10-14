<?php

namespace App\Http\Controllers;

use App\Models\Printer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrinterController extends Controller
{
    /** Cache hasil scan Windows per request (wmic cukup mahal). */
    private ?array $windowsCache = null;

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
     * Daftar printer lengkap untuk halaman Admin IT (alamat + status Windows
     * + jumlah job tercatat) — dasar layar "Kelola Printer".
     */
    public function index(): JsonResponse
    {
        $printers = Printer::withCount('logCetak')->orderBy('id')->get()->map(function (Printer $p) {
            $cek = $this->cekWindows($p->nama_printer);

            return [
                'id' => $p->id,
                'nama_printer' => $p->nama_printer,
                'alamat_printer' => $p->alamat_printer,
                'lokasi' => $p->lokasi,
                'status_db' => $p->status,
                'ada_di_windows' => $cek['ada'],
                'offline' => $cek['offline'],
                'online' => $p->status === 'aktif' && $cek['ada'] && ! $cek['offline'],
                'jumlah_cetak' => (int) $p->log_cetak_count,
            ];
        });

        return response()->json(['data' => $printers]);
    }

    /**
     * Tambah printer baru (Admin IT). Nama printer disarankan sama persis
     * dengan yang terdaftar di Windows Server agar deteksi status akurat.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $this->validasiAtur($request);

        $printer = Printer::create([
            'nama_printer' => $data['nama_printer'],
            'alamat_printer' => $data['alamat_printer'],
            'lokasi' => $data['lokasi'] ?? null,
            'status' => 'aktif',
        ]);

        return response()->json([
            'message' => "Printer {$printer->nama_printer} ditambahkan.",
            'data' => $printer,
        ], 201);
    }

    /**
     * Ubah data printer (Admin IT) — mis. menyamakan nama dengan Windows.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $printer = Printer::findOrFail($id);
        $data = $this->validasiAtur($request);

        $printer->update([
            'nama_printer' => $data['nama_printer'],
            'alamat_printer' => $data['alamat_printer'],
            'lokasi' => $data['lokasi'] ?? null,
        ]);

        return response()->json([
            'message' => "Printer {$printer->nama_printer} diperbarui.",
            'data' => $printer,
        ]);
    }

    /**
     * Aktif/nonaktifkan printer (Admin IT). Printer aktif dipakai sebagai
     * tujuan cetak bila petugas tidak memilih printer secara spesifik.
     */
    public function toggle(int $id): JsonResponse
    {
        $printer = Printer::findOrFail($id);

        $printer->update([
            'status' => $printer->status === 'aktif' ? 'nonaktif' : 'aktif',
        ]);

        return response()->json([
            'message' => $printer->status === 'aktif'
                ? "Printer {$printer->nama_printer} diaktifkan."
                : "Printer {$printer->nama_printer} dinonaktifkan.",
            'data' => $printer,
        ]);
    }

    /**
     * Hapus printer (Admin IT). Ditolak bila sudah ada job cetak tercatat
     * agar riwayat log tetap utuh — nonaktifkan saja sebagai gantinya.
     */
    public function destroy(int $id): JsonResponse
    {
        $printer = Printer::findOrFail($id);

        if ($printer->logCetak()->exists()) {
            return response()->json([
                'message' => 'Printer memiliki riwayat cetak sehingga tidak bisa dihapus. Nonaktifkan saja agar log tetap utuh.',
            ], 422);
        }

        $printer->delete();

        return response()->json([
            'message' => "Printer {$printer->nama_printer} dihapus.",
        ]);
    }

    /**
     * Scan otomatis printer yang dikenal Windows Server (USB & jaringan —
     * persis yang tampil di Devices and Printers). Hasil dicocokkan dengan
     * database agar admin tinggal klik "Daftarkan" / "Samakan nama".
     */
    public function scan(): JsonResponse
    {
        $terdaftar = Printer::pluck('id', 'nama_printer');

        $scan = collect($this->daftarPrinterWindows())->map(function (array $p) use ($terdaftar) {
            $cocokId = null;
            $persis = false;

            // Kecocokan persis dulu (case-insensitive), baru longgar dua arah.
            foreach ($terdaftar as $id => $namaDb) {
                if (strcasecmp($p['nama'], $namaDb) === 0) {
                    $cocokId = (int) $id;
                    $persis = true;
                    break;
                }
            }
            if ($cocokId === null) {
                foreach ($terdaftar as $id => $namaDb) {
                    if (stripos($p['nama'], $namaDb) !== false || stripos($namaDb, $p['nama']) !== false) {
                        $cocokId = (int) $id;
                        break;
                    }
                }
            }

            return [
                'nama_windows' => $p['nama'],
                'port' => $p['port'],
                'default' => $p['default'],
                'offline' => $p['offline'],
                'sudah_terdaftar' => $cocokId !== null,
                'nama_persis' => $persis,
                'printer_id' => $cocokId,
            ];
        })->values();

        return response()->json([
            'data' => $scan,
            'server_windows' => PHP_OS_FAMILY === 'Windows',
        ]);
    }

    /**
     * Validasi bersama untuk store/update — nama & alamat wajib, lokasi opsional.
     */
    private function validasiAtur(Request $request): array
    {
        return $request->validate([
            'nama_printer' => ['required', 'string', 'max:100'],
            'alamat_printer' => ['required', 'string', 'max:255'],
            'lokasi' => ['nullable', 'string', 'max:150'],
        ], [
            'nama_printer.required' => 'Nama printer wajib diisi.',
            'alamat_printer.required' => 'Alamat printer wajib diisi (mis. socket://192.168.1.50:9100).',
        ]);
    }

    /**
     * Daftar SEMUA printer yang dikenal Windows (termasuk USB & jaringan).
     * Hasil di-cache per request karena wmic cukup mahal; dipakai cekWindows
     * dan scan(). Kosong bila bukan Windows / gagal.
     */
    private function daftarPrinterWindows(): array
    {
        if ($this->windowsCache !== null) {
            return $this->windowsCache;
        }

        $hasil = [];

        if (PHP_OS_FAMILY !== 'Windows') {
            return $this->windowsCache = $hasil;
        }

        $out = [];
        @exec('wmic printer get name,default,workoffline,portname /format:list 2>&1', $out);
        $blok = implode("\n", $out);

        // Pecah per printer (blok dipisah baris kosong).
        foreach (preg_split('/\R{2,}/', $blok) as $bagian) {
            if (! preg_match('/^Name=(.+)$/mi', $bagian, $m)) {
                continue;
            }
            $item = [
                'nama' => trim($m[1]),
                'default' => false,
                'offline' => true,
                'port' => null,
            ];
            if (preg_match('/^Default=(.+)$/mi', $bagian, $d)) {
                $item['default'] = strtoupper(trim($d[1])) === 'TRUE';
            }
            if (preg_match('/^WorkOffline=(.+)$/mi', $bagian, $w)) {
                $item['offline'] = strtoupper(trim($w[1])) === 'TRUE';
            }
            if (preg_match('/^PortName=(.+)$/mi', $bagian, $pt)) {
                $item['port'] = trim($pt[1]);
            }
            $hasil[] = $item;
        }

        return $this->windowsCache = $hasil;
    }

    /**
     * Cek printer di Windows via daftar printer OS (cocok nama persis /
     * mengandung). Non-Windows / gagal cek = dianggap tidak ada (offline)
     * agar UI jujur.
     */
    private function cekWindows(string $nama): array
    {
        $hasil = ['ada' => false, 'default' => false, 'offline' => true];

        foreach ($this->daftarPrinterWindows() as $p) {
            // Cocok longgar: nama DB mengandung nama OS atau sebaliknya.
            $cocok = stripos($p['nama'], $nama) !== false || stripos($nama, $p['nama']) !== false;
            if (! $cocok) {
                continue;
            }
            $hasil = [
                'ada' => true,
                'default' => $p['default'],
                'offline' => $p['offline'],
            ];
            break;
        }

        return $hasil;
    }
}
