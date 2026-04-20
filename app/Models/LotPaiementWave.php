<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LotPaiementWave extends Model
{
    use HasFactory;

    protected $table = 'lots_paiements_waves';

    protected $fillable = [
        'reference_lot', 'date_generation', 'statut', 'generated_by_id',
    ];

    protected $casts = ['date_generation' => 'date'];

    public function generatedBy()
    {
        return $this->belongsTo(User::class, 'generated_by_id');
    }

    public function tickets()
    {
        return $this->hasMany(TicketPaiement::class, 'lot_wave_id');
    }
}