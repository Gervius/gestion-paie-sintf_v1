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
            ->leftJoin('ticket_paiements', 'pointage_lignes.ticket_paiement_id', '=', 'ticket_paiements.id')
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
            'pointages.type_pointage', 
            
            DB::raw('COUNT(DISTINCT pointages.id) as nbre_pointage'), 
            DB::raw('SUM(pointage_lignes.quantite) as quantite_totale'),
            DB::raw('SUM(pointage_lignes.montant_brut) as montant_a_payer'),
            DB::raw('COUNT(DISTINCT pointages.date_pointage) as nb_jours_travail'),
            
            
            DB::raw('SUM(
                CASE 
                    WHEN ticket_paiements.id IS NOT NULL AND ticket_paiements.montant_brut_cumule > 0 
                    THEN (pointage_lignes.montant_brut / ticket_paiements.montant_brut_cumule) * ticket_paiements.montant_deduit_manuel
                    ELSE 0 
                END
            ) as avance_payee')
        )
        ->groupBy(
            'produits.nom_produit', 
            'sections.nom_section', 
            'unites_mesures.code', 
            'pointages.taux_applique',
            'pointages.type_pointage' 
        )
        ->orderBy('produits.nom_produit')
        ->orderBy('sections.nom_section')
        ->get();

        // 3. Formatage et calcul du rendement
        $lignesFormatees = $resultatsBruts->map(function ($row) {
            $quantite = (float) $row->quantite_totale;
            $jours = (int) $row->nb_jours_travail;
            $rendementMoyen = $jours > 0 ? ($quantite / $jours) : 0;

            return [
                'produit'         => $row->nom_produit ?? 'N/A',
                'section'         => $row->nom_section,
                'type_pointage'   => $row->type_pointage ?? 'RENDEMENT', // 🚨 NOUVEAU
                'nbre_pointage'   => (int) $row->nbre_pointage, // 🚨 NOUVEAU
                'unite'           => $row->unite_mesure ?? '-',
                'taux'            => (float) $row->taux_applique,
                'quantite_totale' => round($quantite, 2),
                'montant_a_payer' => round((float) $row->montant_a_payer),
                'nb_jours'        => $jours,
                'rendement_moyen' => round($rendementMoyen, 2),
                'avance_payee'    => (float) $row->avance_payee, // 🚨 NOUVEAU
            ];
        });

        // 4. Totaux finaux
        $totalMontant = $lignesFormatees->sum('montant_a_payer');
        $totalAvances = $lignesFormatees->sum('avance_payee');

        return [
            'personnel' => [
                'matricule' => $personnel->matricule,
                'nom_complet' => $personnel->nom . ' ' . $personnel->prenom,
                'sexe' => $personnel->sexe ?? '-',
                'telephone' => $personnel->telephone ?? '-',
                'date_naissance' => $personnel->date_naissance ? Carbon::parse($personnel->date_naissance)->format('d/m/Y') : '-', // 🚨 NOUVEAU
            ],
            'periode' => [
                'debut' => Carbon::parse($dateDebut)->format('d/m/Y'),
                'fin'   => Carbon::parse($dateFin)->format('d/m/Y'),
            ],
            'lignes' => $lignesFormatees,
            // 🚨 NOUVEAU BLOC
            'finances' => [
                'montant_total'  => $totalMontant,
                'avance_deduite' => $totalAvances,
                'net_a_payer'    => $totalMontant - $totalAvances,
            ]
        ];
    }
}