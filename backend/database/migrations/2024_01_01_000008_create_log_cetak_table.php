<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('log_cetak', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_soal_id')->constrained('bank_soal')->cascadeOnDelete();
            $table->foreignId('dicetak_oleh')->constrained('users')->cascadeOnDelete();
            $table->foreignId('disetujui_oleh')->constrained('users')->cascadeOnDelete();
            $table->foreignId('printer_id')->constrained('printer')->cascadeOnDelete();
            $table->unsignedInteger('jumlah_cetak');
            $table->enum('status', ['menunggu', 'diproses', 'berhasil', 'gagal'])->default('menunggu');
            $table->string('job_id', 150)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->dateTime('waktu_cetak')->useCurrent();
            $table->text('keterangan')->nullable();
            $table->timestamps();

            $table->index('waktu_cetak');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('log_cetak');
    }
};
