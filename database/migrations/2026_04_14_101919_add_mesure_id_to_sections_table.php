<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('sections', function (Blueprint $table) {
            $table->foreignId('unite_mesure_id')
                  ->nullable()
                  ->after('taux_defaut')
                  ->constrained('unites_mesures')
                  ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sections', function (Blueprint $table) {
            $table->dropForeign(['unite_mesure_id']);
            $table->dropColumn('unite_mesure_id');
        });
    }
};
