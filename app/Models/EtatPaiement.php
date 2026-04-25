<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EtatPaiement extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference_etat', 'section_id', 'date_debut', 'date_fin', 'type_pointage', 'statut',
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

    public function validePar()
    {
        return $this->belongsTo(User::class, 'valide_par_id');
    }

    public function tickets()
    {
        return $this->hasMany(TicketPaiement::class);
    }
}