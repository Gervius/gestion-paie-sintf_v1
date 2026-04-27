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

        // 1. GESTION DES REQUÊTES SANS UTILISATEUR (Jobs, CRON, ou faille d'authentification)
        if (!$user) {
            if (app()->runningInConsole()) {
                // On est dans un Job ou un CRON (Artisan). On laisse passer, 
                // MAIS le code du Job devra filtrer manuellement le site si nécessaire.
                return; 
            }
            // Si c'est une requête Web HTTP classique sans utilisateur (faille middleware), 
            // on verrouille absolument tout : la requête renverra 0 résultat.
            $builder->whereRaw('1 = 0');
            return;
        }

        // 2. LE SUPER ADMIN VOIT TOUT
        if ($user->hasRole('Super Admin')) {
            return;
        }

        // 3. FILTRAGE POUR LES UTILISATEURS NORMAUX
        $siteIds = $user->authorized_site_ids ?? [];

        if (empty($siteIds)) {
            $builder->whereRaw('1 = 0');
            return;
        }

        if ($model instanceof \App\Models\Personnel) {
            $builder->whereIn($model->getTable() . '.site_travail_id', $siteIds);
        } 
        elseif ($model instanceof \App\Models\Pointage) {
            $builder->whereIn($model->getTable() . '.site_id', $siteIds);
        } 
        elseif ($model instanceof \App\Models\PointageLigne) {
            $builder->whereHas('pointage', function ($q) use ($siteIds) {
                $q->whereIn('site_id', $siteIds);
            });
        } 
        elseif ($model instanceof \App\Models\Avance) {
            $builder->whereHas('personnel', function ($q) use ($siteIds) {
                $q->whereIn('site_travail_id', $siteIds);
            });
        } 
        elseif ($model instanceof \App\Models\TicketPaiement) {
            // Filtre par le site de l'état de paiement
            $builder->whereHas('etatPaiement', function ($q) use ($siteIds) {
                $q->whereIn('site_id', $siteIds);
            });
        } 
        elseif ($model instanceof \App\Models\EtatPaiement) {
            // Directement par la colonne site_id
            $builder->whereIn($model->getTable() . '.site_id', $siteIds);
        }
    }
}