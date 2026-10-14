<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MataKuliah extends Model
{
    use HasFactory;

    protected $table = 'mata_kuliah';

    protected $fillable = [
        'kode_mk',
        'nama_mk',
        'kelas',
        'semester',
        'tahun_ajaran',
    ];

    protected $casts = [
        'semester' => 'integer',
    ];

    public function dosen(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'dosen_mata_kuliah', 'mk_id', 'dosen_id');
    }

    public function bankSoal(): HasMany
    {
        return $this->hasMany(BankSoal::class, 'mk_id');
    }
}
