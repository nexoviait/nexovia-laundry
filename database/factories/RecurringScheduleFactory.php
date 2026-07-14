<?php

namespace Database\Factories;

use App\Models\BusinessAccount;
use App\Models\Property;
use App\Models\RecurringSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RecurringSchedule>
 */
class RecurringScheduleFactory extends Factory
{
    protected $model = RecurringSchedule::class;

    public function definition(): array
    {
        return [
            'business_account_id' => BusinessAccount::factory(),
            'property_id' => Property::factory(),
            'frequency' => fake()->randomElement(['daily', 'weekly']),
            'day_of_week' => fake()->numberBetween(0, 6),
            'time_window' => '09:00-12:00',
            'active' => true,
            'next_run_date' => now()->addDays(7)->format('Y-m-d'),
        ];
    }
}
