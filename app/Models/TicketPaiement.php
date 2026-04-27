<?php

namespace App\Models;

use App\Scopes\SiteScope;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Concerns\HasCentimesAttributes;
use Illuminate\Database\Eloquent\SoftDeletes;

#[ScopedBy(SiteScope::class)]
class TicketPaiement extends Model
{
    use HasFactory, HasCentimesAttributes, SoftDeletes;

    protected $fillable = [
        'personnel_id', 'etat_paiement_id', 'lot_wave_id', 'date_generation', 'quantite_totale',
        'montant_brut_cumule', 'montant_deduit_manuel', 'montant_net',
        'mode_paiement', 'reference_paiement', 'statut', 'avance_id', 
    ];

    protected $casts = ['date_generation' => 'date'];

    public function personnel()
    {
        return $this->belongsTo(Personnel::class);
    }

    public function etatPaiement()
    {
        return $this->belongsTo(EtatPaiement::class);
    }

    public function lotWave()
    {
        return $this->belongsTo(LotPaiementWave::class, 'lot_wave_id');
    }

    public function pointageLignes()
    {
        return $this->hasMany(PointageLigne::class);
    }

    
    public function avance()
    {
        return $this->belongsTo(Avance::class, 'avance_id');
    }

    public function getMontantBrutCumuleAttribute(): ?float
    {
        return $this->getFrancsFromCentimes('montant_brut_cumule_centimes', 'montant_brut_cumule');
    }
    public function setMontantBrutCumuleAttribute($value): void
    {
        $this->setCentimesFromFrancs($value, 'montant_brut_cumule_centimes', 'montant_brut_cumule');
    }

    public function getMontantDeduitManuelAttribute(): ?float
    {
        return $this->getFrancsFromCentimes('montant_deduit_manuel_centimes', 'montant_deduit_manuel');
    }
    public function setMontantDeduitManuelAttribute($value): void
    {
        $this->setCentimesFromFrancs($value, 'montant_deduit_manuel_centimes', 'montant_deduit_manuel');
    }

    public function getMontantNetAttribute(): ?float
    {
        return $this->getFrancsFromCentimes('montant_net_centimes', 'montant_net');
    }
    public function setMontantNetAttribute($value): void
    {
        $this->setCentimesFromFrancs($value, 'montant_net_centimes', 'montant_net');
    }
}