<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page { margin: 0; size: 52mm 74mm; }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            margin: 0;
            padding: 2mm;
            width: 48mm;
            height: auto;
            color: #1a202c;
            line-height: 1.15;
            font-size: 5pt;
        }
        
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
        
        /* Bloc design pour Site et Matricule */
        .meta {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #f8fafc;
            border-radius: 3pt;
            border: 0.3pt solid #cbd5e0;
            padding: 1.5mm 2mm;
            margin-bottom: 2mm;
        }
        .meta-site {
            display: flex;
            align-items: baseline;
            gap: 1mm;
        }
        .meta-matricule {
            display: flex;
            align-items: baseline;
            gap: 1mm;
        }
        .meta-label {
            font-weight: bold;
            font-size: 4.5pt;
            text-transform: uppercase;
            color: #64748b;
            white-space: nowrap;
        }
        .meta-value {
            font-weight: 700;
            font-size: 6.5pt;
            color: #1e293b;
        }
        .matricule {
            font-weight: 900;
            font-size: 9pt;
            color: #000;
            letter-spacing: 0.5pt;
        }
        
        .section-title {
            font-size: 5.5pt;
            font-weight: 900;
            text-transform: uppercase;
            background: #edf2f7;
            padding: 0.7mm 1mm;
            margin-bottom: 1.5mm;
            text-align: center;
            letter-spacing: 0.3pt;
        }
        
        .info-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 0 2mm;
            margin-bottom: 2mm;
        }
        .info-block {
            width: calc(50% - 1mm);
            margin-bottom: 1.2mm;
            break-inside: avoid;
        }
        .info-block.full {
            width: 100%;
        }
        .info-label {
            font-size: 4.5pt;
            font-weight: bold;
            color: #718096;
            text-transform: uppercase;
            margin-bottom: 0.2mm;
        }
        .info-value {
            font-weight: 700;
            font-size: 6pt;
            word-break: break-word;
        }
        .nom-value {
            font-weight: 900;
            font-size: 7.5pt;
            color: #000;
        }
        
        .footer {
            position: absolute;
            bottom: 2.5mm;
            left: 2mm;
            right: 2mm;
            font-size: 4.5pt;
            text-align: center;
            border-top: 0.3pt dashed #cbd5e0;
            padding-top: 1mm;
        }
        .signature-box {
            margin-top: 1.5mm;
            border: 0.4pt dashed #a0aec0;
            height: 8mm;
            position: relative;
        }
        .signature-label {
            position: absolute;
            bottom: 0.5mm;
            width: 100%;
            font-size: 4pt;
            color: #a0aec0;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="{{ public_path('sintf.png') }}" class="logo" alt="Logo SINTF">
        <div class="company-name">SINTF Sarl</div>
        <div class="badge-title">FICHE INDIVIDUELLE</div>
        <div class="subtitle">Main d'œuvre Occasionnelle</div>
    </div>

    <!-- Site et Matricule sur la même ligne, avec un design soigné -->
    <div class="meta">
        <div class="meta-site">
            <span class="meta-label">Site</span>
            <span class="meta-value">{{ $personnel->siteTravail->nom_site ?? 'N/A' }}</span>
        </div>
        <div class="meta-matricule">
            <span class="meta-label">Matricule</span>
            <span class="matricule">{{ $personnel->matricule }}</span>
        </div>
    </div>

    <div class="section-title">Identité & Contact</div>

    <div class="info-grid">
        <div class="info-block full">
            <div class="info-label">Nom & Prénom(s)</div>
            <div class="nom-value">{{ strtoupper($personnel->nom) }} {{ $personnel->prenom }}</div>
        </div>
        @if($personnel->surnom)
        <div class="info-block">
            <div class="info-label">Surnom</div>
            <div class="info-value">{{ $personnel->surnom }}</div>
        </div>
        @endif
        <div class="info-block">
            <div class="info-label">Téléphone</div>
            <div class="info-value">
                {{ $personnel->a_telephone_propre ? $personnel->telephone : $personnel->telephone_sc . ' (S/C)' }}
            </div>
        </div>
        <div class="info-block">
            <div class="info-label">N° CNIB</div>
            <div class="info-value">{{ $personnel->num_cnib }}</div>
        </div>
    </div>

    <div class="footer">
        <div class="signature-box">
            <div class="signature-label">Visa Superviseur Pointage</div>
        </div>
    </div>
</body>
</html>