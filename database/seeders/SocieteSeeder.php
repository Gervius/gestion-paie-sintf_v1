<?php

namespace Database\Seeders;

use App\Models\Societe;
use Illuminate\Database\Seeder;

class SocieteSeeder extends Seeder
{
    public function run(): void
    {
        Societe::updateOrCreate(
            ['raison_sociale' => 'SOCIETE INDUSTRIELLE DE TRANSFORMATION DE FRUITS Sarl'],
            [
                'ifu'               => '00167885 N',
                'rccm'              => 'BF BBD2021B1591',
                'telephone'         => '+226 76698223',
                'email'             => null,
                'adresse'           => 'BP 1200 Bobo Dioulasso',
                'gerant'            => 'Charles IDO',
                'telephone_gerant'  => '+226 63450304',
                'email_gerant'      => null,
            ]
        );
    }
}