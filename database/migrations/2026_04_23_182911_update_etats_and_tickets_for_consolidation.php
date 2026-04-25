<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Mise à jour de l'État de Paiement (En-tête)
        Schema::table('etat_paiements', function (Blueprint $table) {
            $table->dropColumn('date_etat'); // On supprime l'ancienne date unique
            $table->date('date_debut')->after('section_id')->nullable();
            $table->date('date_fin')->after('date_debut')->nullable();
            $table->string('type_pointage')->default('RENDEMENT')->after('date_fin');
        });

        // 2. Mise à jour du Ticket de Paiement (Détail Agent)
        Schema::table('ticket_paiements', function (Blueprint $table) {
            $table->decimal('quantite_totale', 10, 2)->default(0)->after('date_generation');
        });
    }

    public function down(): void
    {
        Schema::table('ticket_paiements', function (Blueprint $table) {
            $table->dropColumn('quantite_totale');
        });

        Schema::table('etat_paiements', function (Blueprint $table) {
            $table->dropColumn(['date_debut', 'date_fin', 'type_pointage']);
            $table->date('date_etat')->nullable();
        });
    }
};