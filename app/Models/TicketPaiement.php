<?php

namespace App\Models;

use App\Scopes\SiteScope;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[ScopedBy(SiteScope::class)]
class TicketPaiement extends Model
{
    use HasFactory, SoftDeletes;

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
}