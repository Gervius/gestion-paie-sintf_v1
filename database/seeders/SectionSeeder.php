<?php

namespace Database\Seeders;

use App\Models\Section;
use App\Models\Produit;
use App\Models\UniteMesure;
use Illuminate\Database\Seeder;

class SectionSeeder extends Seeder
{
    public function run(): void
    {
        $produitMG = Produit::where('code_produit', 'MG')->first();
        $produitCJ = Produit::where('code_produit', 'CJ')->first();

        $uniteKG = UniteMesure::firstOrCreate(['code' => 'KG'], ['libelle' => 'Kilogramme']);
        $uniteClaies = UniteMesure::firstOrCreate(['code' => 'CLAIES'], ['libelle' => 'Claies']);
        $uniteSechoirs = UniteMesure::firstOrCreate(['code' => 'SECHOIRS'], ['libelle' => 'Séchoirs']);
        $uniteTunnel = UniteMesure::firstOrCreate(['code' => 'TUNNEL'], ['libelle' => 'Tunnel']);
        $uniteJournee = UniteMesure::firstOrCreate(['code' => 'JOURNEE'], ['libelle' => 'Journée']);
        $uniteCaisse = UniteMesure::firstOrCreate(['code' => 'CAISSE'], ['libelle' => 'Caisse']);
        $uniteFilets = UniteMesure::firstOrCreate(['code' => 'FILETS'], ['libelle' => 'Filets']);

        $sections = [
            // Code, Nom, Produit, Unite, Taux journalier (quantité de référence), Taux rendement (prix unitaire)
            ['code_section' => 'MGMG-01', 'nom_section' => 'RECEPTION', 'produit_code' => 'MG', 'unite_code' => 'KG', 'taux_journalier' => 1350, 'taux_rendement' => 1.11],
            ['code_section' => 'MGMG-02', 'nom_section' => 'MURISSEMENT T1', 'produit_code' => 'MG', 'unite_code' => 'KG', 'taux_journalier' => 1250, 'taux_rendement' => 1.20],
            ['code_section' => 'MGMG-03', 'nom_section' => 'LAVAGE', 'produit_code' => 'MG', 'unite_code' => 'KG', 'taux_journalier' => 1250, 'taux_rendement' => 1.20],
            ['code_section' => 'MGTRAITEMENT', 'nom_section' => 'TRAITEMENT', 'produit_code' => 'MG', 'unite_code' => 'CLAIES', 'taux_journalier' => 13, 'taux_rendement' => 115.00],
            ['code_section' => 'MGMG-04', 'nom_section' => 'SECHAGE ATTESTA BOIS', 'produit_code' => 'MG', 'unite_code' => 'SECHOIRS', 'taux_journalier' => 5, 'taux_rendement' => 400.00],
            ['code_section' => 'SECHAGE ATTESTA', 'nom_section' => 'SECHAGE ATTESTA', 'produit_code' => 'MG', 'unite_code' => 'SECHOIRS', 'taux_journalier' => 6, 'taux_rendement' => 333.33],
            ['code_section' => 'SECHAGE TUNNEL', 'nom_section' => 'SECHAGE TUNNEL', 'produit_code' => 'MG', 'unite_code' => 'TUNNEL', 'taux_journalier' => 0, 'taux_rendement' => 0],
            ['code_section' => 'MGMG-06', 'nom_section' => 'DECAPAGE', 'produit_code' => 'MG', 'unite_code' => 'SECHOIRS', 'taux_journalier' => 7, 'taux_rendement' => 214.29],
            ['code_section' => 'MGMG-07', 'nom_section' => 'TRIE NORMAL', 'produit_code' => 'MG', 'unite_code' => 'KG', 'taux_journalier' => 50, 'taux_rendement' => 30.00],
            ['code_section' => 'MGMG-08', 'nom_section' => 'CONTRÔLE', 'produit_code' => 'MG', 'unite_code' => 'KG', 'taux_journalier' => 150, 'taux_rendement' => 10.00],
            ['code_section' => 'MGMG-09', 'nom_section' => 'ENSACHAGE', 'produit_code' => 'MG', 'unite_code' => 'KG', 'taux_journalier' => 260, 'taux_rendement' => 5.77],
            ['code_section' => 'MGMG-10', 'nom_section' => 'STOCKAGE', 'produit_code' => 'MG', 'unite_code' => 'KG', 'taux_journalier' => 600, 'taux_rendement' => 2.50],
            ['code_section' => 'MGMG-11', 'nom_section' => 'CONVOYAGE MG AU', 'produit_code' => 'MG', 'unite_code' => 'KG', 'taux_journalier' => 4667, 'taux_rendement' => 0.32],
            ['code_section' => 'MGMG-12', 'nom_section' => 'CONVOYAGE MG AU', 'produit_code' => 'MG', 'unite_code' => 'KG', 'taux_journalier' => 7000, 'taux_rendement' => 0.21],
            ['code_section' => 'MGMG-13', 'nom_section' => 'CONTRÔLE QUALITE AU TRAITEMENT', 'produit_code' => 'MG', 'unite_code' => 'JOURNEE', 'taux_journalier' => 1, 'taux_rendement' => 1500.00],
            ['code_section' => 'MGMG-14', 'nom_section' => 'PESEE A LA RECEPTION', 'produit_code' => 'MG', 'unite_code' => 'JOURNEE', 'taux_journalier' => 1, 'taux_rendement' => 1500.00],
            ['code_section' => 'MGMG-15', 'nom_section' => 'PESEE AU TRAITEMENT', 'produit_code' => 'MG', 'unite_code' => 'JOURNEE', 'taux_journalier' => 1, 'taux_rendement' => 1500.00],
            ['code_section' => 'MGMG-16', 'nom_section' => 'CONVOYAGE DECHET MG', 'produit_code' => 'MG', 'unite_code' => 'JOURNEE', 'taux_journalier' => 1, 'taux_rendement' => 1500.00],
            ['code_section' => 'MGMG-17', 'nom_section' => 'LAVAGE CAISSES', 'produit_code' => 'MG', 'unite_code' => 'CAISSE', 'taux_journalier' => 60, 'taux_rendement' => 25.00],
            ['code_section' => 'MGMG-18', 'nom_section' => 'LAVAGE FILETS', 'produit_code' => 'MG', 'unite_code' => 'FILETS', 'taux_journalier' => 520, 'taux_rendement' => 2.88],
            ['code_section' => 'MGMG-19', 'nom_section' => 'LAVAGE BATIMENT MATIN/SOIR', 'produit_code' => 'MG', 'unite_code' => 'JOURNEE', 'taux_journalier' => 1, 'taux_rendement' => 1500.00],
            ['code_section' => 'MGMG-20', 'nom_section' => 'NETTOYAGE TRAITEMENT JRNEE', 'produit_code' => 'MG', 'unite_code' => 'JOURNEE', 'taux_journalier' => 1, 'taux_rendement' => 1500.00],
            ['code_section' => 'MGMG-21', 'nom_section' => 'LAVAGE DES TENUES', 'produit_code' => 'MG', 'unite_code' => 'JOURNEE', 'taux_journalier' => 1, 'taux_rendement' => 1500.00],
            ['code_section' => 'MGMG-22', 'nom_section' => 'LAVAGE DES CHAUSSURES', 'produit_code' => 'MG', 'unite_code' => 'JOURNEE', 'taux_journalier' => 1, 'taux_rendement' => 1500.00],
            ['code_section' => 'MGMG-23', 'nom_section' => 'NETTOYAGE TOILETTE', 'produit_code' => 'MG', 'unite_code' => 'JOURNEE', 'taux_journalier' => 1, 'taux_rendement' => 1500.00],
            ['code_section' => 'MGMG-24', 'nom_section' => 'CUISINE', 'produit_code' => 'MG', 'unite_code' => 'JOURNEE', 'taux_journalier' => 1, 'taux_rendement' => 1500.00],
            ['code_section' => 'MGMG-25', 'nom_section' => 'GARDE DES ENFANTS (NOUNOUS)', 'produit_code' => 'MG', 'unite_code' => 'JOURNEE', 'taux_journalier' => 1, 'taux_rendement' => 1500.00],
            ['code_section' => 'CJ-01', 'nom_section' => 'CALIBRAGE', 'produit_code' => 'CJ', 'unite_code' => 'JOURNEE', 'taux_journalier' => 1, 'taux_rendement' => 1500.00],
        ];

        foreach ($sections as $sec) {
            $produit = Produit::where('code_produit', $sec['produit_code'])->first();
            $unite = UniteMesure::where('code', $sec['unite_code'])->first();

            Section::updateOrCreate(
                ['code_section' => $sec['code_section']],
                [
                    'nom_section'      => $sec['nom_section'],
                    'produit_id'       => $produit->id,
                    'unite_mesure_id'  => $unite->id,
                    'taux_journalier'  => $sec['taux_journalier'],
                    'taux_rendement'   => $sec['taux_rendement'],
                ]
            );
        }
    }
}