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
        Schema::create('ticket_paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('personnel_id')->constrained('personnels')->restrictOnDelete();
            $table->foreignId('etat_paiement_id')->nullable()->constrained('etat_paiements')->cascadeOnDelete();
            $table->foreignId('lot_wave_id')->nullable()->constrained('lots_paiements_waves')->nullOnDelete();
            $table->date('date_generation');
            $table->decimal('montant_brut_cumule', 10, 2);
            $table->decimal('montant_deduit_manuel', 10, 2)->default(0);
            $table->decimal('montant_net', 10, 2);
            $table->string('mode_paiement');
            $table->string('reference_paiement')->nullable();
            $table->string('statut')->default('NON_SOLDE');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['personnel_id', 'statut']);
            $table->index('statut');
            $table->unique(['personnel_id', 'etat_paiement_id'], 'unique_ticket_par_etat');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_paiements');
    }
};
