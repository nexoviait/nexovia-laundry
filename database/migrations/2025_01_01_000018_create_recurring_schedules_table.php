<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recurring_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('property_id')->nullable()->constrained()->nullOnDelete();
            $table->string('frequency'); // daily, weekly, custom
            $table->unsignedTinyInteger('day_of_week')->nullable(); // 0-6 for weekly
            $table->string('time_window')->nullable();
            $table->boolean('active')->default(true);
            $table->date('next_run_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recurring_schedules');
    }
};
