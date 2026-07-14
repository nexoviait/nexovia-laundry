<?php

namespace Database\Factories;

use App\Models\Driver;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Driver>
 */
class DriverFactory extends Factory
{
    protected $model = Driver::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->driver(),
            'vehicle_type' => fake()->randomElement(['van', 'car', 'motorbike']),
            'vehicle_number' => strtoupper(fake()->bothify('??## ???')),
            'active' => true,
        ];
    }
}
