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
    public function genererIntervalle(int $sectionId, Carbon $dateDebut, Carbon $dateFin): EtatPaiement
    {
        return DB::transaction(function () use ($sectionId, $dateDebut, $dateFin) {
            
            $lignes = PointageLigne::where('statut_ligne', 'EN_ATTENTE')
                ->whereNull('ticket_paiement_id') // <--- VERROU ANTI DOUBLE-PAIEMENT
                ->whereHas('pointage', function ($q) use ($sectionId, $dateDebut, $dateFin) {
                    $q->where('section_id', $sectionId)
                      ->where('statut', 'CLOTURE') // Sécurité supp : uniquement les feuilles clôturées
                      ->whereBetween('date_pointage', [$dateDebut->toDateString(), $dateFin->toDateString()]);
                })
                ->with('personnel')
                ->get();

            if ($lignes->isEmpty()) {
                throw new \Exception('Aucun pointage valide et non-facturé trouvé pour cette période. Ils sont peut-être déjà dans un autre état de paiement.');
            }

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

            $grouped = $lignes->groupBy('personnel_id');
            $totalBrut = 0;

            foreach ($grouped as $personnelId => $lignesPersonnel) {
                $personnel = $lignesPersonnel->first()->personnel;
                $montantBrut = $lignesPersonnel->sum('montant_brut');

                $avanceActive = Avance::where('personnel_id', $personnelId)
                    ->where('statut', 'ACTIVE')
                    ->where('solde_restant', '>', 0)
                    ->first();

                // 💡 CORRECTION ICI : On récupère la valeur saisie sur le terrain (moyen_paiement de la ligne)
                // S'il n'y a rien, on se rabat sur la préférence du profil, sinon ESPECES.
                $modeChoisiSurTerrain = $lignesPersonnel->first()->moyen_paiement ?? $personnel->preference_paiement ?? 'ESPECES';

                $ticket = TicketPaiement::create([
                    'personnel_id'         => $personnelId,
                    'etat_paiement_id'     => $etat->id,
                    'date_generation'      => now()->toDateString(),
                    'montant_brut_cumule'  => $montantBrut,
                    'montant_deduit_manuel'=> 0, 
                    'montant_net'          => $montantBrut,
                    'mode_paiement'        => $modeChoisiSurTerrain, // ✅ Intégration de la correction
                    'statut'               => 'NON_SOLDE',
                    'avance_id'            => $avanceActive ? $avanceActive->id : null, 
                ]);

                PointageLigne::whereIn('id', $lignesPersonnel->pluck('id'))
                    ->update([
                        'ticket_paiement_id' => $ticket->id,
                        'statut_ligne'       => 'INCLUS_ETAT'
                    ]);
                    
                $totalBrut += $montantBrut;
            }

            $etat->update([
                'montant_total_brut' => $totalBrut,
                'montant_total_net'  => $totalBrut,
            ]);

            return $etat;
        });
    }
}