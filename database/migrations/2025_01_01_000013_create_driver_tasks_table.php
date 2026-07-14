<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('driver_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['pickup', 'delivery']);
            $table->string('status')->default('pending'); // pending, en_route, completed, failed
            $table->json('photos')->nullable();
            $table->string('otp')->nullable();
            $table->timestamp('otp_verified_at')->nullable();
            $table->decimal('gps_lat', 10, 7)->nullable();
            $table->decimal('gps_lng', 10, 7)->nullable();
            $table->unsignedInteger('item_count')->nullable(); // FR-RID-004: recorded at pickup
            $table->decimal('weight', 8, 2)->nullable(); // FR-RID-004: recorded at pickup
            $table->string('payment_method')->nullable(); // FR-RID-006: cash-on-delivery recording
            $table->decimal('cod_amount', 8, 2)->nullable();
            $table->text('failure_reason')->nullable(); // FR-RID-008: failed pickup/delivery reporting
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('driver_tasks');
    }
};
