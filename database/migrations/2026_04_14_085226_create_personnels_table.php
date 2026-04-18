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
        Schema::create('personnels', function (Blueprint $table) {
            $table->id();
            $table->string('matricule')->unique()->nullable();
            $table->string('nom');
            $table->string('prenom');
            $table->string('surnom')->nullable();
            $table->string('sexe', 1);
            $table->date('date_naissance');
            $table->string('lieu_naissance');
            $table->string('num_acte_naissance')->nullable();
            $table->string('num_cnib')->unique()->nullable();
            $table->date('date_cnib')->nullable();
            $table->string('lieu_cnib')->nullable();
            $table->string('num_cnss')->nullable();
            $table->date('date_cnss')->nullable();
            $table->string('telephone');
            $table->string('tel_compte_wave')->nullable();
            $table->boolean('est_marie')->default(false);
            $table->integer('nb_charge')->default(0);
            $table->string('niveau_etude')->nullable();
            $table->string('classification')->nullable();
            $table->foreignId('localite_domicile_id')->constrained('localites')->restrictOnDelete();
            $table->foreignId('site_travail_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('section_defaut_id')->nullable()->constrained('sections')->nullOnDelete();
            $table->boolean('actif')->default(true);
            $table->string('preference_paiement')->default('ESPECES');
            $table->string('import_batch')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Index ajoutés
            $table->index('actif');
            $table->index('preference_paiement');
            $table->index('import_batch');
            $table->index(['site_travail_id', 'section_defaut_id', 'actif'], 'idx_personnel_feuille');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personnels');
    }
};
