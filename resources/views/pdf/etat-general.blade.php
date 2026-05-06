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
        .header-title { font-size: 18px; font-weight: bold; text-transform: uppercase; color: #2d4a3e; text-align: center; margin-bottom: 5px; }
        
        .info-grid { background-color: #f9fafb; border: 1px solid #d1d5db; padding: 8px; border-radius: 4px; width: 100%; }
        .info-label { font-weight: bold; color: #4b5563; font-size: 8px; text-transform: uppercase; }
        .info-value { font-weight: bold; font-size: 10px; color: #111827; }

        .data-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .data-table th, .data-table td { border: 1px solid #666; padding: 8px 6px; vertical-align: middle; }
        .data-table th { background-color: #f3f4f6; font-size: 9px; text-transform: uppercase; font-weight: bold; }
        
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .bg-light { background-color: #f9fafb; }
        .text-red { color: #dc2626; }
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
            @if($societe->rccm) — RCCM : {{ $societe->rccm }} @endif
        @endif
    </footer>

    <table class="header-table">
        <tr>
            <td style="width: 25%;">
                <img src="{{ public_path('sintf.png') }}" style="max-height: 50px;">
                <div style="font-weight: bold; font-size: 9px; margin-top: 5px;">{{ $societe->raison_sociale ?? 'SINTF' }}</div>
            </td>
            
            <td style="width: 50%; text-align: center;">
                <div class="header-title">État Général de la Paie</div>
                <table class="info-grid">
                    <tr>
                        <td><span class="info-label">Période :</span> <span class="info-value">Du {{ $data['periode']['debut'] }} au {{ $data['periode']['fin'] }}</span></td>
                    </tr>
                    <tr>
                        <td><span class="info-label">Site :</span> <span class="info-value">{{ $site_nom ?? 'Tous les sites' }}</span></td>
                    </tr>
                    <tr>
                        <td><span class="info-label">Produit :</span> <span class="info-value">{{ $produit_nom ?? 'Tous les produits' }}</span></td>
                    </tr>
                </table>
            </td>
            
            <td style="width: 25%; text-align: right; vertical-align: top;">
                <div style="border: 1px solid #2d4a3e; padding: 4px; border-radius: 4px; text-align: center;">
                    <span class="info-label">Édité le</span><br>
                    <span style="font-size: 11px; font-weight: bold;">{{ now()->format('d/m/Y à H:i') }}</span>
                </div>
            </td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 30px;" class="text-center">N°</th>
                <th>SECTION DE PRODUCTION</th>
                <th style="width: 120px;" class="text-right">COÛT BRUT (CFA)</th>
                <th style="width: 120px;" class="text-right">AVANCE PAYÉE (CFA)</th>
                <th style="width: 120px;" class="text-right">TOTAL À PAYER (CFA)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data['lignes'] as $index => $ligne)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td class="font-bold">{{ $ligne['section'] }}</td>
                <td class="text-right">{{ number_format($ligne['montant_a_payer'], 0, ',', ' ') }}</td>
                <td class="text-right">{{ $ligne['avance_payee'] > 0 ? number_format($ligne['avance_payee'], 0, ',', ' ') : '-' }}</td>
                <td class="text-right font-bold">{{ number_format($ligne['montant_total'], 0, ',', ' ') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="5" class="text-center" style="padding: 20px;">Aucune donnée pour cette période.</td>
            </tr>
            @endforelse
        </tbody>
        @if(count($data['lignes']) > 0)
        <tfoot>
            <tr class="bg-light">
                <td colspan="2" class="text-right font-bold" style="text-transform: uppercase;">Total Brut Production</td>
                <td class="text-right font-bold">{{ number_format($data['totaux']['brut'], 0, ',', ' ') }}</td>
                <td colspan="2"></td>
            </tr>
            <tr class="bg-light text-red">
                <td colspan="3" class="text-right font-bold" style="text-transform: uppercase;">Total Retenues (Avances)</td>
                <td class="text-right font-bold">- {{ number_format($data['totaux']['avance'], 0, ',', ' ') }}</td>
                <td></td>
            </tr>
            <tr class="total-row">
                <td colspan="4" class="text-right" style="text-transform: uppercase;">Montant Net Total à Décaisser</td>
                <td class="text-right">{{ number_format($data['totaux']['net'], 0, ',', ' ') }} CFA</td>
            </tr>
        </tfoot>
        @endif
    </table>

    <table style="width: 100%; margin-top: 40px; border: none;">
        <tr>
            <td style="width: 50%; text-align: center; border: none;">
                <strong>Le Comptable / Caissier</strong><br><br><br>..........................................
            </td>
            <td style="width: 50%; text-align: center; border: none;">
                <strong>La Direction</strong><br><br><br>..........................................
            </td>
        </tr>
    </table>

</body>
</html>