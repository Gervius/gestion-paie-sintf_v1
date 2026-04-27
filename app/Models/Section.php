<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Concerns\HasCentimesAttributes;

class Section extends Model
{
    use HasFactory, SoftDeletes, HasCentimesAttributes;

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

    public function getTauxJournalierAttribute(): ?float
    {
        return $this->getFrancsFromCentimes('taux_journalier_centimes', 'taux_journalier');
    }

    public function setTauxJournalierAttribute($value): void
    {
        $this->setCentimesFromFrancs($value, 'taux_journalier_centimes', 'taux_journalier');
    }

    public function getTauxRendementAttribute(): ?float
    {
        return $this->getFrancsFromCentimes('taux_rendement_centimes', 'taux_rendement');
    }

    public function setTauxRendementAttribute($value): void
    {
        $this->setCentimesFromFrancs($value, 'taux_rendement_centimes', 'taux_rendement');
    }
}
