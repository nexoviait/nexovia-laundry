<?php

namespace Database\Factories;

use App\Models\Address;
use App\Models\Order;
use App\Models\TimeSlot;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 10, 80);
        $vat = round($subtotal * 0.2, 2);
        $deliveryFee = 2.5;

        return [
            'user_id' => User::factory()->customer(),
            'address_id' => Address::factory(),
            'time_slot_id' => TimeSlot::factory(),
            'status' => 'pending',
            'subtotal' => $subtotal,
            'discount' => 0,
            'delivery_fee' => $deliveryFee,
            'vat' => $vat,
            'total' => $subtotal + $deliveryFee + $vat,
            'note' => fake()->optional()->sentence(),
        ];
    }

    public function withStatus(string $status): static
    {
        return $this->state(fn (array $attributes) => ['status' => $status]);
    }
}
