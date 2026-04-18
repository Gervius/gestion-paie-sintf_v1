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
        Schema::create('pointage_lignes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pointage_id')->constrained('pointages')->cascadeOnDelete();
            $table->foreignId('personnel_id')->constrained('personnels')->restrictOnDelete();
            $table->string('matricule_personnel');
            $table->decimal('quantite', 10, 2);
            $table->decimal('montant_brut', 10, 2);
            $table->string('type_ligne')->default('NORMAL');
            $table->string('motif_regularisation')->nullable();
            $table->string('statut_ligne')->default('EN_ATTENTE');
            $table->foreignId('ticket_paiement_id')->nullable()->constrained('ticket_paiements')->restrictOnDelete();
            $table->timestamps();

            $table->index('statut_ligne');
            $table->index('ticket_paiement_id');
            $table->index(['pointage_id', 'statut_ligne']); // pour recherche des lignes actives d'une feuille
            $table->index(['personnel_id', 'statut_ligne']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pointage_lignes');
    }
};
