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
        .header-title { font-size: 16px; font-weight: bold; text-transform: uppercase; color: #2d4a3e; text-align: center; margin-bottom: 5px; }
        
        .info-grid { background-color: #f9fafb; border: 1px solid #d1d5db; padding: 8px; border-radius: 4px; width: 100%; margin-bottom: 15px; }
        .info-label { font-weight: bold; color: #4b5563; font-size: 8px; text-transform: uppercase; }
        .info-value { font-weight: bold; font-size: 11px; color: #111827; }

        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { border: 1px solid #666; padding: 8px 4px; vertical-align: middle; }
        .data-table th { background-color: #f3f4f6; font-size: 8px; text-transform: uppercase; font-weight: bold; }
        
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .text-orange { color: #c2410c; }
        .bg-light { background-color: #f9fafb; }
        .total-row td { background-color: #2d4a3e; color: white; font-weight: bold; font-size: 12px; }
    </style>
</head>
<body>

    @php $societe = societe(); @endphp

    <footer>
        <strong>{{ $societe->raison_sociale ?? 'SINTF' }}</strong> 
        @if($societe)
            — {{ $societe->adresse }} — Tél : {{ $societe->telephone }} 
            @if($societe->ifu) — IFU : {{ $societe->ifu }} @endif
        @endif
    </footer>

    <table class="header-table">
        <tr>
            <td style="width: 25%;">
                <img src="{{ public_path('sintf.png') }}" style="max-height: 40px;">
                <div style="font-weight: bold; font-size: 9px; margin-top: 5px;">{{ $societe->raison_sociale ?? 'SINTF' }}</div>
            </td>
            
            <td style="width: 50%; text-align: center;">
                <div class="header-title">ETAT DE PAIEMENT PAR PERSONNEL OCCASIONNEL</div>
                <div style="font-size: 10px; font-weight: bold; color: #4b5563; text-transform: uppercase;">
                    Période du {{ $data['periode']['debut'] }} au {{ $data['periode']['fin'] }}
                </div>
            </td>
            
            <td style="width: 25%; text-align: right; vertical-align: top;">
                <div style="border: 1px solid #2d4a3e; padding: 4px; border-radius: 4px; text-align: center;">
                    <span class="info-label">Édité le</span><br>
                    <span style="font-size: 11px; font-weight: bold;">{{ now()->format('d/m/Y H:i') }}</span>
                </div>
            </td>
        </tr>
    </table>

    <!-- Fiche Signalétique de l'Agent -->
    <table class="info-grid">
        <tr>
            <td style="width: 40%;">
                <span class="info-label">Nom & Prénoms :</span><br>
                <span class="info-value" style="font-size: 14px;">{{ $data['personnel']['nom_complet'] }}</span><br>
                <span class="info-label">Matricule :</span> <span class="info-value" style="font-family: monospace;">{{ $data['personnel']['matricule'] }}</span>
            </td>
            <td style="width: 30%;">
                <span class="info-label">Sexe :</span> <span class="info-value">{{ $data['personnel']['sexe'] }}</span><br>
                <span class="info-label">Date Naissance :</span> <span class="info-value">{{ $data['personnel']['date_naissance'] }}</span>
            </td>
            <td style="width: 30%;">
                <span class="info-label">Téléphone :</span><br>
                <span class="info-value">{{ $data['personnel']['telephone'] }}</span>
            </td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 60px;">PRODUIT</th>
                <th>SECTION</th>
                <th style="width: 45px;" class="text-center">TYPE</th>
                <th style="width: 35px;" class="text-center">FICHES</th>
                <th style="width: 35px;" class="text-center">JOURS</th>
                <th style="width: 40px;" class="text-center">TAUX</th>
                <th style="width: 60px;" class="text-center">QTÉ TOTALE</th>
                <th style="width: 50px;" class="text-center">RDT MOYEN</th>
                <th style="width: 70px;" class="text-right">MONTANT</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data['lignes'] as $ligne)
            <tr>
                <td class="font-bold" style="font-size: 9px;">{{ $ligne['produit'] }}</td>
                <td class="font-bold">{{ $ligne['section'] }}</td>
                <td class="text-center" style="font-size: 8px;">{{ $ligne['type_pointage'] }}</td>
                <td class="text-center font-bold">{{ $ligne['nbre_pointage'] }}</td>
                <td class="text-center font-bold">{{ $ligne['nb_jours'] }}</td>
                <td class="text-center" style="font-family: monospace;">
                    {{ floor($ligne['taux']) == $ligne['taux'] ? (int)$ligne['taux'] : number_format($ligne['taux'], 2, ',', ' ') }}
                </td>
                <td class="text-center font-bold text-orange">
                    {{ number_format($ligne['quantite_totale'], 2, ',', ' ') }} <span style="font-size: 7px;">{{ $ligne['unite'] }}</span>
                </td>
                <td class="text-center font-bold">{{ number_format($ligne['rendement_moyen'], 2, ',', ' ') }}</td>
                <td class="text-right font-bold">{{ number_format($ligne['montant_a_payer'], 0, ',', ' ') }}</td>
            </tr>
            @empty
            <tr><td colspan="9" class="text-center" style="padding: 20px;">Aucune activité enregistrée sur cette période.</td></tr>
            @endforelse
        </tbody>
        @if(count($data['lignes']) > 0)
        <tfoot>
            <tr>
                <td colspan="8" class="text-right" style="text-transform: uppercase; padding-right: 15px; font-weight: bold;">Montant Total</td>
                <td class="text-right font-bold">{{ number_format($data['finances']['montant_total'], 0, ',', ' ') }}</td>
            </tr>
            <tr>
                <td colspan="8" class="text-right" style="text-transform: uppercase; padding-right: 15px; font-weight: bold; color: #dc2626;">Avance Déduite</td>
                <td class="text-right font-bold" style="color: #dc2626;">- {{ number_format($data['finances']['avance_deduite'], 0, ',', ' ') }}</td>
            </tr>
            <tr class="total-row">
                <td colspan="8" class="text-right" style="text-transform: uppercase; padding-right: 15px;">Net à Payer</td>
                <td class="text-right">{{ number_format($data['finances']['net_a_payer'], 0, ',', ' ') }} CFA</td>
            </tr>
        </tfoot>
        @endif
    </table>

    <table style="width: 100%; margin-top: 50px; border: none;">
        <tr>
            <td style="width: 33%; text-align: center; border: none;">
                <strong>L'Agent</strong><br><br><br>..........................................
            </td>
            <td style="width: 33%; text-align: center; border: none;">
                <strong>Le Caissier</strong><br><br><br>..........................................
            </td>
            <td style="width: 33%; text-align: center; border: none;">
                <strong>Le Superviseur</strong><br><br><br>..........................................
            </td>
        </tr>
    </table>

</body>
</html>