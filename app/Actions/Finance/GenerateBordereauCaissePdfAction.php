<?php

namespace App\Actions\Finance;

use App\Models\EtatPaiement;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class GenerateBordereauCaissePdfAction
{
    public function execute(EtatPaiement $etat): Response
    {
        
        $etat->load(['section.produit']);

        $tickets = $etat->tickets()
            ->where('mode_paiement', 'ESPECES')
            ->with('personnel')
            ->get();

        if ($tickets->isEmpty()) {
            throw new \Exception("Aucun paiement en espèces n'est prévu dans cet état.");
        }

        $pdf = Pdf::loadView('pdf.bordereau-caisse', [
            'etat' => $etat,
            'tickets' => $tickets,
            'totalNetEspeces' => $tickets->sum('montant_net')
        ])->setPaper('a4', 'portrait');

        return $pdf->download("BORDEREAU_CAISSE_{$etat->reference_etat}.pdf");
    }
}