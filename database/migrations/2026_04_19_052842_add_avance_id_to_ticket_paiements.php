<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('ticket_paiements', function (Blueprint $table) {
            $table->foreignId('avance_id')->nullable()->constrained('avances')->nullOnDelete();
        });
    }
    public function down(): void {
        Schema::table('ticket_paiements', function (Blueprint $table) {
            $table->dropForeign(['avance_id']);
            $table->dropColumn('avance_id');
        });
    }
};