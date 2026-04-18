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
        Schema::create('unites_mesures', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();   // ex: KG, L, U, M
            $table->string('libelle');          // ex: Kilogramme, Litre, Unité, Mètre
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unites_mesures');
    }
};
