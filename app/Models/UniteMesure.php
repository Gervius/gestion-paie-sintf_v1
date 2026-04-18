<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UniteMesure extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'unites_mesures';
    protected $fillable = ['code', 'libelle'];

    public function sections()
    {
        return $this->hasMany(Section::class);
    }
}