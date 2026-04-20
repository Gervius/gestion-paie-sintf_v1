<?php

namespace App\Actions\Pointage;

use App\Models\Pointage;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class GeneratePointagePdfAction
{
    public function execute(Pointage $pointage): Response
    {
        
        $pointage->load([
            'site', 
            'section.produit', 
            'section.uniteMesure', 
            'lignes.personnel'
        ]);

        
        $pdf = Pdf::loadView('pdf.pointage-terrain', ['pointage' => $pointage])
                  ->setPaper('a4', 'landscape');

        return $pdf->download("FICHE_POINTAGE_{$pointage->id}.pdf");
    }
}