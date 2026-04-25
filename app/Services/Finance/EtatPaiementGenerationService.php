<?php

namespace App\Services\Finance;

use App\Models\EtatPaiement;
use App\Models\PointageLigne;
use App\Models\TicketPaiement;
use App\Models\Section;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EtatPaiementGenerationService
{
    public function genererIntervalleMulti(array $sectionIds, Carbon $dateDebut, Carbon $dateFin): int
    {
        return DB::transaction(function () use ($sectionIds, $dateDebut, $dateFin) {
            $etatsCrees = 0;
            $debutH24 = $dateDebut->copy()->startOfDay();
            $finH24 = $dateFin->copy()->endOfDay();

            foreach ($sectionIds as $sectionId) {
                // 1. Récupération des lignes non payées
                $lignes = PointageLigne::where('statut_ligne', 'EN_ATTENTE')
                    ->whereNull('ticket_paiement_id')
                    ->whereHas('pointage', function ($q) use ($sectionId, $debutH24, $finH24) {
                        $q->where('section_id', $sectionId)
                          ->where('statut', 'CLOTURE')
                          ->whereBetween('date_pointage', [$debutH24, $finH24]);
                    })
                    ->with(['personnel', 'pointage'])
                    ->get();

                if ($lignes->isEmpty()) continue;

                // 2. Groupe par type (Rendement vs Journalier)
                $groupesParType = $lignes->groupBy(fn($l) => $l->pointage->type_pointage);
                $section = Section::findOrFail($sectionId);

                foreach ($groupesParType as $type => $lignesType) {
                    $reference = 'CONS-' . $section->code_section . '-' . strtoupper(substr($type, 0, 3)) . '-' . now()->format('dmyHi');
                    
                    $etat = EtatPaiement::create([
                        'reference_etat' => $reference,
                        'section_id' => $sectionId,
                        'date_debut' => $dateDebut->toDateString(),
                        'date_fin' => $dateFin->toDateString(),
                        'type_pointage' => $type,
                        'statut' => 'PROVISOIRE',
                    ]);

                    // 3. Agrégation par agent
                    $lignesParAgent = $lignesType->groupBy('personnel_id');
                    $totalBrutEtat = 0;

                    foreach ($lignesParAgent as $personnelId => $groupesLignes) {
                        $personnel = $groupesLignes->first()->personnel;
                        $cumulQuantite = $groupesLignes->sum('quantite');
                        $cumulBrut = $groupesLignes->sum('montant_brut');
                        
                        $mode = $groupesLignes->last()->moyen_paiement ?? $personnel->preference_paiement ?? 'ESPECES';

                        $ticket = TicketPaiement::create([
                            'personnel_id' => $personnelId,
                            'etat_paiement_id' => $etat->id,
                            'date_generation' => now()->toDateString(),
                            'quantite_totale' => $cumulQuantite, // Correction bug 0.00
                            'montant_brut_cumule' => $cumulBrut,
                            'montant_net' => $cumulBrut,
                            'mode_paiement' => $mode,
                            'statut' => 'NON_SOLDE',
                        ]);

                        PointageLigne::whereIn('id', $groupesLignes->pluck('id'))
                            ->update(['ticket_paiement_id' => $ticket->id, 'statut_ligne' => 'INCLUS_ETAT']);

                        $totalBrutEtat += $cumulBrut;
                    }

                    $etat->update(['montant_total_brut' => $totalBrutEtat, 'montant_total_net' => $totalBrutEtat]);
                    $etatsCrees++;
                }
            }
            return $etatsCrees;
        });
    }
}