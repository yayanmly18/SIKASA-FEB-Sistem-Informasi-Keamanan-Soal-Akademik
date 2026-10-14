<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogCetak extends Model
{
    use HasFactory;

    protected $table = 'log_cetak';

    protected $fillable = [
        'bank_soal_id',
        'dicetak_oleh',
        'disetujui_oleh',
        'printer_id',
        'jumlah_cetak',
        'status',
        'job_id',
        'ip_address',
        'waktu_cetak',
        'keterangan',
    ];

    protected $casts = [
        'waktu_cetak' => 'datetime',
        'jumlah_cetak' => 'integer',
    ];

    public function bankSoal(): BelongsTo
    {
        return $this->belongsTo(BankSoal::class, 'bank_soal_id');
    }

    public function petugas(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dicetak_oleh');
    }

    public function penyetuju(): BelongsTo
    {
        return $this->belongsTo(User::class, 'disetujui_oleh');
    }

    public function printer(): BelongsTo
    {
        return $this->belongsTo(Printer::class, 'printer_id');
    }
}
