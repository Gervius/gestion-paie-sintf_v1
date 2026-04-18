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
        Schema::create('lots_paiements_waves', function (Blueprint $table) {
            $table->id();
            $table->string('reference_lot')->unique();
            $table->date('date_generation');
            $table->string('statut')->default('PREPARE');
            $table->foreignId('generated_by_id')->constrained('users')->restrictOnDelete();
            $table->timestamps();

            $table->index('statut');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lots_paiements_waves');
    }
};
