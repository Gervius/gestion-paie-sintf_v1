<?php

// Fichier de migration 
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Le Master Switch sur le Pointage
        Schema::table('pointages', function (Blueprint $table) {
            $table->boolean('garantie_journaliere_active')->default(false);
        });

        
        Schema::table('pointage_lignes', function (Blueprint $table) {
            $table->integer('montant_compensation_centimes')->default(0); 
        });
    }

    public function down(): void
    {
        Schema::table('pointages', function (Blueprint $table) {
            $table->dropColumn('garantie_journaliere_active');
        });
        Schema::table('pointage_lignes', function (Blueprint $table) {
            $table->dropColumn('montant_compensation_centimes');
        });
    }

};