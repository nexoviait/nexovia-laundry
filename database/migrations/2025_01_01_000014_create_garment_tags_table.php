<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('garment_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_item_id')->constrained()->cascadeOnDelete();
            $table->string('qr_code')->unique();
            $table->string('stage')->default('received'); // received, washing, drying, ironing, quality_check, ready
            $table->boolean('issue_flag')->default(false);
            $table->text('issue_note')->nullable();
            $table->json('issue_photos')->nullable(); // FR-OPS-004
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('garment_tags');
    }
};
