<?php

namespace App\Actions\Regularisation;

use App\Models\Pointage;
use App\Models\PointageLigne;
use App\Models\Personnel;
use App\Models\EtatPaiement;
use App\Models\TicketPaiement;
use Illuminate\Support\Facades\DB;

class CreateRegularisationPositiveAction
{
    /**
     * Ajoute une régularisation positive (oubli ou sous-évaluation).
     */
    public function execute(Pointage $pointage, int $personnelId, float $quantiteManquante, string $motif, bool $paiementImmediat = false): array
    {
        if ($pointage->statut !== 'CLOTURE') {
            throw new \Exception('La feuille doit être clôturée pour effectuer une régularisation positive.');
        }

        if ($quantiteManquante <= 0) {
            throw new \Exception('La quantité doit être strictement positive.');
        }

        return DB::transaction(function () use ($pointage, $personnelId, $quantiteManquante, $motif, $paiementImmediat) {
            $personnel = Personnel::findOrFail($personnelId);
            $montant = $quantiteManquante * $pointage->taux_applique;

            // 1. On crée la trace de l'oubli sur la feuille de pointage
            $ligne = PointageLigne::create([
                'pointage_id'          => $pointage->id,
                'personnel_id'         => $personnel->id,
                'matricule_personnel'  => $personnel->matricule,
                'quantite'             => $quantiteManquante,
                'montant_brut'         => $montant,
                'type_ligne'           => 'REGULARISATION',
                'motif_regularisation' => $motif,
                'statut_ligne'         => 'EN_ATTENTE',
                'moyen_paiement'       => $personnel->preference_paiement ?? 'ESPECES',
            ]);

            $etat = null;

            // 2. Si le Paiement Express est demandé, on génère la paie instantanément
            if ($paiementImmediat) {
                // Création de l'État de paie exceptionnel
                $etat = EtatPaiement::create([
                    'reference_etat'     => 'REGUL-' . now()->format('Ymd-Hi') . '-' . $personnel->matricule,
                    'section_id'         => $pointage->section_id,
                    'date_etat'          => now()->toDateString(),
                    'statut'             => 'PROVISOIRE', // Reste provisoire pour validation comptable
                    'montant_total_brut' => $montant,
                    'montant_total_net'  => $montant,
                ]);

                // Création du Ticket pour l'agent
                $ticket = TicketPaiement::create([
                    'personnel_id'          => $personnel->id,
                    'etat_paiement_id'      => $etat->id,
                    'date_generation'       => now()->toDateString(),
                    'montant_brut_cumule'   => $montant,
                    'montant_deduit_manuel' => 0,
                    'montant_net'           => $montant,
                    'mode_paiement'         => $ligne->moyen_paiement,
                    'statut'                => 'EN_ATTENTE',
                ]);

                // On scelle la ligne pour qu'elle ne soit pas repayée lors de la paie globale
                $ligne->update([
                    'ticket_paiement_id' => $ticket->id,
                    'statut_ligne'       => 'VALIDE'
                ]);
            }

            return ['ligne' => $ligne, 'etat' => $etat];
        });
    }
}