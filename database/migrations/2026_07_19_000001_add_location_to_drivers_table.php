<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->decimal('current_lat', 10, 7)->nullable()->after('active');
            $table->decimal('current_lng', 10, 7)->nullable()->after('current_lat');
            $table->timestamp('last_location_updated_at')->nullable()->after('current_lng');
        });
    }

    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn(['current_lat', 'current_lng', 'last_location_updated_at']);
        });
    }
};
