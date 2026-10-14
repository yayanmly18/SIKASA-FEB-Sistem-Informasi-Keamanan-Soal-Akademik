<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * PIN Cetak — otorisasi percetakan HARIAN yang TERPISAH dari password login.
     * Disimpan ter-hash; hanya diisi untuk akun berperan kaprodi.
     * pin_cetak_at menandai hari terbit; PIN kemarin otomatis kedaluwarsa.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('pin_cetak', 255)->nullable()->after('password');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('pin_cetak');
        });
    }
};