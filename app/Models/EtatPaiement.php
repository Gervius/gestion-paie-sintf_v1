<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Concerns\HasCentimesAttributes;

class EtatPaiement extends Model
{
    use HasFactory, HasCentimesAttributes;

    protected $fillable = [
        'reference_etat', 'section_id', 'site_id', 'date_debut', 'date_fin',
        'type_pointage', 'statut',
        'montant_total_brut', 'montant_total_net', 'valide_par_id', 'date_validation',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'date_validation' => 'datetime',
    ];

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function validePar()
    {
        return $this->belongsTo(User::class, 'valide_par_id');
    }

    public function tickets()
    {
        return $this->hasMany(TicketPaiement::class);
    }

    // Accesseurs / Mutateurs centimes
    public function getMontantTotalBrutAttribute(): ?float
    {
        return $this->getFrancsFromCentimes('montant_total_brut_centimes', 'montant_total_brut');
    }

    public function setMontantTotalBrutAttribute($value): void
    {
        $this->setCentimesFromFrancs($value, 'montant_total_brut_centimes', 'montant_total_brut');
    }

    public function getMontantTotalNetAttribute(): ?float
    {
        return $this->getFrancsFromCentimes('montant_total_net_centimes', 'montant_total_net');
    }

    public function setMontantTotalNetAttribute($value): void
    {
        $this->setCentimesFromFrancs($value, 'montant_total_net_centimes', 'montant_total_net');
    }
}