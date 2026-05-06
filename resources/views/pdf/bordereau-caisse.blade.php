<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        @page { margin: 40px 25px 60px 25px; }
        body { font-family: 'Helvetica', sans-serif; font-size: 11px; color: #1a1a1a; }
        
        footer {
            position: fixed; bottom: -40px; left: 0; right: 0;
            height: 35px; text-align: center; font-size: 8px;
            color: #4b5563; border-top: 1px solid #e5e7eb; padding-top: 5px;
        }

        .header-table { width: 100%; border-bottom: 2px solid #2d4a3e; padding-bottom: 10px; margin-bottom: 20px; }
        .header-title { font-size: 20px; font-weight: bold; text-transform: uppercase; color: #2d4a3e; text-align: center; }
        
        .info-grid { background-color: #f9fafb; border: 1px solid #d1d5db; padding: 10px; border-radius: 4px; margin-top: 10px; }
        .info-label { font-weight: bold; color: #4b5563; font-size: 9px; text-transform: uppercase; }
        .info-value { font-weight: bold; font-size: 11px; color: #111827; }

        .data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .data-table th, .data-table td { border: 1px solid #666; padding: 8px 6px; vertical-align: middle; }
        .data-table th { background-color: #f3f4f6; font-size: 9px; text-transform: uppercase; font-weight: bold; }
        
        .amount-zone { font-weight: bold; text-align: right; font-size: 12px; }
        .signature-zone { width: 130px; height: 35px; }
    </style>
</head>
<body>

    @php $societe = societe(); @endphp

    <footer>
        <strong>{{ $societe->raison_sociale ?? 'SINTF' }}</strong> 
        @if($societe)
            — {{ $societe->adresse }} — Tél : {{ $societe->telephone }} 
        @endif
    </footer>

    <table class="header-table">
        <tr>
            <td style="width: 20%;">
                <img src="{{ public_path('sintf.png') }}" style="max-height: 50px;">
                <div style="font-weight: bold; font-size: 9px; margin-top: 5px;">{{ $societe->raison_sociale ?? 'SINTF' }}</div>
            </td>
            <td style="width: 60%; text-align: center;">
                <div class="header-title">Bordereau de Caisse (Espèces)</div>
                <table style="width: 100%; text-align: left;" class="info-grid">
                    <tr>
                        <td><span class="info-label">Réf État :</span> <span class="info-value">{{ $etat->reference_etat }}</span></td>
                        <td><span class="info-label">Section :</span> <span class="info-value">{{ $etat->section->nom_section }}</span></td>
                        <td><span class="info-label">Date Édition :</span> <span class="info-value">{{ now()->format('d/m/Y') }}</span></td>
                    </tr>
                </table>
            </td>
            <td style="width: 20%; text-align: right;"></td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 20px; text-align: center;">N°</th>
                <th style="width: 60px;">Matricule</th>
                <th>Nom & Prénoms</th>
                <th style="width: 85px;">N° CNIB</th>
                <th style="width: 90px; text-align: right;">Net à Payer</th>
                <th class="signature-zone text-center">Signature pour Acquit</th>
            </tr>
        </thead>
        <tbody>
            @foreach($tickets as $index => $ticket)
            <tr>
                <td style="text-align: center;">{{ $index + 1 }}</td>
                <td style="font-family: monospace; font-weight: bold;">{{ $ticket->personnel->matricule }}</td>
                <td style="text-transform: uppercase; font-weight: bold;">
                    {{ $ticket->personnel->nom }} <span style="font-weight: normal;">{{ $ticket->personnel->prenom }}</span>
                </td>
                <td style="font-family: monospace;">{{ $ticket->personnel->num_cnib ?? '-' }}</td>
                <td class="amount-zone">{{ number_format($ticket->montant_net, 0, ',', ' ') }} F</td>
                <td class="signature-zone"></td>
            </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr style="background-color: #f3f4f6;">
                <td colSpan="4" style="text-align: right; font-weight: bold; text-transform: uppercase; font-size: 11px;">Total de la Caisse à Décaisser :</td>
                <td class="amount-zone" style="font-size: 14px;">{{ number_format($totalNetEspeces, 0, ',', ' ') }} F</td>
                <td></td>
            </tr>
        </tfoot>
    </table>

    <table style="width: 100%; margin-top: 40px; border: none;">
        <tr>
            <td style="width: 50%; text-align: center; border: none;">
                <strong>Visa du Caissier</strong><br><br><br>..........................................
            </td>
            <td style="width: 50%; text-align: center; border: none;">
                <strong>Visa du Chef de Section / Responsable</strong><br><br><br>..........................................
            </td>
        </tr>
    </table>

</body>
</html>