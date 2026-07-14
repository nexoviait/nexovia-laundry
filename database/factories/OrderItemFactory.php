<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition(): array
    {
        $qty = fake()->numberBetween(1, 5);
        $unitPrice = fake()->randomFloat(2, 1.5, 8);

        return [
            'order_id' => Order::factory(),
            'service_id' => Service::factory(),
            'qty' => $qty,
            'unit_price' => $unitPrice,
            'line_total' => round($qty * $unitPrice, 2),
        ];
    }
}
