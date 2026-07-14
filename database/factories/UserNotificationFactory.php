<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserNotification>
 */
class UserNotificationFactory extends Factory
{
    protected $model = UserNotification::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->customer(),
            'title' => fake()->sentence(3),
            'body' => fake()->sentence(),
            'type' => 'order_update',
            'read_at' => null,
        ];
    }
}
