<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sections', function (Blueprint $table) {
            
            $table->dropColumn('taux_defaut');
            
            
            $table->decimal('taux_journalier', 10, 2)->after('nom_section');
            $table->decimal('taux_rendement', 10, 2)->after('taux_journalier');
            
            // Note: ton champ unite_mesure_id est déjà là grâce à ton autre migration, c'est parfait !
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sections', function (Blueprint $table) {
            
            $table->decimal('taux_defaut', 10, 2)->after('nom_section');
            $table->dropColumn(['taux_journalier', 'taux_rendement']);
        });
    }
};