<?php

namespace App\Models;

use App\Scopes\SiteScope;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Concerns\HasCentimesAttributes;
use Illuminate\Database\Eloquent\Model;

use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

#[ScopedBy(SiteScope::class)]
class PointageLigne extends Model
{
    use HasFactory, HasCentimesAttributes, LogsActivity;

    protected $fillable = [
        'pointage_id', 'personnel_id', 'matricule_personnel', 'quantite',
        'montant_brut', 'type_ligne', 'motif_regularisation', 'statut_ligne',
        'ticket_paiement_id', 'moyen_paiement', 
    ];

    protected $attributes = [
        'statut_ligne' => 'PREPARATION',
    ];

    public function pointage()
    {
        return $this->belongsTo(Pointage::class);
    }

    public function personnel()
    {
        return $this->belongsTo(Personnel::class);
    }

    public function ticketPaiement()
    {
        return $this->belongsTo(TicketPaiement::class);
    }

    public function regularisationsSources()
    {
        return $this->hasMany(Avance::class, 'regularisation_source_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Ligne de pointage {$eventName}");
    }

    public function getMontantBrutAttribute(): ?float
    {
        return $this->getFrancsFromCentimes('montant_brut_centimes', 'montant_brut');
    }

    public function setMontantBrutAttribute($value): void
    {
        $this->setCentimesFromFrancs($value, 'montant_brut_centimes', 'montant_brut');
    }
}