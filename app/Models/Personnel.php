<?php

namespace App\Models;

use App\Scopes\SiteScope;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[ScopedBy(SiteScope::class)]
class Personnel extends Model
{
    use HasFactory, SoftDeletes;

   protected $fillable = [
        'matricule', 'nom', 'prenom', 'surnom', 'sexe', 'date_naissance',
        'lieu_naissance', 'num_acte_naissance', 'num_cnib', 'sans_cnib', 
        'date_cnib', 'lieu_cnib', 'num_cnss', 'date_cnss', 
        'telephone', 'a_telephone_propre', 'telephone_sc', 'lien_telephone_sc', 
        'tel_compte_wave', 'est_marie', 'nb_charge', 'niveau_etude', 'classification',
        'localite_domicile_id', 'site_travail_id', 'section_defaut_id',
        'actif', 'preference_paiement', 'import_batch',
    ];

    protected $casts = [
        'date_naissance'     => 'date',
        'date_cnib'          => 'date',
        'date_cnss'          => 'date',
        'est_marie'          => 'boolean',
        'actif'              => 'boolean',
        'sans_cnib'          => 'boolean', 
        'a_telephone_propre' => 'boolean', 
    ];

    public function localiteDomicile()
    {
        return $this->belongsTo(Localite::class, 'localite_domicile_id');
    }

    public function siteTravail()
    {
        return $this->belongsTo(Site::class, 'site_travail_id');
    }

    public function sectionDefaut()
    {
        return $this->belongsTo(Section::class, 'section_defaut_id');
    }

    public function pointageLignes()
    {
        return $this->hasMany(PointageLigne::class);
    }

    public function avances()
    {
        return $this->hasMany(Avance::class);
    }

    public function ticketPaiements()
    {
        return $this->hasMany(TicketPaiement::class);
    }
}