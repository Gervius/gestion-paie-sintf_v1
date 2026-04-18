<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Site extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = ['code_site', 'nom_site'];

    public function personnels()
    {
        return $this->hasMany(Personnel::class, 'site_travail_id');
    }

    public function pointages()
    {
        return $this->hasMany(Pointage::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'site_users')->withTimestamps();
    }
}