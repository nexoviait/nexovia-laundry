<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('driver_tasks', function (Blueprint $table) {
            if (! Schema::hasColumn('driver_tasks', 'item_count')) {
                $table->unsignedInteger('item_count')->nullable()->after('gps_lng');
            }
            if (! Schema::hasColumn('driver_tasks', 'weight')) {
                $table->decimal('weight', 8, 2)->nullable()->after('item_count');
            }
            if (! Schema::hasColumn('driver_tasks', 'payment_method')) {
                $table->string('payment_method')->nullable()->after('weight');
            }
            if (! Schema::hasColumn('driver_tasks', 'cod_amount')) {
                $table->decimal('cod_amount', 8, 2)->nullable()->after('payment_method');
            }
            if (! Schema::hasColumn('driver_tasks', 'failure_reason')) {
                $table->text('failure_reason')->nullable()->after('cod_amount');
            }
        });
    }

    public function down(): void
    {
        Schema::table('driver_tasks', function (Blueprint $table) {
            $table->dropColumn(['item_count', 'weight', 'payment_method', 'cod_amount', 'failure_reason']);
        });
    }
};
