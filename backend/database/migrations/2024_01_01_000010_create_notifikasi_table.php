<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifikasi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->comment('Penerima notifikasi')->constrained('users')->cascadeOnDelete();
            $table->string('judul', 150);
            $table->text('pesan');
            $table->string('tipe', 30)->default('info'); // info | sukses | peringatan | bahaya
            $table->string('tautan', 255)->nullable();   // halaman tujuan di UI
            $table->boolean('dibaca')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'dibaca']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifikasi');
    }
};
