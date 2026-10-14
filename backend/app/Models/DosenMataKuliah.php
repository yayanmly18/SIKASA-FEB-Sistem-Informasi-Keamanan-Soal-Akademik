<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class DosenMataKuliah extends Pivot
{
    protected $table = 'dosen_mata_kuliah';

    protected $fillable = [
        'dosen_id',
        'mk_id',
    ];

    public $timestamps = false;
}
