<?php

namespace App\Models;

use Illuminate\Container\Attributes\Singleton;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Singleton]
class Societe extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'raison_sociale', 'ifu', 'rccm', 'telephone', 'email',
        'adresse', 'gerant', 'telephone_gerant', 'email_gerant',
    ];
}