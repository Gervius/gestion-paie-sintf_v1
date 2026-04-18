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
        Schema::create('avances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('personnel_id')->constrained('personnels')->restrictOnDelete();
            $table->foreignId('regularisation_source_id')->nullable()->constrained('pointage_lignes')->nullOnDelete();
            $table->decimal('montant_initial', 10, 2);
            $table->decimal('solde_restant', 10, 2);
            $table->date('date_avance');
            $table->string('motif');
            $table->string('statut')->default('ACTIVE');
            $table->timestamps();
            $table->softDeletes();

            $table->index('statut');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('avances');
    }
};
