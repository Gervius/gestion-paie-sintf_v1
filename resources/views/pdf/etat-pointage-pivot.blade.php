<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        /* 🚨 Format Paysage Forcé */
        @page { size: A4 landscape; margin: 30px 20px 50px 20px; }
        body { font-family: 'Helvetica', sans-serif; font-size: 9px; color: #1a1a1a; }
        
        footer {
            position: fixed; bottom: -30px; left: 0; right: 0;
            height: 30px; text-align: center; font-size: 8px;
            color: #4b5563; border-top: 1px solid #e5e7eb; padding-top: 5px;
        }

        .header-table { width: 100%; border-bottom: 2px solid #2d4a3e; padding-bottom: 10px; margin-bottom: 15px; }
        .header-title { font-size: 16px; font-weight: bold; text-transform: uppercase; color: #2d4a3e; text-align: center; margin-bottom: 5px; }
        
        .info-grid { background-color: #f9fafb; border: 1px solid #d1d5db; padding: 8px; border-radius: 4px; width: 100%; margin-bottom: 15px; }
        .info-label { font-weight: bold; color: #4b5563; font-size: 8px; text-transform: uppercase; }
        .info-value { font-weight: bold; font-size: 11px; color: #111827; }

        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { border: 1px solid #666; padding: 6px 4px; vertical-align: middle; }
        .data-table th { background-color: #f3f4f6; font-size: 8px; text-transform: uppercase; font-weight: bold; text-align: center; }
        
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .font-bold { font-weight: bold; }
        .bg-light { background-color: #f9fafb; }
        
        /* Bloc Signatures */
        .signatures { width: 100%; margin-top: 40px; border: none; page-break-inside: avoid; }
        .signatures td { border: none; text-align: center; width: 33%; font-size: 11px; }
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
                <!-- 🚨 Correction appliquée : sintf.png -->
                <img src="{{ public_path('sintf.png') }}" style="max-height: 40px;">
                <div style="font-weight: bold; font-size: 9px; margin-top: 5px;">{{ $societe->raison_sociale ?? 'SINTF' }}</div>
            </td>
            
            <td style="width: 60%; text-align: center;">
                <div class="header-title">ETAT DE POINTAGE PAR SECTION</div>
                <div style="font-size: 10px; font-weight: bold; color: #4b5563; text-transform: uppercase;">
                    Période du {{ $data['periode']['debut'] }} au {{ $data['periode']['fin'] }}
                </div>
            </td>
            
            <td style="width: 20%; text-align: right; vertical-align: top;">
                <div style="border: 1px solid #2d4a3e; padding: 4px; border-radius: 4px; text-align: center;">
                    <span class="info-label">Édité le</span><br>
                    <span style="font-size: 11px; font-weight: bold;">{{ now()->format('d/m/Y H:i') }}</span>
                </div>
            </td>
        </tr>
    </table>

    <table class="info-grid">
        <tr>
            <td style="width: 50%;">
                <span class="info-label">Produit :</span> <span class="info-value">{{ $data['infos']['produit'] }}</span>
            </td>
            <td style="width: 50%; text-align: right;">
                <span class="info-label">Section :</span> <span class="info-value">{{ $data['infos']['section'] }}</span>
            </td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th class="text-left" style="width: 25%;">MATRICULE & NOM</th>
                <th style="width: 8%;">QTÉ TOT.</th>
                <th style="width: 12%;">MONTANT TOT.</th>
                <!-- Boucle sur les Jours -->
                @foreach($data['colonnes'] as $col)
                    <th>{{ $col['label'] }}</th>
                @endforeach
                <th style="width: 15%;">SIGNATURE</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data['lignes'] as $ligne)
            <tr>
                <td class="text-left">
                    <strong style="font-size: 10px;">{{ $ligne['nom_complet'] }}</strong><br>
                    <span style="font-size: 8px; color: #666; font-family: monospace;">{{ $ligne['matricule'] }}</span>
                </td>
                
                <td class="text-center font-bold">
                    {{ $ligne['total_quantite'] > 0 ? (floor($ligne['total_quantite']) == $ligne['total_quantite'] ? (int)$ligne['total_quantite'] : number_format($ligne['total_quantite'], 2, ',', ' ')) : '-' }}
                </td>
                
                <td class="text-right font-bold" style="color: #065f46;">
                    {{ $ligne['total_montant'] > 0 ? number_format($ligne['total_montant'], 0, ',', ' ') : '-' }}
                </td>

                <!-- Valeurs des Jours Dynamiques -->
                @foreach($data['colonnes'] as $col)
                    @php $val = $ligne['pointages_qte'][$col['cle']]; @endphp
                    <td class="text-center" style="{{ $val > 0 ? 'background-color: #fff7ed; font-weight: bold;' : 'color: #9ca3af;' }}">
                        {{ $val > 0 ? (floor($val) == $val ? (int)$val : number_format($val, 2, ',', ' ')) : '-' }}
                    </td>
                @endforeach
                
                <!-- 🚨 NOUVELLE CELLULE : Espace de Signature -->
                <td style="vertical-align: bottom; text-align: center; color: #9ca3af; padding-bottom: 5px;">
                    .............................
                </td>
            </tr>
            @empty
            <tr>
                <!-- 🚨 CORRECTION DU COLSPAN (+4 au lieu de +3) -->
                <td colspan="{{ count($data['colonnes']) + 4 }}" class="text-center" style="padding: 20px;">Aucun pointage trouvé.</td>
            </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr style="background-color: #e5e7eb; font-size: 10px;">
                <td class="text-right font-bold" style="text-transform: uppercase;">Total Global</td>
                
                <td class="text-center font-bold">
                    {{ $data['totaux']['global_quantite'] > 0 ? (floor($data['totaux']['global_quantite']) == $data['totaux']['global_quantite'] ? (int)$data['totaux']['global_quantite'] : number_format($data['totaux']['global_quantite'], 2, ',', ' ')) : '-' }}
                </td>
                
                <td class="text-right font-bold" style="color: #065f46;">
                    {{ $data['totaux']['global_montant'] > 0 ? number_format($data['totaux']['global_montant'], 0, ',', ' ') : '-' }}
                </td>

                <!-- Boucle sur les totaux par jour -->
                @foreach($data['colonnes'] as $col)
                    @php $totVal = $data['totaux']['jours'][$col['cle']]; @endphp
                    <td class="text-center font-bold" style="color: #c2410c;">
                        {{ $totVal > 0 ? (floor($totVal) == $totVal ? (int)$totVal : number_format($totVal, 2, ',', ' ')) : '-' }}
                    </td>
                @endforeach
                
                <!-- Cellule vide pour la colonne Signature -->
                <td style="background-color: #f3f4f6;"></td>
            </tr>
        </tfoot>
    </table>
    

    <!-- 🚨 Bloc de Signatures -->
    <table class="signatures">
        <tr>
            <td>
                <strong>Le Chef de Section / Pointeur</strong><br><br><br><br>
                ......................................................
            </td>
            <td>
                <strong>Le Superviseur Production</strong><br><br><br><br>
                ......................................................
            </td>
            <td>
                <strong>La Direction Générale</strong><br><br><br><br>
                ......................................................
            </td>
        </tr>
    </table>

</body>
</html>