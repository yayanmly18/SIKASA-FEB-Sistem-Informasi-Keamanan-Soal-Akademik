<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Printer extends Model
{
    use HasFactory;

    protected $table = 'printer';

    protected $fillable = [
        'nama_printer',
        'alamat_printer',
        'lokasi',
        'status',
    ];

    public function logCetak(): HasMany
    {
        return $this->hasMany(LogCetak::class, 'printer_id');
    }
}
