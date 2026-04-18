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
        if (!Auth::check()) {
            return;
        }

        $user = Auth::user();

        if ($user->can('*')) {
            return;
        }

        $siteIds = $user->authorized_site_ids;

        if (empty($siteIds)) {
            $builder->whereRaw('1 = 0');
            return;
        }

        if ($model instanceof \App\Models\Personnel) {
            $builder->whereIn('site_travail_id', $siteIds);
        } elseif ($model instanceof \App\Models\Pointage) {
            $builder->whereIn('site_id', $siteIds);
        } elseif ($model instanceof \App\Models\TicketPaiement) {
            $builder->whereHas('personnel', fn($q) => $q->whereIn('site_travail_id', $siteIds));
        } elseif ($model instanceof \App\Models\Avance) {
            $builder->whereHas('personnel', fn($q) => $q->whereIn('site_travail_id', $siteIds));
        } elseif ($model instanceof \App\Models\PointageLigne) {
            $builder->whereHas('pointage', fn($q) => $q->whereIn('site_id', $siteIds));
        }
    }
}