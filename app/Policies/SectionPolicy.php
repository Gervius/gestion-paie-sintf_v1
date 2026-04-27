<?php
namespace App\Policies;

use App\Models\Section;
use App\Models\User;

class SectionPolicy
{
    public function viewAny(User $user): bool { return $user->can('sections.lire'); }
    public function create(User $user): bool { return $user->can('sections.creer') ; }
    public function update(User $user, Section $section): bool { return $user->can('sections.modifier') ; }
    public function delete(User $user, Section $section): bool { return $user->can('sections.supprimer') ; }
}