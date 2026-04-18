<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            SocieteSeeder::class,
            SiteSeeder::class,
            LocaliteSeeder::class,
            ProduitSeeder::class,
            SectionSeeder::class,
            PersonnelSeeder::class,
            RolesAndPermissionsSeeder::class, // déjà existant
            AdminUserSeeder::class,           // déjà existant
        ]);
    }
}