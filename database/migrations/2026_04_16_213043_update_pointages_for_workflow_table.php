<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pointages', function (Blueprint $table) {
            $table->string('type_pointage')->default('RENDEMENT')->after('section_id');
            $table->dropUnique('unique_feuille_pointage');
            $table->unique(
                ['date_pointage', 'site_id', 'section_id', 'type_pointage'],
                'unique_feuille_pointage'
            );
        });

        DB::table('pointages')->where('statut', 'BROUILLON')->update(['statut' => 'PREPARATION']);
    }

    public function down(): void
    {
        Schema::table('pointages', function (Blueprint $table) {
            $table->dropUnique('unique_feuille_pointage');
            $table->unique(['date_pointage', 'site_id', 'section_id'], 'unique_feuille_pointage');
            $table->dropColumn('type_pointage');
        });

        DB::table('pointages')->where('statut', 'PREPARATION')->update(['statut' => 'BROUILLON']);
    }
};