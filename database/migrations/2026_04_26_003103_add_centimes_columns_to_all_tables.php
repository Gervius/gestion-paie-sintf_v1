<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Sections
        Schema::table('sections', function (Blueprint $table) {
            $table->bigInteger('taux_journalier_centimes')->default(0)->after('taux_rendement');
            $table->bigInteger('taux_rendement_centimes')->default(0)->after('taux_journalier_centimes');
        });
        DB::table('sections')->update([
            'taux_journalier_centimes' => DB::raw('ROUND(taux_journalier * 100)'),
            'taux_rendement_centimes' => DB::raw('ROUND(taux_rendement * 100)'),
        ]);

        // Pointages
        Schema::table('pointages', function (Blueprint $table) {
            $table->bigInteger('taux_applique_centimes')->default(0)->after('taux_applique');
        });
        DB::table('pointages')->update([
            'taux_applique_centimes' => DB::raw('ROUND(taux_applique * 100)'),
        ]);

        // Pointage Lignes
        Schema::table('pointage_lignes', function (Blueprint $table) {
            $table->bigInteger('montant_brut_centimes')->default(0)->after('montant_brut');
        });
        DB::table('pointage_lignes')->update([
            'montant_brut_centimes' => DB::raw('ROUND(montant_brut * 100)'),
        ]);

        // Ticket Paiements
        Schema::table('ticket_paiements', function (Blueprint $table) {
            $table->bigInteger('montant_brut_cumule_centimes')->default(0)->after('quantite_totale');
            $table->bigInteger('montant_deduit_manuel_centimes')->default(0)->after('montant_brut_cumule_centimes');
            $table->bigInteger('montant_net_centimes')->default(0)->after('montant_deduit_manuel_centimes');
        });
        DB::table('ticket_paiements')->update([
            'montant_brut_cumule_centimes' => DB::raw('ROUND(montant_brut_cumule * 100)'),
            'montant_deduit_manuel_centimes' => DB::raw('ROUND(montant_deduit_manuel * 100)'),
            'montant_net_centimes' => DB::raw('ROUND(montant_net * 100)'),
        ]);

        // État Paiements
        Schema::table('etat_paiements', function (Blueprint $table) {
            $table->bigInteger('montant_total_brut_centimes')->default(0)->after('montant_total_net');
            $table->bigInteger('montant_total_net_centimes')->default(0)->after('montant_total_brut_centimes');
        });
        DB::table('etat_paiements')->update([
            'montant_total_brut_centimes' => DB::raw('ROUND(montant_total_brut * 100)'),
            'montant_total_net_centimes' => DB::raw('ROUND(montant_total_net * 100)'),
        ]);

        // Avances
        Schema::table('avances', function (Blueprint $table) {
            $table->bigInteger('montant_initial_centimes')->default(0)->after('solde_restant');
            $table->bigInteger('solde_restant_centimes')->default(0)->after('montant_initial_centimes');
        });
        DB::table('avances')->update([
            'montant_initial_centimes' => DB::raw('ROUND(montant_initial * 100)'),
            'solde_restant_centimes' => DB::raw('ROUND(solde_restant * 100)'),
        ]);
    }

    public function down(): void
    {
        Schema::table('sections', function (Blueprint $table) {
            $table->dropColumn(['taux_journalier_centimes', 'taux_rendement_centimes']);
        });
        Schema::table('pointages', function (Blueprint $table) {
            $table->dropColumn('taux_applique_centimes');
        });
        Schema::table('pointage_lignes', function (Blueprint $table) {
            $table->dropColumn('montant_brut_centimes');
        });
        Schema::table('ticket_paiements', function (Blueprint $table) {
            $table->dropColumn(['montant_brut_cumule_centimes', 'montant_deduit_manuel_centimes', 'montant_net_centimes']);
        });
        Schema::table('etat_paiements', function (Blueprint $table) {
            $table->dropColumn(['montant_total_brut_centimes', 'montant_total_net_centimes']);
        });
        Schema::table('avances', function (Blueprint $table) {
            $table->dropColumn(['montant_initial_centimes', 'solde_restant_centimes']);
        });
    }
};