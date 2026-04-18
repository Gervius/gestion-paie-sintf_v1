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
        Schema::create('etat_paiements', function (Blueprint $table) {
            $table->id();
            $table->string('reference_etat')->unique();
            $table->foreignId('section_id')->constrained('sections')->restrictOnDelete();
            $table->date('date_etat');
            $table->string('statut')->default('PROVISOIRE');
            $table->decimal('montant_total_brut', 12, 2)->default(0);
            $table->decimal('montant_total_net', 12, 2)->default(0);
            $table->foreignId('valide_par_id')->nullable()->constrained('users');
            $table->timestamp('date_validation')->nullable();
            $table->timestamps();

            $table->index(['section_id', 'date_etat']);
            $table->index('statut');
            $table->index(['date_etat', 'statut']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('etat_paiements');
    }
};
