<?php

namespace Database\Factories;

use App\Models\Driver;
use App\Models\DriverTask;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DriverTask>
 */
class DriverTaskFactory extends Factory
{
    protected $model = DriverTask::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'driver_id' => Driver::factory(),
            'type' => fake()->randomElement(['pickup', 'delivery']),
            'status' => 'pending',
            'photos' => null,
            'otp' => (string) fake()->numberBetween(1000, 9999),
            'otp_verified_at' => null,
            'gps_lat' => null,
            'gps_lng' => null,
            'item_count' => null,
            'weight' => null,
            'payment_method' => null,
            'cod_amount' => null,
            'failure_reason' => null,
            'scheduled_at' => now()->addHours(fake()->numberBetween(1, 48)),
            'completed_at' => null,
        ];
    }
}
