<?php

namespace App\Actions\Personnel;

use App\Models\Personnel;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class GenerateIdentificationCardAction
{
    public function execute(Personnel $personnel): Response
    {
        // Définition du format A8 en points (72 DPI)
        // 52mm = 147.40 pts | 74mm = 209.76 pts
        $customPaper = [0, 0, 147.40, 209.76];

        $pdf = Pdf::loadView('pdf.fiche-identification-a8', [
            'personnel' => $personnel->load(['siteTravail', 'sectionDefaut']),
            'createdBy' => auth()->user()->name,
        ])->setPaper($customPaper, 'portrait');

        return $pdf->stream("BADGE_{$personnel->matricule}.pdf");
    }


    
}