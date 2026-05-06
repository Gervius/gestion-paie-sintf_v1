<?php

namespace App\Actions\Reporting;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use App\Models\Section;
use App\Models\Produit;

class GenerateEtatPointageSectionAction
{
    public function execute(string $dateDebut, string $dateFin, ?int $produitId = null, ?int $sectionId = null): array
    {
        // 1. Détermination de la période stricte
        $debutStrict = Carbon::parse($dateDebut)->startOfDay();
        $finStricte = Carbon::parse($dateFin)->endOfDay();

        // 2. Génération dynamique des colonnes (ex: du 12/05 au 15/05)
        $periode = CarbonPeriod::create($debutStrict, $finStricte);
        $colonnes = [];
        $clesJours = []; // Pour initialiser notre tableau avec des zéros
        
        foreach ($periode as $date) {
            $cle = $date->format('Y-m-d');
            $clesJours[] = $cle;
            $colonnes[] = [
                'cle' => $cle,
                'label' => $date->format('d/m') // Affiche "12/05" en en-tête de colonne
            ];
        }

        // 3. Extraction des données brutes
        $query = DB::table('pointage_lignes')
            ->join('pointages', 'pointage_lignes.pointage_id', '=', 'pointages.id')
            ->join('personnels', 'pointage_lignes.personnel_id', '=', 'personnels.id')
            ->join('sections', 'pointages.section_id', '=', 'sections.id')
            ->whereBetween('pointages.date_pointage', [$debutStrict, $finStricte])
            ->whereNull('pointages.deleted_at')
            ->where('pointage_lignes.statut_ligne', '!=', 'ABSENT');

        // Application des filtres optionnels
        if ($produitId) {
            $query->where('sections.produit_id', $produitId);
        }
        if ($sectionId) {
            $query->where('pointages.section_id', $sectionId);
        }

        $resultatsBruts = $query->select(
            'personnels.id as personnel_id',
            'personnels.matricule',
            'personnels.nom',
            'personnels.prenom',
            DB::raw('DATE(pointages.date_pointage) as date_jour'), // Ex: "2026-05-12"
            DB::raw('SUM(pointage_lignes.quantite) as quantite_jour'),
            DB::raw('SUM(pointage_lignes.montant_brut) as montant_jour')
        )
        ->groupBy(
            'personnels.id',
            'personnels.matricule',
            'personnels.nom',
            'personnels.prenom',
            DB::raw('DATE(pointages.date_pointage)')
        )
        ->get();

        // 4. Construction de la Matrice Pivot (dynamique)
        $agents = [];
        
        // 🚨 NOUVEAU : Initialisation du tableau des totaux par jour avec des zéros
        $totauxJours = [];
        foreach ($clesJours as $cle) {
            $totauxJours[$cle] = 0;
        }

        foreach ($resultatsBruts as $row) {
            $pId = $row->personnel_id;
            $dateJ = $row->date_jour;

            if (!isset($agents[$pId])) {
                // On pré-remplit les jours avec des zéros
                $pointagesQte = [];
                foreach ($clesJours as $cle) {
                    $pointagesQte[$cle] = 0;
                }

                $agents[$pId] = [
                    'personnel_id'   => $pId,
                    'matricule'      => $row->matricule,
                    'nom_complet'    => $row->nom . ' ' . $row->prenom,
                    'pointages_qte'  => $pointagesQte, 
                    'total_quantite' => 0,
                    'total_montant'  => 0,
                ];
            }

            // On injecte la quantité au bon jour pour l'agent
            $agents[$pId]['pointages_qte'][$dateJ] = (float) $row->quantite_jour;
            $agents[$pId]['total_quantite'] += (float) $row->quantite_jour;
            $agents[$pId]['total_montant'] += (float) $row->montant_jour;

            
            $totauxJours[$dateJ] += (float) $row->quantite_jour;
        }

        // Tri alphabétique
        usort($agents, function($a, $b) {
            return strcmp($a['nom_complet'], $b['nom_complet']);
        });

        // 5. Récupération des infos pour l'en-tête du document
        $section = $sectionId ? Section::find($sectionId) : null;
        $produit = $produitId ? Produit::find($produitId) : null;

        return [
            'infos' => [
                'produit' => $produit ? $produit->nom_produit : 'Tous les produits',
                'section' => $section ? $section->nom_section : 'Toutes les sections',
            ],
            'periode' => [
                'debut' => $debutStrict->format('d/m/Y'),
                'fin'   => $finStricte->format('d/m/Y'),
            ],
            'colonnes' => $colonnes, // Nos dates dynamiques pour le tableau React
            'lignes'   => array_values($agents),
            'totaux'   => [
                'global_quantite' => array_sum(array_column($agents, 'total_quantite')),
                'global_montant'  => array_sum(array_column($agents, 'total_montant')),
                'jours'           => $totauxJours, // 🚨 NOUVEAU : On renvoie les totaux
            ]
        ];
    }
}