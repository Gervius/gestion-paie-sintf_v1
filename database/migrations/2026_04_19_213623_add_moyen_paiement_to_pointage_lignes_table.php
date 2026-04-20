<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pointage_lignes', function (Blueprint $table) {
            $table->string('moyen_paiement')->nullable()->after('type_ligne');
        });
    }

    public function down(): void
    {
        Schema::table('pointage_lignes', function (Blueprint $table) {
            $table->dropColumn('moyen_paiement');
        });
    }
};