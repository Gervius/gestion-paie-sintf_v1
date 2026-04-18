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
    /**
     * Génère un état de paiement périodique pour une section.
     */
    public function genererIntervalle(int $sectionId, Carbon $dateDebut, Carbon $dateFin): EtatPaiement
    {
        return DB::transaction(function () use ($sectionId, $dateDebut, $dateFin) {
            
            // 1. Récupérer toutes les lignes EN_ATTENTE de la section dans l'intervalle
            $lignes = PointageLigne::where('statut_ligne', 'EN_ATTENTE')
                ->whereHas('pointage', function ($q) use ($sectionId, $dateDebut, $dateFin) {
                    $q->where('section_id', $sectionId)
                      ->whereBetween('date_pointage', [$dateDebut->toDateString(), $dateFin->toDateString()]);
                })
                ->with('personnel')
                ->get();

            if ($lignes->isEmpty()) {
                throw new \Exception('Aucune ligne de pointage en attente pour cette section dans cette période.');
            }

            // 2. Créer l'entête de l'état de paiement
            $section = Section::findOrFail($sectionId);
            $reference = 'ETAT-' . $section->code_section . '-' . $dateDebut->format('dmy') . '-' . $dateFin->format('dmy');
            
            $etat = EtatPaiement::create([
                'reference_etat' => $reference,
                'section_id'     => $sectionId,
                'date_etat'      => now()->toDateString(),
                'statut'         => 'PROVISOIRE',
                'montant_total_brut' => 0,
                'montant_total_net'  => 0,
            ]);

            // 3. Agréger par employé (Le Cumul)
            $grouped = $lignes->groupBy('personnel_id');
            $totalBrut = 0;

            foreach ($grouped as $personnelId => $lignesPersonnel) {
                $personnel = $lignesPersonnel->first()->personnel;
                $montantBrut = $lignesPersonnel->sum('montant_brut');

                // Détecter l'avance active sans la déduire automatiquement
                $avanceActive = Avance::where('personnel_id', $personnelId)
                    ->where('statut', 'ACTIVE')
                    ->where('solde_restant', '>', 0)
                    ->first();

                // Créer le ticket (montant net = montant brut par défaut, déduction à 0)
                $ticket = TicketPaiement::create([
                    'personnel_id'         => $personnelId,
                    'etat_paiement_id'     => $etat->id,
                    'date_generation'      => now()->toDateString(),
                    'montant_brut_cumule'  => $montantBrut,
                    'montant_deduit_manuel'=> 0, // Le caissier ajustera manuellement (Entente)
                    'montant_net'          => $montantBrut,
                    'mode_paiement'        => $personnel->preference_paiement ?? 'ESPECES',
                    'statut'               => 'NON_SOLDE',
                    'avance_id'            => $avanceActive ? $avanceActive->id : null, // Optionnel: aide pour l'affichage
                ]);

                // Lier les lignes au ticket
                PointageLigne::whereIn('id', $lignesPersonnel->pluck('id'))
                    ->update(['ticket_paiement_id' => $ticket->id]);
                    
                $totalBrut += $montantBrut;
            }

            // Mettre à jour l'état
            $etat->update([
                'montant_total_brut' => $totalBrut,
                'montant_total_net'  => $totalBrut, // Sera mis à jour quand le caissier fera ses retenues
            ]);

            return $etat;
        });
    }
}