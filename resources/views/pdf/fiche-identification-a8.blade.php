<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page { margin: 0; size: 52mm 74mm; }
        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            padding: 1.5mm;
            width: 49mm;
            font-size: 5pt;
            color: #1a202c;
            line-height: 1.2;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-sizing: border-box;
        }

        /* --- EN-TÊTE (version fiche7) --- */
        .header {
            text-align: center;
            border-bottom: 0.5pt solid #000;
            margin-bottom: 1.5mm;
            padding-bottom: 0.5mm;
        }
        .logo {
            max-width: 10mm;
            max-height: 7mm;
            margin: 0 auto 0.5mm auto;
        }
        .company-name {
            font-weight: 900;
            font-size: 8pt;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
        }
        .badge-title {
            font-size: 5.5pt;
            font-weight: bold;
            color: #2d3748;
        }
        .subtitle {
            font-size: 4.5pt;
            color: #4a5568;
            margin-top: 0.2mm;
        }

        /* --- Site --- */
        .site {
            text-align: center;
            font-size: 5pt;
            font-weight: bold;
            background: #f2f2f2;
            padding: 1mm 0;
            margin-bottom: 2mm;
            border-radius: 1mm;
        }

        /* --- Matricule --- */
        .matricule-box {
            background: #f7fafc;
            border: 0.8pt solid #cbd5e0;
            border-radius: 2mm;
            padding: 2mm 1mm;
            text-align: center;
            margin-bottom: 2mm;
            position: relative;
        }
        .matricule-label {
            font-size: 4pt;
            color: #718096;
            text-transform: uppercase;
        }
        .matricule-value {
            font-size: 16pt;
            font-weight: 900;
            letter-spacing: 1pt;
            display: block;
            line-height: 1.2;
        }
        /* Petit texte créateur */
        .creator {
            font-size: 3pt;
            color: #aaa;
            text-align: center;
            margin-top: 1mm;
        }

        /* --- Infos --- */
        .section-title {
            font-size: 4.5pt;
            font-weight: bold;
            border-left: 1.5pt solid #333;
            padding-left: 1mm;
            margin: 1.5mm 0 1mm 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1mm;
        }
        .info-label {
            font-size: 4pt;
            color: #718096;
            text-transform: uppercase;
        }
        .info-value {
            font-weight: bold;
            font-size: 5pt;
        }
        .nom {
            font-size: 7pt;
            font-weight: 900;
            text-transform: uppercase;
        }

        /* --- Signature fixée en bas --- */
        .signature-area {
            margin-top: 0;
            height: 7mm;
            border: 0.4pt dashed #aaa;
            position: relative;
            flex-shrink: 0;
        }
        .signature-label {
            position: absolute;
            bottom: 0.5mm;
            right: 1mm;
            font-size: 3.5pt;
            color: #aaa;
        }
    </style>
</head>
<body>

<div>
    <!-- EN-TÊTE (version fiche7) -->
    <div class="header">
        <img src="{{ public_path('sintf.png') }}" class="logo" alt="Logo SINTF">
        <div class="company-name">SINTF Sarl</div>
        <div class="badge-title">FICHE INDIVIDUELLE</div>
        <div class="subtitle">Main d'œuvre Occasionnelle</div>
    </div>

    <div class="site">
        SITE : {{ $personnel->siteTravail->nom_site ?? 'N/A' }}
    </div>

    <div class="matricule-box">
        <span class="matricule-label">Code Matricule</span>
        <span class="matricule-value">{{ $personnel->matricule }}</span>
        <!-- Petit texte optionnel du créateur -->
        @if(isset($createdBy))
            <div class="creator">Créé par : {{ $createdBy }}</div>
        @endif
    </div>

    <div class="section-title">Identité & Contact</div>

    <div class="info-row">
        <span class="info-label">Nom & Prénom(s)</span>
        <span class="info-value nom">{{ strtoupper($personnel->nom) }} {{ $personnel->prenom }}</span>
    </div>

    <div class="info-row">
        <span class="info-label">Téléphone</span>
        <span class="info-value">
            {{ $personnel->a_telephone_propre ? $personnel->telephone : $personnel->telephone_sc }}
        </span>
    </div>

    <div class="info-row">
        <span class="info-label">N° CNIB</span>
        <span class="info-value">{{ $personnel->num_cnib ?? 'N/A' }}</span>
    </div>
</div>

<div class="signature-area">
    <span class="signature-label">Signature de l'agent</span>
</div>

</body>
</html>