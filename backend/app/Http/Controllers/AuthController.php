<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login — terima email + password, kembalikan token Sanctum + profil.
     */
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            ActivityLogger::log('login_gagal', ['email' => $data['email']], null);

            throw ValidationException::withMessages([
                'email' => ['Email atau kata sandi tidak sesuai.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Akun Anda tidak aktif. Hubungi Admin IT.'],
            ]);
        }

        $user->forceFill(['last_login_at' => now()])->save();
        $token = $user->createToken('ebrankas-api')->plainTextToken;

        ActivityLogger::log('login', ['role' => $user->role], null, $user);

        return response()->json([
            'message' => 'Login berhasil.',
            'token' => $token,
            'user' => $this->profile($user),
        ]);
    }

    /**
     * Logout — cabut token saat ini.
     */
    public function logout(Request $request): JsonResponse
    {
        ActivityLogger::log('logout', [], null, $request->user());

        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil.']);
    }

    /**
     * Profil pengguna yang sedang login.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $this->profile($request->user())]);
    }

    private function profile(User $user): array
    {
        return [
            'id' => $user->id,
            'nidn' => $user->nidn,
            'nama' => $user->nama,
            'email' => $user->email,
            'role' => $user->role,
            'is_active' => $user->is_active,
        ];
    }
}
