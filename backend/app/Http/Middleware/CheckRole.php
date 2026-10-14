<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    /**
     * Batasi akses route berdasarkan peran pengguna.
     * Contoh: ->middleware('role:dosen,kaprodi')
     */
    public function handle(Request $request, Closure $next, string ...$roles)
    {
        $user = $request->user();

        if (! $user || ! $user->is_active) {
            return response()->json([
                'message' => 'Tidak terautentikasi.',
            ], 401);
        }

        if (! empty($roles) && ! in_array($user->role, $roles, true)) {
            return response()->json([
                'message' => 'Akses ditolak. Peran Anda tidak memiliki kewenangan untuk tindakan ini.',
                'role_anda' => $user->role,
            ], 403);
        }

        return $next($request);
    }
}
