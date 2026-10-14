<?php

namespace App\Http\Controllers;

use App\Models\Notifikasi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotifikasiController extends Controller
{
    /**
     * Daftar notifikasi untuk pengguna yang sedang login (terbaru dulu).
     */
    public function index(Request $request): JsonResponse
    {
        $items = Notifikasi::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(fn (Notifikasi $n) => [
                'id' => $n->id,
                'judul' => $n->judul,
                'pesan' => $n->pesan,
                'tipe' => $n->tipe,
                'tautan' => $n->tautan,
                'dibaca' => $n->dibaca,
                'waktu' => optional($n->created_at)->diffForHumans(),
            ]);

        return response()->json([
            'data' => $items,
            'belum_dibaca' => Notifikasi::where('user_id', $request->user()->id)->where('dibaca', false)->count(),
        ]);
    }

    /**
     * Tandai satu notifikasi sudah dibaca (hanya milik pengguna ini).
     */
    public function baca(Request $request, int $id): JsonResponse
    {
        Notifikasi::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->update(['dibaca' => true]);

        return response()->json(['message' => 'Notifikasi ditandai dibaca.']);
    }

    /**
     * Tandai semua notifikasi pengguna ini sudah dibaca.
     */
    public function bacaSemua(Request $request): JsonResponse
    {
        Notifikasi::where('user_id', $request->user()->id)
            ->where('dibaca', false)
            ->update(['dibaca' => true]);

        return response()->json(['message' => 'Semua notifikasi ditandai dibaca.']);
    }
}
