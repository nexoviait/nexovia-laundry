<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\StatusHistory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StatusHistory>
 */
class StatusHistoryFactory extends Factory
{
    protected $model = StatusHistory::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'status' => 'pending',
            'note' => fake()->optional()->sentence(),
            'changed_by' => User::factory()->admin(),
        ];
    }
}
