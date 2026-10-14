<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('printer', function (Blueprint $table) {
            $table->id();
            $table->string('nama_printer', 100);
            $table->string('alamat_printer', 255);
            $table->string('lokasi', 150)->nullable();
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('printer');
    }
};
