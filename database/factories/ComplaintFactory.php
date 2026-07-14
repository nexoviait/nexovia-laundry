<?php

namespace Database\Factories;

use App\Models\Complaint;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Complaint>
 */
class ComplaintFactory extends Factory
{
    protected $model = Complaint::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'user_id' => User::factory()->customer(),
            'subject' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'status' => 'open',
            'resolved_at' => null,
        ];
    }
}
