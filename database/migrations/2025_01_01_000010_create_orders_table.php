<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('address_id')->constrained()->cascadeOnDelete();
            $table->foreignId('time_slot_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('business_account_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('property_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('promo_code_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('pending'); // pending, confirmed, picked_up, processing, on_hold, ready, out_for_delivery, delivered, cancelled
            $table->decimal('subtotal', 8, 2)->default(0);
            $table->decimal('discount', 8, 2)->default(0);
            $table->decimal('delivery_fee', 8, 2)->default(0);
            $table->decimal('vat', 8, 2)->default(0);
            $table->decimal('total', 8, 2)->default(0);
            $table->decimal('final_weight', 8, 2)->nullable(); // FR-OPS-005: recorded at shop-floor weight confirmation
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
