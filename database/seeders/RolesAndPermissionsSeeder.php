<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Réinitialise le cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // --- PERMISSIONS (français) ---
        $permissions = [
            '*',

            // Pointages
            'pointages.creer',
            'pointages.lire',
            'pointages.modifier',
            'pointages.supprimer',
            'pointages.soumettre',
            'pointages.rouvrir',

            // Personnel
            'personnels.creer',
            'personnels.lire',
            'personnels.modifier',
            'personnels.supprimer',
            'personnels.importer',

            // Référentiels
            'sections.creer', 'sections.lire', 'sections.modifier', 'sections.supprimer',
            'produits.creer', 'produits.lire', 'produits.modifier', 'produits.supprimer',
            'sites.creer', 'sites.lire', 'sites.modifier', 'sites.supprimer',
            'localites.creer', 'localites.lire', 'localites.modifier', 'localites.supprimer',

            // Utilisateurs & Rôles
            'utilisateurs.creer', 'utilisateurs.lire', 'utilisateurs.modifier', 'utilisateurs.supprimer',
            'roles.creer', 'roles.lire', 'roles.modifier', 'roles.supprimer',
            'societe.modifier', 'societe.lire',

            // Finance
            'etats.creer',
            'etats.lire',
            'etats.valider',
            'etats.supprimer',
            'tickets.payer',
            'tickets.wave.generer',
            'tickets.wave.valider',
            'tickets.lire',
            'avances.creer',
            'avances.lire',
            'avances.modifier',
            'avances.supprimer',

            // Régularisations
            'regularisations.creer',
            'regularisations.lire',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        // --- RÔLES ---
        $roles = [
            'Super Admin' => ['*'],

            'Pointeur' => [
                'pointages.creer',
                'pointages.lire',
                'pointages.modifier',
                'pointages.soumettre',
                'pointages.rouvrir',
                'regularisations.creer',
                'regularisations.lire',
                'personnels.lire',
            ],

            'Chef de Section' => [
                'pointages.creer',
                'pointages.lire',
                'pointages.modifier',
                'pointages.soumettre',
                'pointages.rouvrir',
                'pointages.supprimer',
                'regularisations.creer',
                'regularisations.lire',
                'personnels.creer',
                'personnels.lire',
                'personnels.modifier',
                'etats.creer',
                'etats.lire',
                'etats.valider',
            ],

            'Caissier' => [
                'tickets.lire',
                'tickets.payer',
                'tickets.wave.generer',
                'tickets.wave.valider',
                'avances.creer',
                'avances.lire',
                'avances.modifier',
                'avances.supprimer',
                'etats.lire',
                'personnels.lire',
            ],

            'Superviseur RH' => [
                'personnels.creer',
                'personnels.lire',
                'personnels.modifier',
                'personnels.supprimer',
                'personnels.importer',
                'sites.creer', 'sites.lire', 'sites.modifier', 'sites.supprimer',
                'sections.creer', 'sections.lire', 'sections.modifier', 'sections.supprimer',
                'produits.creer', 'produits.lire', 'produits.modifier', 'produits.supprimer',
                'localites.creer', 'localites.lire', 'localites.modifier', 'localites.supprimer',
                'etats.creer',
                'etats.lire',
                'etats.valider',
                'avances.lire',
                'avances.creer',
                'avances.modifier',
                'avances.supprimer',
            ],
        ];

        foreach ($roles as $name => $perms) {
            $role = Role::firstOrCreate(['name' => $name]);
            $role->syncPermissions($perms);
        }
    }
}