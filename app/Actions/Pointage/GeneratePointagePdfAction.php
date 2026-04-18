<?php

namespace App\Actions\Pointage;

use App\Models\Pointage;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class GeneratePointagePdfAction
{
    public function execute(Pointage $pointage): Response
    {
        if ($pointage->statut !== 'PREPARATION') {
            throw new \Exception('La feuille doit être en préparation pour être éditée sur le terrain.');
        }

        $pointage->load(['site', 'section', 'lignes.personnel']);
        $pointage->update(['statut' => 'EDITE_TERRAIN']);

        $pdf = Pdf::loadView('pdf.pointage-terrain', ['pointage' => $pointage]);

        return $pdf->download("pointage-{$pointage->id}.pdf");
    }
}