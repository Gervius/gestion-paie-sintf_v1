<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        @page { margin: 40px 25px 60px 25px; }
        body { font-family: 'Helvetica', sans-serif; font-size: 10px; color: #1a1a1a; }
        
        footer {
            position: fixed; bottom: -40px; left: 0; right: 0;
            height: 35px; text-align: center; font-size: 8px;
            color: #4b5563; border-top: 1px solid #e5e7eb; padding-top: 5px;
        }

        .header-table { width: 100%; border-bottom: 2px solid #2d4a3e; padding-bottom: 10px; margin-bottom: 15px; }
        .header-title { font-size: 18px; font-weight: bold; text-transform: uppercase; color: #2d4a3e; text-align: center; }
        
        .info-grid { background-color: #f9fafb; border: 1px solid #d1d5db; padding: 8px; border-radius: 4px; }
        .info-label { font-weight: bold; color: #4b5563; font-size: 8px; text-transform: uppercase; }
        .info-value { font-weight: bold; font-size: 10px; color: #111827; }

        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { border: 1px solid #666; padding: 6px 4px; vertical-align: middle; }
        .data-table th { background-color: #f3f4f6; font-size: 8px; text-transform: uppercase; font-weight: bold; }
        
        .write-zone { width: 60px; text-align: center; }
        .payment-zone { width: 85px; font-size: 8px; }
        .signature-zone { width: 100px; }
    </style>
</head>
<body>

    @php $societe = societe(); @endphp

    <footer>
        <strong>{{ $societe->raison_sociale ?? 'SINTF' }}</strong> 
        @if($societe)
            — {{ $societe->adresse }} — Tél : {{ $societe->telephone }} 
            @if($societe->ifu) — IFU : {{ $societe->ifu }} @endif
            @if($societe->rccm) — RCCM : {{ $societe->rccm }} @endif
        @endif
    </footer>

    <table class="header-table">
        <tr>
            <td style="width: 20%;">
                <img src="{{ public_path('sintf.png') }}" style="max-height: 50px;">
                <div style="font-weight: bold; font-size: 9px; margin-top: 5px;">{{ $societe->raison_sociale ?? 'SINTF' }}</div>
            </td>
            
            <td style="width: 60%; text-align: center;">
                <div class="header-title">Fiche de Pointage Personnel</div>
                <table style="width: 100%; text-align: left;" class="info-grid">
                    <tr>
                        <td><span class="info-label">Site :</span> <span class="info-value">{{ $pointage->site->nom_site }}</span></td>
                        <td><span class="info-label">Produit :</span> <span class="info-value">{{ $pointage->section->produit->nom_produit ?? 'N/A' }}</span></td>
                        <td><span class="info-label">Section :</span> <span class="info-value">{{ $pointage->section->nom_section }}</span></td>
                    </tr>
                    <tr>
                        <td><span class="info-label">Type :</span> <span class="info-value">{{ $pointage->type_pointage }}</span></td>
                        <td><span class="info-label">Unité :</span> <span class="info-value">{{ $pointage->section->uniteMesure->code ?? '-' }}</span></td>
                        <td><span class="info-label">Taux :</span> <span class="info-value">{{ number_format($pointage->taux_applique, 0, ',', ' ') }} FCFA</span></td>
                    </tr>
                </table>
            </td>
            
            <td style="width: 20%; text-align: right; vertical-align: middle;">
                <div style="border: 1px solid #2d4a3e; padding: 4px; border-radius: 4px; text-align: center; margin-bottom: 4px; background-color: #f9fafb;">
                    <span class="info-label">N° Fiche</span><br>
                    <span style="font-size: 13px; font-weight: bold; color: #111827;">#{{ str_pad($pointage->id, 5, '0', STR_PAD_LEFT) }}</span>
                </div>
                <div style="border: 1px solid #2d4a3e; padding: 4px; border-radius: 4px; text-align: center;">
                    <span class="info-label">Date Travail</span><br>
                    <span style="font-size: 13px; font-weight: bold;">{{ \Carbon\Carbon::parse($pointage->date_pointage)->format('d/m/Y') }}</span>
                </div>
            </td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 20px; text-align: center;">N°</th>
                <th style="width: 60px;">Matricule</th>
                <th>Nom & Prénoms</th>
                <th style="width: 85px;">N° CNIB</th>
                <th class="write-zone">Quantité</th>
                <th style="width: 40px; text-align: center;">Unité</th>
                <th class="payment-zone text-center">Paiement Final</th>
                <th class="signature-zone text-center">Signature Agent</th>
            </tr>
        </thead>
        <tbody>
            @foreach($pointage->lignes as $index => $ligne)
            <tr>
                <td style="text-align: center;">{{ $index + 1 }}</td>
                <td style="font-family: monospace; font-weight: bold;">{{ $ligne->personnel->matricule }}</td>
                <td style="text-transform: uppercase; font-weight: bold;">
                    {{ $ligne->personnel->nom }} <span style="font-weight: normal;">{{ $ligne->personnel->prenom }}</span>
                </td>
                <td style="font-family: monospace;">{{ $ligne->personnel->num_cnib ?? '-' }}</td>
                <td class="write-zone"></td>
                <td style="text-align: center;">{{ $pointage->section->uniteMesure->code ?? '-' }}</td>
                <td class="payment-zone">
                    <div style="font-size: 7px; margin-bottom: 2px;">Préf: {{ $ligne->personnel->preference_paiement ?? 'WAVE' }}</div>
                    [ ] WAVE <br> [ ] ESPÈCES
                </td>
                <td class="signature-zone"></td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <table style="width: 100%; margin-top: 30px; border: none;">
        <tr>
            <td style="width: 50%; text-align: center; border: none;">
                <strong>Signature Pointeur</strong><br><br><br>..........................................
            </td>
            <td style="width: 50%; text-align: center; border: none;">
                <strong>Signature Chef de Section</strong><br><br><br>..........................................
            </td>
        </tr>
    </table>

</body>
</html>