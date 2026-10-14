<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BankSoal extends Model
{
    use HasFactory;

    protected $table = 'bank_soal';

    protected $fillable = [
        'user_id',
        'mk_id',
        'jenis',
        'judul',
        'file_path',
        'original_filename',
        'file_hash',
        'status',
        'jumlah_mahasiswa',
        'jadwal_ujian',
        'waktu_mulai_cetak',
        'dikunci_pada',
        'arsip_pada',
    ];

    protected $casts = [
        'jadwal_ujian' => 'datetime',
        'waktu_mulai_cetak' => 'datetime',
        'dikunci_pada' => 'datetime',
        'arsip_pada' => 'datetime',
        'jumlah_mahasiswa' => 'integer',
    ];

    public function dosen(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function mataKuliah(): BelongsTo
    {
        return $this->belongsTo(MataKuliah::class, 'mk_id');
    }

    public function revisi(): HasMany
    {
        return $this->hasMany(RevisiSoal::class, 'bank_soal_id');
    }

    public function logCetak(): HasMany
    {
        return $this->hasMany(LogCetak::class, 'bank_soal_id');
    }

    public function isTerbukaUntukCetak(): bool
    {
        return $this->status === 'siap_cetak'
            && $this->waktu_mulai_cetak !== null
            && now()->greaterThanOrEqualTo($this->waktu_mulai_cetak);
    }
}
