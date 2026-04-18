<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sequence extends Model
{
    use HasFactory;

    protected $fillable = ['site_code', 'annee', 'dernier_numero'];
    protected $casts = [
        'annee' => 'integer',
        'dernier_numero' => 'integer',
    ];
}