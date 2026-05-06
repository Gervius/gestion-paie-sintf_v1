<?php

namespace App\Actions\Reporting;

use Illuminate\Support\Facades\DB;
use App\Models\Personnel;
use Carbon\Carbon;

class GenerateEtatPersonnelAction
{
    public function execute(int $personnelId, string $dateDebut, string $dateFin, ?int $produitId = null, ?int $sectionId = null): array
    {
        $debutStrict = Carbon::parse($dateDebut)->startOfDay();
        $finStricte = Carbon::parse($dateFin)->endOfDay();

        $personnel = Personnel::findOrFail($personnelId);

        $query = DB::table('pointage_lignes')
            ->join('pointages', 'pointage_lignes.pointage_id', '=', 'pointages.id')
            ->join('sections', 'pointages.section_id', '=', 'sections.id')
            ->leftJoin('produits', 'sections.produit_id', '=', 'produits.id')
            ->leftJoin('unites_mesures', 'sections.unite_mesure_id', '=', 'unites_mesures.id')
            
            ->where('pointage_lignes.personnel_id', $personnelId)
            ->whereBetween('pointages.date_pointage', [$debutStrict, $finStricte])
            ->whereNull('pointages.deleted_at')
            ->where('pointage_lignes.statut_ligne', '!=', 'ABSENT');

        if ($produitId) {
            $query->where('sections.produit_id', $produitId);
        }
        if ($sectionId) {
            $query->where('pointages.section_id', $sectionId);
        }

        $resultatsBruts = $query->select(
            'produits.nom_produit',
            'sections.nom_section',
            'unites_mesures.code as unite_mesure',
            'pointages.taux_applique',
            
            DB::raw('SUM(pointage_lignes.quantite) as quantite_totale'),
            DB::raw('SUM(pointage_lignes.montant_brut) as montant_a_payer'),
            DB::raw('COUNT(DISTINCT pointages.date_pointage) as nb_jours_travail')
        )
        ->groupBy(
            'produits.nom_produit', 
            'sections.nom_section', 
            'unites_mesures.code', 
            'pointages.taux_applique'
        )
        ->orderBy('produits.nom_produit')
        ->orderBy('sections.nom_section')
        ->get();

        // 3. Formatage et calcul du rendement
        $lignesFormatees = $resultatsBruts->map(function ($row) {
            $quantite = (float) $row->quantite_totale;
            $jours = (int) $row->nb_jours_travail;
            
            // Protection contre la division par zéro
            $rendementMoyen = $jours > 0 ? ($quantite / $jours) : 0;

            return [
                'produit'         => $row->nom_produit ?? 'N/A',
                'section'         => $row->nom_section,
                'unite'           => $row->unite_mesure ?? '-',
                'taux'            => (float) $row->taux_applique,
                'quantite_totale' => round($quantite, 2),
                'montant_a_payer' => round((float) $row->montant_a_payer),
                'nb_jours'        => $jours,
                'rendement_moyen' => round($rendementMoyen, 2),
            ];
        });

        // 4. Totaux finaux
        $totalMontant = $lignesFormatees->sum('montant_a_payer');

        return [
            'personnel' => [
                'matricule' => $personnel->matricule,
                'nom_complet' => $personnel->nom . ' ' . $personnel->prenom,
                'sexe' => $personnel->sexe ?? '-',
                'telephone' => $personnel->telephone ?? '-',
            ],
            'periode' => [
                'debut' => Carbon::parse($dateDebut)->format('d/m/Y'),
                'fin'   => Carbon::parse($dateFin)->format('d/m/Y'),
            ],
            'lignes' => $lignesFormatees,
            'total_a_payer' => $totalMontant,
        ];
    }
}