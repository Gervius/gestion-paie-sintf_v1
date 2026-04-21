<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Réinitialiser le cache des permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Liste des permissions
        $permissions = [
            // Permission spéciale Super Admin
            '*',

            // Pointage
            'creer_pointage',
            'modifier_brouillon',
            'cloturer_pointage',
            'supprimer_pointage', 

            // Finance & Paie
            'generer_etat_paiement', 
            'valider_etat_paiement',
            'voir_ticket_valide',
            'payer_especes',
            'generer_lot_wave',
            'voir_consolidation_paie',
            'gerer_avances',         

            // Régularisation
            'creer_regularisation',

            // Personnel
            'importer_personnel',
            'modifier_personnel',

            // Référentiels
            'gerer_referentiels',

            // Administration
            'gerer_utilisateurs',
            'acceder_dashboard_admin',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        // Création des rôles avec leurs permissions
        $roles = [
            'Super Admin'    => ['*'],
            
            'Pointeur'       => [
                'creer_pointage', 'modifier_brouillon', 'cloturer_pointage', 'supprimer_pointage'
            ],
            
            'Chef de Section'=> [
                'generer_etat_paiement', 'valider_etat_paiement', 'creer_regularisation'
            ],
            
            'Caissier'       => [
                'voir_ticket_valide', 'payer_especes', 'generer_lot_wave', 'voir_consolidation_paie', 'gerer_avances'
            ],
            
            'Superviseur RH' => [
                'importer_personnel', 'modifier_personnel', 'gerer_referentiels', 'gerer_avances', 'generer_etat_paiement'
            ],
        ];

        foreach ($roles as $roleName => $perms) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $role->syncPermissions($perms);
        }

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        // Création des rôles avec leurs permissions
        $roles = [
            'Super Admin'    => ['*'],
            'Pointeur'       => ['creer_pointage', 'modifier_brouillon', 'cloturer_pointage'],
            'Chef de Section'=> ['valider_etat_paiement', 'creer_regularisation'],
            'Caissier'       => ['voir_ticket_valide', 'payer_especes', 'generer_lot_wave'],
            'Superviseur RH' => ['importer_personnel', 'modifier_personnel', 'gerer_referentiels'],
        ];

        foreach ($roles as $roleName => $perms) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $role->syncPermissions($perms);
        }
    }
}