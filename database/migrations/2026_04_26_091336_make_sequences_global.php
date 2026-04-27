<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Supprimer la contrainte unique et les colonnes inutiles
        Schema::table('sequences', function (Blueprint $table) {
            $table->dropUnique('sequences_site_code_annee_unique');
            $table->dropColumn(['site_code', 'annee']);
        });

        // Vider la table et insérer une ligne unique
        DB::table('sequences')->truncate();
        DB::table('sequences')->insert([
            'dernier_numero' => 0,           // sera mis à jour par le seeder ou le générateur
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::table('sequences', function (Blueprint $table) {
            $table->string('site_code')->nullable()->after('id');
            $table->year('annee')->nullable()->after('site_code');
            $table->unique(['site_code', 'annee'], 'sequences_site_code_annee_unique');
        });
    }
};