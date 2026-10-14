<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PengaturanSistem extends Model
{
    use HasFactory;

    protected $table = 'pengaturan_sistem';

    protected $fillable = [
        'nama_pengaturan',
        'nilai',
        'deskripsi',
        'updated_by',
    ];

    public function pengubah(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public static function get(string $key, ?string $default = null): ?string
    {
        $row = static::where('nama_pengaturan', $key)->first();

        return $row?->nilai ?? $default;
    }
}
