<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Section extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'produit_id', 'code_section', 'nom_section',
        'taux_journalier', 'taux_rendement', 'unite_mesure_id',
    ];

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }

    public function uniteMesure()
    {
        return $this->belongsTo(UniteMesure::class);
    }

    public function personnels()
    {
        return $this->hasMany(Personnel::class, 'section_defaut_id');
    }

    public function pointages()
    {
        return $this->hasMany(Pointage::class);
    }

    public function etatPaiements()
    {
        return $this->hasMany(EtatPaiement::class);
    }
}