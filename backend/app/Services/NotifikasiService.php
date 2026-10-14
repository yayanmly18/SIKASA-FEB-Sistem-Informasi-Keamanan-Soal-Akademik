<?php

namespace App\Services;

use App\Models\Notifikasi;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class NotifikasiService
{
    /**
     * Kirim notifikasi ke SATU pengguna.
     */
    public static function keUser(int $userId, string $judul, string $pesan, string $tipe = 'info', ?string $tautan = null): void
    {
        Notifikasi::create([
            'user_id' => $userId,
            'judul' => $judul,
            'pesan' => $pesan,
            'tipe' => $tipe,
            'tautan' => $tautan,
        ]);
    }

    /**
     * Kirim notifikasi ke semua pengguna aktif dengan peran tertentu.
     *
     * @param  array<int, string>  $roles
     */
    public static function keRoles(array $roles, string $judul, string $pesan, string $tipe = 'info', ?string $tautan = null): void
    {
        $ids = User::whereIn('role', $roles)->where('is_active', true)->pluck('id');

        $rows = $ids->map(fn ($id) => [
            'user_id' => $id,
            'judul' => $judul,
            'pesan' => $pesan,
            'tipe' => $tipe,
            'tautan' => $tautan,
            'dibaca' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ])->all();

        if ($rows !== []) {
            DB::table('notifikasi')->insert($rows);
        }
    }
}
