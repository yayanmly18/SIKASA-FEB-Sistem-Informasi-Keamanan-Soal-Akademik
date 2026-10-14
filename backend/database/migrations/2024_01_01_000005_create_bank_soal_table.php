<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bank_soal', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('mk_id')->constrained('mata_kuliah')->cascadeOnDelete();
            $table->enum('jenis', ['UTS', 'UAS']);
            $table->string('judul', 200);
            $table->string('file_path', 500);
            $table->string('original_filename', 255);
            $table->char('file_hash', 64)->nullable();
            $table->enum('status', ['terkunci', 'siap_cetak', 'arsip'])->default('terkunci');
            $table->unsignedInteger('jumlah_mahasiswa')->default(0);
            $table->dateTime('jadwal_ujian');
            $table->dateTime('waktu_mulai_cetak')->nullable();
            $table->dateTime('dikunci_pada')->nullable();
            $table->dateTime('arsip_pada')->nullable();
            $table->timestamps();

            $table->index('jadwal_ujian');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_soal');
    }
};
