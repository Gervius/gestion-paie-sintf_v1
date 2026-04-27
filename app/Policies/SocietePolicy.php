<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Societe;

class SocietePolicy
{
    public function update(User $user): bool
    {
        return $user->can('societe.editer');
    }
}