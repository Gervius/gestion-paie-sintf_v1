<?php

namespace App\Models;

use App\Scopes\SiteScope;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Observers\AvanceObserver;
use App\Concerns\HasCentimesAttributes;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;



#[ScopedBy(SiteScope::class)]
#[ObservedBy(AvanceObserver::class)]
class Avance extends Model
{
    use HasFactory, SoftDeletes, HasCentimesAttributes, LogsActivity ;

    protected $fillable = [
        'personnel_id', 'regularisation_source_id', 'montant_initial',
        'solde_restant', 'date_avance', 'motif', 'statut',
    ];

    protected $casts = ['date_avance' => 'date'];

    public function personnel()
    {
        return $this->belongsTo(Personnel::class);
    }

    public function regularisationSource()
    {
        return $this->belongsTo(PointageLigne::class, 'regularisation_source_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
        ;
    }

    public function getMontantInitialAttribute(): ?float
    {
        return $this->getFrancsFromCentimes('montant_initial_centimes', 'montant_initial');
    }
    public function setMontantInitialAttribute($value): void
    {
        $this->setCentimesFromFrancs($value, 'montant_initial_centimes', 'montant_initial');
    }

    public function getSoldeRestantAttribute(): ?float
    {
        return $this->getFrancsFromCentimes('solde_restant_centimes', 'solde_restant');
    }
    public function setSoldeRestantAttribute($value): void
    {
        $this->setCentimesFromFrancs($value, 'solde_restant_centimes', 'solde_restant');
    }
}