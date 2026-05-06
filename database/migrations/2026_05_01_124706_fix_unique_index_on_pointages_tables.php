<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pointages', function (Blueprint $table) {
            
            $table->dropUnique('unique_feuille_pointage');
            
            
            $table->unique(
                ['date_pointage', 'site_id', 'section_id', 'type_pointage', 'deleted_at'],
                'unique_feuille_pointage'
            );
        });
    }
    

    public function down(): void
    {
        Schema::table('pointages', function (Blueprint $table) {
            $table->dropUnique('unique_feuille_pointage');
            
            
            $table->unique(
                ['date_pointage', 'site_id', 'section_id', 'type_pointage'],
                'unique_feuille_pointage'
            );
        });
    }
};