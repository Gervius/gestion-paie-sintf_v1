<?php

namespace App\Services\Finance;

use App\Models\EtatPaiement;
use App\Models\PointageLigne;
use App\Models\TicketPaiement;
use App\Models\Section;
use App\Models\Avance;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EtatPaiementGenerationService
{
    public function generer(int $sectionId, Carbon $date): EtatPaiement
    {
        return DB::transaction(function () use ($sectionId, $date) {
            // Vérifier qu'aucun état n'existe déjà
            $existant = EtatPaiement::where('section_id', $sectionId)
                ->where('date_etat', $date->toDateString())
                ->first();
            if ($existant) {
                throw new \Exception('Un état de paiement existe déjà pour cette section et cette date.');
            }

            // Récupérer toutes les lignes EN_ATTENTE de la section à cette date
            $lignes = PointageLigne::where('statut_ligne', 'EN_ATTENTE')
                ->whereHas('pointage', function ($q) use ($sectionId, $date) {
                    $q->where('section_id', $sectionId)
                      ->where('date_pointage', $date->toDateString());
                })
                ->with('personnel')
                ->get();

            if ($lignes->isEmpty()) {
                throw new \Exception('Aucune ligne de pointage en attente pour cette section à cette date.');
            }

            // Créer l'état de paiement
            $section = Section::findOrFail($sectionId);
            $reference = 'ETAT-' . $section->code_section . '-' . $date->format('Ymd');
            $etat = EtatPaiement::create([
                'reference_etat' => $reference,
                'section_id'     => $sectionId,
                'date_etat'      => $date->toDateString(),
                'statut'         => 'PROVISOIRE',
            ]);

            // Regrouper par personnel
            $grouped = $lignes->groupBy('personnel_id');
            $totalBrut = 0;
            $totalNet = 0;

            foreach ($grouped as $personnelId => $lignesPersonnel) {
                $personnel = $lignesPersonnel->first()->personnel;
                $montantBrut = $lignesPersonnel->sum('montant_brut');

                // Calcul des déductions (avances actives)
                $avances = Avance::where('personnel_id', $personnelId)
                    ->where('statut', 'ACTIVE')
                    ->where('solde_restant', '>', 0)
                    ->orderBy('date_avance')
                    ->get();

                $deductionTotale = 0;
                $montantRestantADeduire = $montantBrut;
                foreach ($avances as $avance) {
                    if ($montantRestantADeduire <= 0) break;
                    $deduction = min($avance->solde_restant, $montantRestantADeduire);
                    $deductionTotale += $deduction;
                    $montantRestantADeduire -= $deduction;
                }

                $montantNet = $montantBrut - $deductionTotale;
                $totalBrut += $montantBrut;
                $totalNet += $montantNet;

                // Créer le ticket
                $ticket = TicketPaiement::create([
                    'personnel_id'         => $personnelId,
                    'etat_paiement_id'     => $etat->id,
                    'date_generation'      => now()->toDateString(),
                    'montant_brut_cumule'  => $montantBrut,
                    'montant_deduit_manuel'=> 0, // pour l'instant, les déductions sont automatiques
                    'montant_net'          => $montantNet,
                    'mode_paiement'        => $personnel->preference_paiement,
                    'statut'               => 'NON_SOLDE',
                ]);

                // Lier les lignes de pointage au ticket
                PointageLigne::whereIn('id', $lignesPersonnel->pluck('id'))
                    ->update(['ticket_paiement_id' => $ticket->id]);
            }

            $etat->update([
                'montant_total_brut' => $totalBrut,
                'montant_total_net'  => $totalNet,
            ]);

            return $etat;
        });
    }
}