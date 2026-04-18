<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditPointage extends Model
{
    use HasFactory;

    protected $fillable = [
        'pointage_id', 'user_id', 'ancien_statut', 'nouveau_statut', 'raison',
    ];

    public function pointage()
    {
        return $this->belongsTo(Pointage::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}