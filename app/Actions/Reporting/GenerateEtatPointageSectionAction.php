<?php

namespace App\Actions\Reporting;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use App\Models\Section;
use App\Models\Produit;

class GenerateEtatPointageSectionAction
{
    
    public function execute(string $dateDebut, string $dateFin, ?int $produitId = null, ?int $sectionId = null, ?string $typePointage = null): array
    {
        // 1. Détermination de la période stricte
        $debutStrict = Carbon::parse($dateDebut)->startOfDay();
        $finStricte = Carbon::parse($dateFin)->endOfDay();

        // 2. Génération dynamique des colonnes
        $periode = CarbonPeriod::create($debutStrict, $finStricte);
        $colonnes = [];
        $clesJours = []; 
        
        foreach ($periode as $date) {
            $cle = $date->format('Y-m-d');
            $clesJours[] = $cle;
            $colonnes[] = [
                'cle' => $cle,
                'label' => $date->format('d/m') 
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
        
        if ($typePointage) {
            $query->where('pointages.type_pointage', $typePointage);
        }

        $resultatsBruts = $query->select(
            'personnels.id as personnel_id',
            'personnels.matricule',
            'personnels.nom',
            'personnels.prenom',
            'pointages.type_pointage', // 🚨 RÉCUPÉRATION DU TYPE
            DB::raw('DATE(pointages.date_pointage) as date_jour'), 
            DB::raw('SUM(pointage_lignes.quantite) as quantite_jour'),
            DB::raw('SUM(pointage_lignes.montant_brut) as montant_jour')
        )
        ->groupBy(
            'personnels.id',
            'personnels.matricule',
            'personnels.nom',
            'personnels.prenom',
            'pointages.type_pointage', 
            DB::raw('DATE(pointages.date_pointage)')
        )
        ->get();

        // 4. Construction de la Matrice Pivot avec sous-tiroirs
        $agents = [];
        
        $totauxJours = [];
        foreach ($clesJours as $cle) {
            
            $totauxJours[$cle] = [
                'RENDEMENT' => 0, 
                'JOURNALIER' => 0
            ];
        }

        foreach ($resultatsBruts as $row) {
            $pId = $row->personnel_id;
            $dateJ = $row->date_jour;
            
            $typeP = $row->type_pointage ?: 'RENDEMENT'; 

            if (!isset($agents[$pId])) {
                $pointagesQte = [];
                foreach ($clesJours as $cle) {
                    
                    $pointagesQte[$cle] = [
                        'RENDEMENT' => 0, 
                        'JOURNALIER' => 0
                    ];
                }

                $agents[$pId] = [
                    'personnel_id'        => $pId,
                    'matricule'           => $row->matricule,
                    'nom_complet'         => $row->nom . ' ' . $row->prenom,
                    'pointages_qte'       => $pointagesQte, 
                    'total_quantite_rend' => 0, // Nouveau compteur
                    'total_quantite_jour' => 0, // Nouveau compteur
                    'total_montant'       => 0,
                ];
            }

            
            $agents[$pId]['pointages_qte'][$dateJ][$typeP] += (float) $row->quantite_jour;
            
            if ($typeP === 'RENDEMENT') {
                $agents[$pId]['total_quantite_rend'] += (float) $row->quantite_jour;
            } else {
                $agents[$pId]['total_quantite_jour'] += (float) $row->quantite_jour;
            }
            
            $agents[$pId]['total_montant'] += (float) $row->montant_jour;
            
            // On incrémente le total global de la colonne dans le bon tiroir
            $totauxJours[$dateJ][$typeP] += (float) $row->quantite_jour;
        }

        usort($agents, function($a, $b) {
            return strcmp($a['nom_complet'], $b['nom_complet']);
        });

        // 5. Récupération des infos
        $section = $sectionId ? Section::find($sectionId) : null;
        $produit = $produitId ? Produit::find($produitId) : null;

        return [
            'infos' => [
                'produit'       => $produit ? $produit->nom_produit : 'Tous les produits',
                'section'       => $section ? $section->nom_section : 'Toutes les sections',
                'type_pointage' => $typePointage ? $typePointage : 'Tous les types', 
            ],
            'periode' => [
                'debut' => $debutStrict->format('d/m/Y'),
                'fin'   => $finStricte->format('d/m/Y'),
            ],
            'colonnes' => $colonnes, 
            'lignes'   => array_values($agents),
            'totaux'   => [
                'global_quantite_rend' => array_sum(array_column($agents, 'total_quantite_rend')),
                'global_quantite_jour' => array_sum(array_column($agents, 'total_quantite_jour')),
                'global_montant'       => array_sum(array_column($agents, 'total_montant')),
                'jours'                => $totauxJours, 
            ]
        ];
    }
}