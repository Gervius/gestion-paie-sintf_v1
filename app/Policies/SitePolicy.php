<?php

namespace App\Policies;

use App\Models\Site;
use App\Models\User;

class SitePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('sites.lire') ;
    }

    public function create(User $user): bool
    {
        return $user->can('sites.creer') ;
    }

    public function update(User $user, Site $site): bool
    {
        return $user->can('sites.modifier');
    }

    public function delete(User $user, Site $site): bool
    {
        return $user->can('sites.supprimer') ;
    }
}