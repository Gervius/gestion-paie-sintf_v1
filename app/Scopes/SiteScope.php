<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class SiteScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $user = Auth::user();

        if (!$user) {
            return;
        }

        // Super Admin voit tout
        if ($user->hasRole('Super Admin')) {
            return;
        }

        // Les autres utilisateurs voient uniquement le personnel de leurs sites
        $siteIds = $user->authorized_site_ids ?? [];

        if (!empty($siteIds)) {
            $builder->whereIn('site_travail_id', $siteIds);
        }
    }
}
