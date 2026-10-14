<?php

namespace App\Http\Controllers;

use App\Models\MataKuliah;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MataKuliahController extends Controller
{
    /**
     * Daftar mata kuliah (untuk dropdown upload soal).
     */
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'data' => MataKuliah::orderBy('kode_mk')->get()->map(fn (MataKuliah $m) => $this->transform($m)),
        ]);
    }

    /**
     * Tambah mata kuliah (Kaprodi / Admin IT).
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'kode_mk' => ['required', 'string', 'max:30', 'unique:mata_kuliah,kode_mk'],
            'nama_mk' => ['required', 'string', 'max:150'],
            'kelas' => ['required', 'string', 'max:50'],
            'semester' => ['required', 'integer', 'min:1', 'max:14'],
            'tahun_ajaran' => ['required', 'string', 'max:20'],
        ], [
            'semester.min' => 'Semester minimal 1.',
            'semester.max' => 'Semester maksimal 14.',
        ]);

        $mk = MataKuliah::create($data);

        ActivityLogger::log('tambah_mata_kuliah', ['mk_id' => $mk->id, 'kode_mk' => $mk->kode_mk], null, $request->user());

        return response()->json([
            'message' => 'Mata kuliah berhasil ditambahkan.',
            'data' => $this->transform($mk),
        ], 201);
    }

    /**
     * Ubah data mata kuliah (Kaprodi / Admin IT).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $mk = MataKuliah::findOrFail($id);

        $data = $request->validate([
            'kode_mk' => ['required', 'string', 'max:30', Rule::unique('mata_kuliah', 'kode_mk')->ignore($mk->id)],
            'nama_mk' => ['required', 'string', 'max:150'],
            'kelas' => ['required', 'string', 'max:50'],
            'semester' => ['required', 'integer', 'min:1', 'max:14'],
            'tahun_ajaran' => ['required', 'string', 'max:20'],
        ], [
            'semester.min' => 'Semester minimal 1.',
            'semester.max' => 'Semester maksimal 14.',
        ]);

        $mk->update($data);

        ActivityLogger::log('ubah_mata_kuliah', ['mk_id' => $mk->id, 'kode_mk' => $mk->kode_mk], null, $request->user());

        return response()->json([
            'message' => 'Mata kuliah berhasil diperbarui.',
            'data' => $this->transform($mk),
        ]);
    }

    /**
     * Hapus mata kuliah (Kaprodi / Admin IT).
     *
     * Ditolak bila masih ada soal terkait: FK bank_soal.mk_id memakai
     * cascadeOnDelete, sehingga penghapusan kasar akan ikut membuang soal.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $mk = MataKuliah::findOrFail($id);

        if ($mk->bankSoal()->exists()) {
            return response()->json([
                'message' => 'Mata kuliah masih memiliki soal terkait dan tidak dapat dihapus.',
            ], 422);
        }

        // Relasi pivot dosen_mata_kuliah ikut cascade, cukup lepas aman di sini.
        $mk->dosen()->detach();
        $mk->delete();

        ActivityLogger::log('hapus_mata_kuliah', ['mk_id' => $id], null, $request->user());

        return response()->json(['message' => 'Mata kuliah berhasil dihapus.']);
    }

    /**
     * Bentuk respons standar untuk satu mata kuliah.
     */
    private function transform(MataKuliah $m): array
    {
        return [
            'id' => $m->id,
            'kode_mk' => $m->kode_mk,
            'nama_mk' => $m->nama_mk,
            'kelas' => $m->kelas,
            'semester' => $m->semester,
            'tahun_ajaran' => $m->tahun_ajaran,
        ];
    }
}
