<?php

namespace App\Http\Controllers;

use App\Models\BankSoal;
use App\Services\ActivityLogger;
use App\Services\FileProtectionService;
use App\Services\NotifikasiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class BankSoalController extends Controller
{
    public function __construct(
        private readonly FileProtectionService $files,
    ) {}

    /**
     * Daftar soal untuk Dosen: hanya miliknya sendiri.
     */
    public function index(Request $request): JsonResponse
    {
        $soal = BankSoal::with(['mataKuliah'])
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (BankSoal $s) => $this->transform($s));

        return response()->json(['data' => $soal]);
    }

    /**
     * Rekap untuk Kaprodi: siapa sudah/belum upload per mata kuliah.
     */
    public function rekap(Request $request): JsonResponse
    {
        $rekap = DB::table('mata_kuliah')
            ->leftJoin('bank_soal', 'bank_soal.mk_id', '=', 'mata_kuliah.id')
            ->leftJoin('users', 'users.id', '=', 'bank_soal.user_id')
            ->select(
                'mata_kuliah.id as mk_id',
                'mata_kuliah.kode_mk',
                'mata_kuliah.nama_mk',
                'mata_kuliah.kelas',
                'users.nama as dosen',
                'bank_soal.id as bank_soal_id',
                'bank_soal.status',
                'bank_soal.jenis',
                'bank_soal.jadwal_ujian',
            )
            ->orderBy('mata_kuliah.kode_mk')
            ->get()
            ->map(fn ($row) => [
                'mk_id' => $row->mk_id,
                'kode_mk' => $row->kode_mk,
                'nama_mk' => $row->nama_mk,
                'kelas' => $row->kelas,
                'dosen' => $row->dosen,
                'bank_soal_id' => $row->bank_soal_id,
                'status' => $row->bank_soal_id ? ($row->status ?? 'terkunci') : 'belum_upload',
                'jenis' => $row->jenis,
                'jadwal_ujian' => $row->jadwal_ujian,
            ]);

        return response()->json(['data' => $rekap]);
    }

    /**
     * Langkah 1 — Dosen upload PDF final + isi data, lalu klik KUNCI.
     * File otomatis di-rename acak & dienkripsi (FileProtectionService).
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'mk_id' => ['required', 'integer', 'exists:mata_kuliah,id'],
            'jenis' => ['required', Rule::in(['UTS', 'UAS'])],
            'judul' => ['required', 'string', 'max:200'],
            'jumlah_mahasiswa' => ['required', 'integer', 'min:1', 'max:500'],
            'jadwal_ujian' => ['required', 'date'],
            'file' => ['required', 'file', 'mimetypes:application/pdf', 'max:10240'],
        ]);

        $stored = $this->files->storeEncrypted($request->file('file'));
        $waktuMulai = $this->files->hitungWaktuMulaiCetak(
            new \DateTime($data['jadwal_ujian']),
        );

        $soal = BankSoal::create([
            'user_id' => $request->user()->id,
            'mk_id' => $data['mk_id'],
            'jenis' => $data['jenis'],
            'judul' => $data['judul'],
            'file_path' => $stored['file_path'],
            'original_filename' => $stored['original_filename'],
            'file_hash' => $stored['file_hash'],
            'status' => 'terkunci',
            'jumlah_mahasiswa' => $data['jumlah_mahasiswa'],
            'jadwal_ujian' => $data['jadwal_ujian'],
            'waktu_mulai_cetak' => $waktuMulai,
            'dikunci_pada' => now(),
        ]);

        ActivityLogger::log('upload', [
            'file' => $stored['file_path'],
            'mk_id' => $data['mk_id'],
            'jenis' => $data['jenis'],
        ], $soal->id, $request->user());

        $mk = $soal->mataKuliah;
        NotifikasiService::keRoles(
            ['kaprodi'],
            'Soal baru diunggah',
            "{$request->user()->nama} mengunggah soal {$data['jenis']} untuk {$mk?->nama_mk}. Menunggu pembukaan cetak.",
            'sukses',
            'Rekap Soal',
        );

        return response()->json([
            'message' => 'Soal berhasil dienkripsi dan dikunci.',
            'data' => $this->transform($soal->load('mataKuliah')),
        ], 201);
    }

    /**
     * Kaprodi membuka jendela cetak sebuah soal (terkunci -> siap_cetak).
     */
    public function bukaCetak(Request $request, int $id): JsonResponse
    {
        $soal = BankSoal::findOrFail($id);

        if ($soal->status !== 'terkunci') {
            return response()->json([
                'message' => 'Hanya soal terkunci yang bisa dibuka untuk cetak.',
            ], 422);
        }

        $soal->update(['status' => 'siap_cetak']);

        ActivityLogger::log('buka_cetak', ['bank_soal_id' => $soal->id], $soal->id, $request->user());

        // Beritahu TU/panitia agar segera mengambil soal di Antrian Cetak.
        NotifikasiService::keRoles(
            ['panitia'],
            'Soal siap dicetak',
            "{$request->user()->nama} membuka cetak soal {$soal->mataKuliah?->nama_mk}. Soal menunggu di Antrian Cetak.",
            'info',
            'Antrian Cetak',
        );

        // Beritahu dosen pemilik bahwa soalnya lolos dan siap dicetak.
        if ($soal->user_id) {
            NotifikasiService::keUser(
                $soal->user_id,
                'Soal disetujui untuk dicetak',
                "Soal {$soal->mataKuliah?->nama_mk} telah dibuka jendela cetaknya oleh Kaprodi dan siap dicetak.",
                'sukses',
                'Soal Saya',
            );
        }

        return response()->json([
            'message' => 'Soal dibuka untuk dicetak.',
            'data' => $this->transform($soal->fresh('mataKuliah')),
        ]);
    }

    private function transform(BankSoal $s): array
    {
        return [
            'id' => $s->id,
            'kode_mk' => $s->mataKuliah?->kode_mk,
            'nama_mk' => $s->mataKuliah?->nama_mk,
            'kelas' => $s->mataKuliah?->kelas,
            'jenis' => $s->jenis,
            'judul' => $s->judul,
            'status' => $s->status,
            'jumlah_mahasiswa' => $s->jumlah_mahasiswa,
            'jadwal_ujian' => optional($s->jadwal_ujian)->format('Y-m-d H:i'),
            'waktu_mulai_cetak' => optional($s->waktu_mulai_cetak)->format('Y-m-d H:i'),
            'file_path' => $s->file_path,
        ];
    }
}
