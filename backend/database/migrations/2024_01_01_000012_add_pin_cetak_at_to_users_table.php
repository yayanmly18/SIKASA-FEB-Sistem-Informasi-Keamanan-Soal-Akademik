<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Penanda waktu reset/terbit PIN Cetak — dasar kedaluwarsa HARIAN.
     * PIN hanya berlaku di hari kalender yang sama dengan pin_cetak_at
     * (zona Asia/Jakarta); besoknya wajib reset ulang.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('pin_cetak_at')->nullable()->after('pin_cetak');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('pin_cetak_at');
        });
    }
};
