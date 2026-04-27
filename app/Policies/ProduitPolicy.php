<?php

namespace App\Policies;

use App\Models\Produit;
use App\Models\User;

class ProduitPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('produits.lire') ;
    }

    public function create(User $user): bool
    {
        return $user->can('produits.creer') ;
    }

    public function update(User $user, Produit $produit): bool
    {
        return $user->can('produits.modifier') ;
    }

    public function delete(User $user, Produit $produit): bool
    {
        return $user->can('produits.supprimer') ;
    }
}