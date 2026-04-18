<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Localite extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['code_localite', 'nom_localite'];

    public function personnels()
    {
        return $this->hasMany(Personnel::class, 'localite_domicile_id');
    }
}