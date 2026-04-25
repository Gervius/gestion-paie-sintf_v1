<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email','username', 'password', 'site_id', 'must_change_password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function siteUnique()
    {
        return $this->belongsTo(Site::class, 'site_id');
    }

    public function sites()
    {
        return $this->belongsToMany(Site::class, 'site_users')->withTimestamps();
    }

    public function getAuthorizedSiteIdsAttribute(): array
    {
        
        if ($this->hasRole('Super Admin')) {
            // C'est une bonne pratique de toujours préciser la table
            return \App\Models\Site::pluck('sites.id')->toArray();
        }

        
        $ids = $this->sites()->pluck('sites.id')->toArray();
        
        if ($this->site_id) {
            $ids[] = $this->site_id;
        }
        
        return array_unique($ids);
    }
}
