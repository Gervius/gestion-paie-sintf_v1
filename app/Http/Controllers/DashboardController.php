<?php

namespace App\Http\Controllers;

use App\Models\Pointage;
use App\Models\TicketPaiement;
use App\Models\Avance;
use App\Models\Personnel;
use App\Models\EtatPaiement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $data = [
            'userName' => $user->name,
            'roles'    => $user->getRoleNames(),
            'quickLinks' => [],
            'kpis' => [],
        ];

        // --- Pointeur ---
        if ($user->can('creer_pointage')) {
            $aujourdhui = now()->toDateString();
            $data['kpis']['pointages_jour'] = Pointage::where('date_pointage', $aujourdhui)
                ->whereIn('statut', ['PREPARATION', 'EDITE_TERRAIN'])
                ->count();

            $data['quickLinks'][] = [
                'label' => 'Créer un pointage',
                'url'   => route('pointageCreate'),
                'icon'  => 'ClipboardList',
            ];
            $data['quickLinks'][] = [
                'label' => 'Voir les pointages',
                'url'   => route('pointageIndex'),
                'icon'  => 'Calendar',
            ];
        }

        // --- Chef de section ---
        if ($user->can('valider_etat_paiement')) {
            $data['kpis']['etats_a_valider'] = EtatPaiement::where('statut', 'PROVISOIRE')->count();

            $data['quickLinks'][] = [
                'label' => 'États de paiement',
                'url'   => route('financeEtatsIndex'),
                'icon'  => 'FileCheck',
            ];
        }

        // --- Caissier ---
        if ($user->can('voir_ticket_valide')) {
            $data['kpis']['tickets_en_attente'] = TicketPaiement::where('statut', 'NON_SOLDE')
                ->whereHas('etatPaiement', fn($q) => $q->where('statut', 'VALIDE'))
                ->count();

            $data['quickLinks'][] = [
                'label' => 'Avances',
                'url'   => route('financeAvancesIndex'),
                'icon'  => 'Wallet',
            ];
        }

        // --- RH / Import ---
        if ($user->can('importer_personnel')) {
            $data['kpis']['employes_actifs'] = Personnel::where('actif', true)->count();

            $data['quickLinks'][] = [
                'label' => 'Importer du personnel',
                'url'   => route('personnelImportIndex'),
                'icon'  => 'Upload',
            ];
            $data['quickLinks'][] = [
                'label' => 'Liste du personnel',
                'url'   => route('personnelIndex'),
                'icon'  => 'Users',
            ];
        }

        
        // --- Référentiels ---
        if ($user->can('gerer_referentiels')) {
            $data['quickLinks'][] = [
                'label' => 'Sites',
                'url'   => route('referentielsSitesIndex'),
                'icon'  => 'Building',
            ];
            $data['quickLinks'][] = [
                'label' => 'Sections',
                'url'   => route('referentielsSectionsIndex'),
                'icon'  => 'Layers',
            ];
            $data['quickLinks'][] = [
                'label' => 'Importer référentiels',
                'url'   => route('referentielsImportIndex'),
                'icon'  => 'FileSpreadsheet',
            ];
        }

        // --- Régularisations ---
        if ($user->can('creer_regularisation')) {
            $data['quickLinks'][] = [
                'label' => 'Régularisations',
                'url'   => route('pointageIndex'), // À affiner si page dédiée
                'icon'  => 'Pencil',
            ];
        }

        // --- Admin (Super Admin ou permission étendue) ---
        if ($user->can('*') || $user->can('acceder_dashboard_admin')) {
            $data['kpis']['masse_salariale_jour'] = Pointage::where('date_pointage', now()->toDateString())
                ->where('statut', 'CLOTURE')
                ->withSum('lignes', 'montant_brut')
                ->get()
                ->sum('lignes_sum_montant_brut');

            $data['kpis']['avances_non_soldees'] = Avance::where('statut', 'ACTIVE')->sum('solde_restant');
            $data['kpis']['total_employes'] = Personnel::count();

            $data['quickLinks'][] = [
                'label' => 'Utilisateurs',
                'url'   => route('usersIndex'),
                'icon'  => 'UserCog',
            ];
            $data['quickLinks'][] = [
                'label' => 'Rôles',
                'url'   => route('rolesIndex'),
                'icon'  => 'Shield',
            ];
            $data['quickLinks'][] = [
                'label' => 'Permissions',
                'url'   => route('permissionsIndex'),
                'icon'  => 'Key',
            ];
            $data['quickLinks'][] = [
                'label' => 'Paramètres société',
                'url'   => route('societeEdit'),
                'icon'  => 'Building2',
            ];
        }

        return Inertia::render('dashboard', $data);
    }
}