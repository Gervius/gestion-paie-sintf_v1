<?php

namespace App\Models;

use App\Scopes\SiteScope;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use App\Concerns\HasCentimesAttributes;
use App\Observers\PointageObserver;


#[ScopedBy(SiteScope::class)]
#[ObservedBy(PointageObserver::class)]
class Pointage extends Model
{
    use HasFactory, HasCentimesAttributes, SoftDeletes;

    protected $fillable = [
        'date_pointage', 'site_id', 'section_id', 'type_pointage', 'taux_applique', 'statut',
    ];

    protected $attributes = [
        'statut' => 'PREPARATION',
    ];

    protected $casts = ['date_pointage' => 'date'];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function lignes()
    {
        return $this->hasMany(PointageLigne::class);
    }

    public function auditPointages()
    {
        return $this->hasMany(AuditPointage::class);
    }

    public function getTauxAppliqueAttribute(): ?float
    {
        return $this->getFrancsFromCentimes('taux_applique_centimes', 'taux_applique');
    }

    public function setTauxAppliqueAttribute($value): void
    {
        $this->setCentimesFromFrancs($value, 'taux_applique_centimes', 'taux_applique');
    }
}