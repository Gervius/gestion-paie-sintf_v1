<?php

namespace Database\Seeders;

use App\Models\Site;
use Illuminate\Database\Seeder;

class SiteSeeder extends Seeder
{
    public function run(): void
    {
        $sites = [
            ['code_site' => 'BO', 'nom_site' => 'Bobo-Dioulasso'],
            ['code_site' => 'PE',  'nom_site' => 'Peni'],
            ['code_site' => 'KO',  'nom_site' => 'Koko'],
            ['code_site' => 'OUI', 'nom_site' => 'Ouini'],
        ];

        foreach ($sites as $site) {
            Site::updateOrCreate(['code_site' => $site['code_site']], $site);
        }
    }
}