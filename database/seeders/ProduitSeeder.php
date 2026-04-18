<?php

namespace Database\Seeders;

use App\Models\Produit;
use Illuminate\Database\Seeder;

class ProduitSeeder extends Seeder
{
    public function run(): void
    {
        $produits = [
            ['code_produit' => 'MG', 'nom_produit' => 'Mangue'],
            ['code_produit' => 'CJ', 'nom_produit' => 'Cajou'],
            ['code_produit' => 'AR', 'nom_produit' => 'Arachide'],
        ];

        foreach ($produits as $produit) {
            Produit::updateOrCreate(['code_produit' => $produit['code_produit']], $produit);
        }
    }
}