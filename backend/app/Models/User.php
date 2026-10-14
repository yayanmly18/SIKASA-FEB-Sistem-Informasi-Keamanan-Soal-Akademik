<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLES = ['dosen', 'kaprodi', 'panitia', 'admin_it'];

    protected $fillable = [
        'nidn',
        'nama',
        'email',
        'password',
        'pin_cetak',
        'pin_cetak_at',
        'role',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'pin_cetak',
        'remember_token',
    ];

    protected $casts = [
        'password' => 'hashed',
        'pin_cetak' => 'hashed',
        'pin_cetak_at' => 'datetime',
        'is_active' => 'boolean',
        'last_login_at' => 'datetime',
    ];

    /**
     * PIN Cetak HARIAN masih berlaku? True jika pin_cetak terisi DAN
     * pin_cetak_at jatuh di hari kalender yang sama (Asia/Jakarta).
     */
    public function pinHarianBerlaku(): bool
    {
        if (! $this->pin_cetak || ! $this->pin_cetak_at) {
            return false;
        }

        return $this->pin_cetak_at->timezone('Asia/Jakarta')->isToday();
    }

    public function mataKuliah(): BelongsToMany
    {
        return $this->belongsToMany(MataKuliah::class, 'dosen_mata_kuliah', 'dosen_id', 'mk_id');
    }

    public function bankSoal(): HasMany
    {
        return $this->hasMany(BankSoal::class, 'user_id');
    }

    public function logAktivitas(): HasMany
    {
        return $this->hasMany(LogAktivitas::class, 'user_id');
    }

    public function hasRole(string ...$roles): bool
    {
        return in_array($this->role, $roles, true);
    }
}

