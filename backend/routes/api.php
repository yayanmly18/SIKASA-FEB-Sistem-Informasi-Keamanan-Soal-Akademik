<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BankSoalController;
use App\Http\Controllers\CetakController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\MataKuliahController;
use App\Http\Controllers\NotifikasiController;
use App\Http\Controllers\PengingatController;
use App\Http\Controllers\PrinterController;
use App\Http\Controllers\RevisiController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — SIKASA FEB (Sistem Informasi Keamanan Soal Akademik)
|--------------------------------------------------------------------------
| Autentikasi: Laravel Sanctum (Bearer Token). Setiap peran dibatasi dengan
| middleware 'role:...' (CheckRole).
*/

// --- Publik: login ---
Route::post('/login', [AuthController::class, 'login']);

// --- Terautentikasi ---
Route::middleware('auth:sanctum')->group(function () {
    // Auth & profil
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard (semua peran, isi disesuaikan)
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Mata kuliah (referensi dropdown; CRUD oleh Kaprodi & Admin IT)
    Route::get('/mata-kuliah', [MataKuliahController::class, 'index']);
    Route::middleware('role:kaprodi,admin_it')->group(function () {
        Route::post('/mata-kuliah', [MataKuliahController::class, 'store']);
        Route::put('/mata-kuliah/{id}', [MataKuliahController::class, 'update']);
        Route::delete('/mata-kuliah/{id}', [MataKuliahController::class, 'destroy']);
    });

    // --- Dosen ---
    Route::middleware('role:dosen')->group(function () {
        Route::get('/soal-saya', [BankSoalController::class, 'index']);
        Route::post('/soal', [BankSoalController::class, 'store']);
        Route::post('/soal/{id}/revisi', [RevisiController::class, 'store']);
    });

    // --- Kaprodi ---
    Route::middleware('role:kaprodi')->group(function () {
        Route::get('/rekap', [BankSoalController::class, 'rekap']);
        Route::post('/soal/{id}/buka-cetak', [BankSoalController::class, 'bukaCetak']);
        Route::get('/revisi', [RevisiController::class, 'index']);
        Route::patch('/revisi/{id}', [RevisiController::class, 'putuskan']);
        Route::get('/log/cetak', [LogController::class, 'cetak']);
        Route::post('/pengingat/kirim', [PengingatController::class, 'kirim']);
        Route::get('/laporan/berita-acara', [LaporanController::class, 'beritaAcara']);
    });

    // --- Panitia / TU (cetak saja, tanpa download) ---
    Route::middleware('role:panitia')->group(function () {
        Route::get('/antrian-cetak', [CetakController::class, 'antrian']);
        Route::post('/cetak/{id}', [CetakController::class, 'cetak']);
        Route::get('/printer-status', [PrinterController::class, 'status']);
    });

    // --- Log aktivitas (semua peran melihat miliknya sesuai controller) ---
    Route::get('/log/aktivitas', [LogController::class, 'aktivitas']);

    // --- Notifikasi (semua peran, milik sendiri) ---
    // Catatan: rute statis "baca-semua" harus sebelum rute {id} agar tidak
    // tertangkap sebagai parameter id.
    Route::get('/notifikasi', [NotifikasiController::class, 'index']);
    Route::patch('/notifikasi/baca-semua', [NotifikasiController::class, 'bacaSemua']);
    Route::patch('/notifikasi/{id}/baca', [NotifikasiController::class, 'baca']);

    // --- Manajemen User (Kaprodi & Admin IT) ---
    Route::middleware('role:kaprodi,admin_it')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::patch('/users/{id}/toggle', [UserController::class, 'toggle']);
        Route::post('/users/{id}/reset-password', [UserController::class, 'resetPassword']);
        Route::post('/users/{id}/reset-pin', [UserController::class, 'resetPin']);
    });
});

