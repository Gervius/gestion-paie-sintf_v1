<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('personnels', function (Blueprint $table) {
            // Logique CNIB
            $table->boolean('sans_cnib')->default(false)->after('num_cnib');
            
            // Logique Téléphone
            $table->boolean('a_telephone_propre')->default(true)->after('telephone');
            $table->string('telephone_sc')->nullable()->after('a_telephone_propre');
            $table->string('lien_telephone_sc')->nullable()->after('telephone_sc');
        });
    }

    public function down()
    {
        Schema::table('personnels', function (Blueprint $table) {
            $table->dropColumn([
                'sans_cnib', 
                'a_telephone_propre', 
                'telephone_sc', 
                'lien_telephone_sc'
            ]);
        });
    }
};