<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\ReferentielImportController;
use App\Http\Controllers\PersonnelController;
use App\Http\Controllers\PointageController;
use App\Http\Controllers\LocaliteController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\RegularisationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SocieteController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\ConsolidationController;

// ------------------------------------------------------------------
// ROUTE PUBLIQUE (Redirection automatique)
// ------------------------------------------------------------------
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
})->name('home');

// ------------------------------------------------------------------
// UTILISATEURS CONNECTÉS
// ------------------------------------------------------------------
Route::middleware(['auth', 'verified'])->group(function () {
    

    
    
    Route::get('/setup-profile', [UserController::class, 'firstLoginView'])->name('profileFirstLoginView');
    Route::post('/setup-profile', [UserController::class, 'firstLoginUpdate'])->name('profileFirstLoginUpdate');

    
    Route::middleware(['first.login'])->group(function () {
        
        // --- Dashboard ---
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // --- Référentiels Import ---
        Route::get('/referentiels/import', [ReferentielImportController::class, 'index'])->name('referentielsImportIndex');
        Route::post('/referentiels/preview', [ReferentielImportController::class, 'preview'])->name('referentielsImportPreview');
        Route::post('/referentiels/import', [ReferentielImportController::class, 'store'])->name('referentielsImportStore');

        // --- Gestion du personnel ---
        Route::get('/personnel', [PersonnelController::class, 'index'])->name('personnelIndex');
        Route::get('/personnel/create', [PersonnelController::class, 'create'])->name('personnelCreate');
        Route::post('/personnel', [PersonnelController::class, 'store'])->name('personnelStore');
        Route::get('/personnel/import', [PersonnelController::class, 'importIndex'])->name('personnelImportIndex');
        Route::get('/personnel/{personnel}/edit', [PersonnelController::class, 'edit'])->name('personnelEdit');
        Route::put('/personnel/{personnel}', [PersonnelController::class, 'update'])->name('personnelUpdate');
        Route::delete('/personnel/{personnel}', [PersonnelController::class, 'destroy'])->name('personnelDestroy');
        
        // --- Endpoints API Personnel ---
        Route::prefix('api')->group(function () {
            Route::post('/personnel/import/preview', [PersonnelController::class, 'importPreview'])->name('apiPersonnelImportPreview');
            Route::post('/personnel/import', [PersonnelController::class, 'importStore'])->name('apiPersonnelImportStore');
        });

        // --- Finance & Avances ---
        Route::get('/finance/avances', [FinanceController::class, 'avancesIndex'])->name('financeAvancesIndex');
        Route::get('/finance/avances/create', [FinanceController::class, 'avanceCreate'])->name('financeAvancesCreate');
        Route::post('/finance/avances', [FinanceController::class, 'avanceStore'])->name('financeAvancesStore');

        // --- États de paiement ---
        Route::get('/finance/etats', [FinanceController::class, 'etatsIndex'])->name('financeEtatsIndex');
        Route::get('/finance/etats/create', [FinanceController::class, 'etatCreate'])->name('financeEtatsCreate');
        Route::post('/finance/etats', [FinanceController::class, 'etatStore'])->name('financeEtatsStore');
        Route::post('/finance/etats/campagne', [FinanceController::class, 'etatStoreCampagne'])->name('financeEtatsCampagne');
        Route::get('/finance/etats/{etat}', [FinanceController::class, 'etatShow'])->name('financeEtatsShow');
        Route::post('/finance/etats/{etat}/valider', [FinanceController::class, 'etatValider'])->name('financeEtatsValider');
        Route::get('/finance/etats/{etat}/bordereau-caisse', [FinanceController::class, 'telechargerBordereauCaisse'])->name('financeEtatsBordereauCaisse');
        Route::delete('/finance/etats/{etat}', [FinanceController::class, 'etatDestroy'])->name('financeEtatsDestroy');

        // --- Paiement & Export ---
        Route::post('/finance/tickets/{ticket}/payer', [FinanceController::class, 'paiementEspeces'])->name('financeTicketsPayer');
        Route::post('/finance/tickets/{ticket}/retenue', [FinanceController::class, 'updateRetenue'])->name('financeTicketsUpdateRetenue');
        Route::post('/finance/etats/{etat}/payer-especes-masse', [FinanceController::class, 'etatPayerMassEspeces'])->name('financeEtatsPayerMassEspeces');
        Route::post('/finance/etats/{etat}/wave/generer', [FinanceController::class, 'genererLotWave'])->name('financeWaveGenerer');
        Route::get('/finance/wave/{lot}/telecharger', [FinanceController::class, 'telechargerLotWave'])->name('financeWaveTelecharger');
        Route::post('/finance/wave/{lot}/valider', [FinanceController::class, 'validerLotWave'])->name('financeWaveValider');
        Route::post('/finance/wave/generer-global', [FinanceController::class, 'genererLotWaveGlobal'])->name('financeWaveGenererGlobal');
        
        

        // --- Gestion des pointages ---
        Route::get('/pointages', [PointageController::class, 'index'])->name('pointageIndex');
        Route::get('/pointages/create', [PointageController::class, 'create'])->name('pointageCreate');
        Route::post('/pointages', [PointageController::class, 'store'])->name('pointageStore');
        Route::get('/pointages/{pointage}', [PointageController::class, 'show'])->name('pointageShow');
        
        
        Route::delete('/pointages/{pointage}', [PointageController::class, 'destroy'])->name('pointageDestroy');

        // --- Endpoints API Pointages ---
        Route::prefix('api')->group(function () {
            Route::post('/pointages/{pointage}/agents', [PointageController::class, 'addAgent'])->name('apiPointageAgentsAdd');
            Route::delete('/pointages/{pointage}/agents/{ligne}', [PointageController::class, 'removeAgent'])->name('apiPointageAgentsRemove');
            Route::post('/pointages/{pointage}/clear', [PointageController::class, 'clearAll'])->name('apiPointageClear');
            Route::post('/pointages/{pointage}/reset', [PointageController::class, 'resetToDefault'])->name('apiPointageReset');
            Route::get('/api/pointages/{pointage}/pdf', [PointageController::class, 'generatePdf'])->name('apiPointagePdf');
            Route::post('/pointages/{pointage}/submit', [PointageController::class, 'submitQuantities'])->name('apiPointageSubmit');
            Route::get('/personnel/search', [PointageController::class, 'searchPersonnel'])->name('apiPersonnelSearch');
            Route::post('/pointages/{pointage}/valider-preparation', [PointageController::class, 'validerPreparation'])->name('apiPointageValiderPreparation');
            Route::post('/pointages/{pointage}/annuler-cloture', [PointageController::class, 'annulerCloture'])->name('apiPointageAnnulerCloture');
            
            Route::post('/pointages/{pointage}/regul-positive', [RegularisationController::class, 'storePositive'])
                ->name('apiRegulPositiveStore');

            
            Route::post('/lignes/{ligne}/regul-negative', [RegularisationController::class, 'storeNegative'])
                ->name('apiRegulNegativeStore');
        });

        // --- Référentiels (Resources) ---
        Route::prefix('referentiels')->group(function () {
            Route::resource('localites', LocaliteController::class)->except(['show'])->names([
                'index'   => 'referentielsLocalitesIndex', 'create'  => 'referentielsLocalitesCreate', 'store'   => 'referentielsLocalitesStore',
                'edit'    => 'referentielsLocalitesEdit', 'update'  => 'referentielsLocalitesUpdate', 'destroy' => 'referentielsLocalitesDestroy',
            ]);
            Route::resource('sites', SiteController::class)->except(['show'])->names([
                'index'   => 'referentielsSitesIndex', 
                'create'  => 'referentielsSitesCreate', 
                'store'   => 'referentielsSitesStore',
                'edit'    => 'referentielsSitesEdit', 
                'update'  => 'referentielsSitesUpdate', 
                'destroy' => 'referentielsSitesDestroy',
            ]);
            Route::resource('produits', ProduitController::class)->except(['show'])->names([
                'index'   => 'referentielsProduitsIndex', 
                'create'  => 'referentielsProduitsCreate', 
                'store'   => 'referentielsProduitsStore',
                'edit'    => 'referentielsProduitsEdit', 
                'update'  => 'referentielsProduitsUpdate', 'destroy' => 'referentielsProduitsDestroy',
            ]);
            Route::resource('sections', SectionController::class)->except(['show'])->names([
                'index'   => 'referentielsSectionsIndex', 'create'  => 'referentielsSectionsCreate', 'store'   => 'referentielsSectionsStore',
                'edit'    => 'referentielsSectionsEdit', 'update'  => 'referentielsSectionsUpdate', 'destroy' => 'referentielsSectionsDestroy',
            ]);
        });

        // --- Régularisations ---
        Route::get('/regularisations/positive/{pointage}/create', [RegularisationController::class, 'createPositive'])->name('regularisationsPositiveCreate');
        Route::post('/regularisations/positive/{pointage}', [RegularisationController::class, 'storePositive'])->name('regularisationsPositiveStore');
        Route::get('/regularisations/negative/{ligne}/create', [RegularisationController::class, 'createNegative'])->name('regularisationsNegativeCreate');
        Route::post('/regularisations/negative/{ligne}', [RegularisationController::class, 'storeNegative'])->name('regularisationsNegativeStore');

        // --- Administration Système ---
        Route::resource('users', UserController::class)->except(['show'])->names([
            'index' => 'usersIndex', 'create' => 'usersCreate', 'store' => 'usersStore', 
            'edit' => 'usersEdit', 'update' => 'usersUpdate', 'destroy' => 'usersDestroy'
        ]);

        Route::get('/societe/edit', [SocieteController::class, 'edit'])->name('societeEdit');
        Route::post('/societe/update', [SocieteController::class, 'update'])->name('societeUpdate');

        Route::resource('roles', RoleController::class)->except(['show'])->names([
            'index' => 'rolesIndex', 'create' => 'rolesCreate', 'store' => 'rolesStore', 
            'edit' => 'rolesEdit', 'update' => 'rolesUpdate', 'destroy' => 'rolesDestroy'
        ]);

        Route::resource('permissions', PermissionController::class)->except(['show'])->names([
            'index' => 'permissionsIndex', 'create' => 'permissionsCreate', 'store' => 'permissionsStore', 
            'edit' => 'permissionsEdit', 'update' => 'permissionsUpdate', 'destroy' => 'permissionsDestroy'
        ]);

        Route::get('/finance/consolidation', [ConsolidationController::class, 'index'])->name('financeConsolidationIndex');
        Route::get('/finance/consolidation/bordereau-especes', [ConsolidationController::class, 'telechargerBordereauEspeces'])->name('financeConsolidationBordereauEspeces');
        Route::post('/finance/payer-tout-especes', [FinanceController::class, 'payerToutEspecesUsine'])->name('financePayerToutEspeces');

    }); 
}); 


require __DIR__.'/settings.php';