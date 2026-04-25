<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class SiteScope implements Scope
{
    /**
     * Applique dynamiquement le filtre de site selon le modèle.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $user = Auth::user();

        // Si pas d'utilisateur ou Super Admin, on ne filtre rien
        if (!$user || $user->hasRole('Super Admin')) {
            return;
        }

        $siteIds = $user->authorized_site_ids ?? [];

        // Sécurité : Si l'utilisateur n'a aucun site, il ne voit rien (1=0)
        if (empty($siteIds)) {
            $builder->whereRaw('1 = 0');
            return;
        }

        // --- LOGIQUE MULTI-MODÈLES ---
        
        if ($model instanceof \App\Models\Personnel) {
            // Table personnels : colonne 'site_travail_id'
            $builder->whereIn($model->getTable() . '.site_travail_id', $siteIds);
        } 
        elseif ($model instanceof \App\Models\Pointage) {
            // Table pointages : colonne 'site_id'
            $builder->whereIn($model->getTable() . '.site_id', $siteIds);
        } 
        elseif ($model instanceof \App\Models\PointageLigne) {
            // Les lignes n'ont pas de site, on filtre via la relation 'pointage'
            $builder->whereHas('pointage', function ($q) use ($siteIds) {
                $q->whereIn('site_id', $siteIds);
            });
        } 
        elseif ($model instanceof \App\Models\Avance) {
            // Les avances sont filtrées via le site de l'employé rattaché
            $builder->whereHas('personnel', function ($q) use ($siteIds) {
                $q->whereIn('site_travail_id', $siteIds);
            });
        }
    }
}