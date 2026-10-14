<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogAktivitas extends Model
{
    use HasFactory;

    protected $table = 'log_aktivitas';

    // Tabel audit append-only: hanya kolom "waktu" (useCurrent), tanpa created_at/updated_at.
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'aksi',
        'bank_soal_id',
        'detail',
        'ip_address',
        'user_agent',
        'waktu',
    ];

    protected $casts = [
        'detail' => 'array',
        'waktu' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function bankSoal(): BelongsTo
    {
        return $this->belongsTo(BankSoal::class, 'bank_soal_id');
    }
}
