<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('personnels', function (Blueprint $table) {
            // On rend la colonne téléphone nullable
            $table->string('telephone', 20)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('personnels', function (Blueprint $table) {
            // En cas de rollback, on remet la contrainte stricte
            $table->string('telephone', 20)->nullable(false)->change();
        });
    }
};