<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Daftar pengguna (Kaprodi & Admin IT).
     */
    public function index(Request $request): JsonResponse
    {
        $users = User::orderBy('nama')->get()->map(fn (User $u) => [
            'id' => $u->id,
            'nidn' => $u->nidn,
            'nama' => $u->nama,
            'email' => $u->email,
            'role' => $u->role,
            'is_active' => $u->is_active,
            'last_login_at' => optional($u->last_login_at)->format('d M Y H:i'),
        ]);

        return response()->json(['data' => $users]);
    }

    /**
     * Tambah pengguna baru.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nidn' => ['nullable', 'string', 'max:30', 'unique:users,nidn'],
            'nama' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'role' => ['required', Rule::in(User::ROLES)],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $pinAwal = $data['role'] === 'kaprodi' ? self::generatePin() : null;

        $user = User::create([
            'nidn' => $data['nidn'] ?? null,
            'nama' => $data['nama'],
            'email' => $data['email'],
            'role' => $data['role'],
            'password' => $data['password'],
            // Kaprodi langsung diberi PIN Cetak awal (6 digit acak, ter-hash)
            // agar alur percetakan siap tanpa langkah tambahan.
            'pin_cetak' => $pinAwal,
            'is_active' => true,
        ]);

        ActivityLogger::log('tambah_user', ['user_id' => $user->id, 'role' => $user->role], null, $request->user());

        return response()->json([
            'message' => 'Pengguna berhasil ditambahkan.',
            'data' => $user->only(['id', 'nama', 'email', 'role', 'is_active']),
            // PIN awal kaprodi hanya dikembalikan SEKALI di respons ini
            // (tidak bisa diambil lagi setelah di-hash) agar Admin IT bisa
            // menyampaikannya kepada Kaprodi.
            'pin_cetak' => $pinAwal,
        ], 201);
    }

    /**
     * Ubah data profil pengguna (nama, email, NIDN, role).
     *
     * Password sengaja tidak disini — gunakan resetPassword agar tercatat
     * sebagai aksi tersendiri.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'nidn' => ['nullable', 'string', 'max:30', Rule::unique('users', 'nidn')->ignore($user->id)],
            'nama' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', Rule::in(User::ROLES)],
        ]);

        $user->update([
            'nidn' => $data['nidn'] ?? null,
            'nama' => $data['nama'],
            'email' => $data['email'],
            'role' => $data['role'],
        ]);

        ActivityLogger::log('ubah_user', ['user_id' => $user->id, 'role' => $user->role], null, $request->user());

        return response()->json([
            'message' => 'Data pengguna berhasil diperbarui.',
            'data' => $user->only(['id', 'nidn', 'nama', 'email', 'role', 'is_active']),
        ]);
    }

    /**
     * Aktif / nonaktifkan pengguna.
     */
    public function toggle(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        abort_if($user->id === $request->user()->id, 422, 'Anda tidak dapat menonaktifkan akun sendiri.');

        $user->update(['is_active' => ! $user->is_active]);

        ActivityLogger::log('ubah_status_user', ['user_id' => $user->id, 'is_active' => $user->is_active], null, $request->user());

        return response()->json([
            'message' => $user->is_active ? 'Pengguna diaktifkan.' : 'Pengguna dinonaktifkan.',
            'data' => $user->only(['id', 'nama', 'email', 'role', 'is_active']),
        ]);
    }

    /**
     * Reset password pengguna (tercatat di log).
     */
    public function resetPassword(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::findOrFail($id);
        $user->update(['password' => $data['password']]);

        ActivityLogger::log('reset_password', ['user_id' => $user->id], null, $request->user());

        return response()->json(['message' => 'Password pengguna berhasil direset.']);
    }

    /**
     * Reset PIN Cetak HARIAN (hanya relevan untuk kaprodi).
     * PIN baru 6 digit acak, di-hash, berlaku hari ini saja (pin_cetak_at),
     * dan dikembalikan SEKALI kepada pemanggil.
     * Kaprodi hanya boleh reset PIN miliknya sendiri; Admin IT boleh reset
     * PIN kaprodi mana pun.
     */
    public function resetPin(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        abort_if($user->role !== 'kaprodi', 422, 'PIN Cetak hanya berlaku untuk Kaprodi.');

        $peminta = $request->user();
        if ($peminta->role === 'kaprodi' && $peminta->id !== $user->id) {
            abort(403, 'Kaprodi hanya dapat mereset PIN Cetak miliknya sendiri.');
        }

        $pin = self::generatePin();
        $user->update(['pin_cetak' => $pin, 'pin_cetak_at' => now()]);

        ActivityLogger::log('reset_pin_cetak', ['user_id' => $user->id], null, $request->user());

        return response()->json([
            'message' => "PIN Cetak {$user->nama} berhasil direset. Berlaku hari ini saja.",
            'pin_cetak' => $pin,
            'berlaku_sampai' => now()->timezone('Asia/Jakarta')->endOfDay()->format('d M Y H:i'),
        ]);
    }

    /**
     * Menghasilkan PIN Cetak 6 digit acak (plaintext; dikembalikan sekali
     * lalu disimpan ter-hash oleh cast model).
     */
    private static function generatePin(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}
