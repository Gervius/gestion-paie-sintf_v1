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
        Schema::create('pointages', function (Blueprint $table) {
            $table->id();
            $table->date('date_pointage');
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('section_id')->constrained('sections')->restrictOnDelete();
            $table->decimal('taux_applique', 10, 2);
            $table->string('statut')->default('BROUILLON');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['date_pointage', 'site_id', 'section_id'], 'unique_feuille_pointage');
            $table->index('statut');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pointages');
    }
};
