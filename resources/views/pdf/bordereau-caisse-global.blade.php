<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        @page { margin: 40px 25px 60px 25px; }
        body { font-family: 'Helvetica', sans-serif; font-size: 11px; color: #1a1a1a; }
        .header-table { width: 100%; border-bottom: 2px solid #2d4a3e; padding-bottom: 10px; margin-bottom: 20px; }
        .header-title { font-size: 18px; font-weight: bold; text-transform: uppercase; color: #2d4a3e; text-align: center; }
        .data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .data-table th, .data-table td { border: 1px solid #666; padding: 8px 6px; vertical-align: middle; }
        .data-table th { background-color: #f3f4f6; font-size: 9px; text-transform: uppercase; font-weight: bold; }
        .amount-zone { font-weight: bold; text-align: right; font-size: 12px; }
        .signature-zone { width: 130px; height: 35px; }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td style="width: 20%;"><img src="{{ public_path('sintf.svg') }}" style="max-height: 40px;"></td>
            <td style="width: 60%; text-align: center;">
                <div class="header-title">Bordereau de Caisse CONSOLIDÉ (Espèces)</div>
                <div style="font-size: 10px; margin-top: 5px;">Fusion de toutes les sections validées au {{ $date }}</div>
            </td>
            <td style="width: 20%;"></td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 20px; text-align: center;">N°</th>
                <th style="width: 60px;">Matricule</th>
                <th>Nom & Prénoms</th>
                <th style="width: 85px;">N° CNIB</th>
                <th style="width: 90px; text-align: right;">Net Global à Payer</th>
                <th class="signature-zone text-center">Signature pour Acquit</th>
            </tr>
        </thead>
        <tbody>
            @foreach($lignes as $index => $ligne)
            <tr>
                <td style="text-align: center;">{{ $index + 1 }}</td>
                <td style="font-family: monospace; font-weight: bold;">{{ $ligne->matricule }}</td>
                <td style="text-transform: uppercase; font-weight: bold;">{{ $ligne->nom_complet }}</td>
                <td style="font-family: monospace;">{{ $ligne->cnib }}</td>
                <td class="amount-zone">{{ number_format($ligne->net_a_payer, 0, ',', ' ') }} F</td>
                <td class="signature-zone"></td>
            </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr style="background-color: #f3f4f6;">
                <td colSpan="4" style="text-align: right; font-weight: bold; text-transform: uppercase;">Total de la Caisse Usine :</td>
                <td class="amount-zone" style="font-size: 14px; color: #b91c1c;">{{ number_format($totalNet, 0, ',', ' ') }} F</td>
                <td></td>
            </tr>
        </tfoot>
    </table>
</body>
</html>