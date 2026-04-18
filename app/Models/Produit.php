<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Produit extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['code_produit', 'nom_produit'];

    public function sections()
    {
        return $this->hasMany(Section::class);
    }
}