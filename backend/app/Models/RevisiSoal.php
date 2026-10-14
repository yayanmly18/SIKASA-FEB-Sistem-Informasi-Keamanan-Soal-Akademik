<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RevisiSoal extends Model
{
    use HasFactory;

    protected $table = 'revisi_soal';

    protected $fillable = [
        'bank_soal_id',
        'diajukan_oleh',
        'file_path',
        'alasan_revisi',
        'status',
        'diputuskan_oleh',
        'catatan_persetujuan',
        'diajukan_pada',
        'diputuskan_pada',
    ];

    protected $casts = [
        'diajukan_pada' => 'datetime',
        'diputuskan_pada' => 'datetime',
    ];

    public function bankSoal(): BelongsTo
    {
        return $this->belongsTo(BankSoal::class, 'bank_soal_id');
    }

    public function pengaju(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diajukan_oleh');
    }

    public function penentu(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diputuskan_oleh');
    }
}
