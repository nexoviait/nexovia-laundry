<?php

namespace Database\Factories;

use App\Models\ServiceArea;
use App\Models\TimeSlot;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TimeSlot>
 */
class TimeSlotFactory extends Factory
{
    protected $model = TimeSlot::class;

    public function definition(): array
    {
        return [
            'service_area_id' => ServiceArea::factory(),
            'date' => fake()->dateTimeBetween('now', '+7 days')->format('Y-m-d'),
            'window' => fake()->randomElement(['09:00-12:00', '12:00-15:00', '15:00-18:00']),
            'capacity' => fake()->numberBetween(5, 15),
        ];
    }
}
