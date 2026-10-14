<?php

namespace App\Services;

use App\Models\LogAktivitas;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityLogger
{
    /**
     * Catat setiap aktivitas penting ke tabel log_aktivitas (anti bocor).
     */
    public static function log(
        string $aksi,
        array $detail = [],
        ?int $bankSoalId = null,
        ?User $user = null,
        ?Request $request = null,
    ): LogAktivitas {
        $user = $user ?? Auth::user();
        $request = $request ?? request();

        return LogAktivitas::create([
            'user_id' => $user?->id,
            'aksi' => $aksi,
            'bank_soal_id' => $bankSoalId,
            'detail' => $detail ?: null,
            'ip_address' => $request?->ip(),
            'user_agent' => substr((string) $request?->userAgent(), 0, 500),
            'waktu' => now(),
        ]);
    }
}
