<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'vat' => fake()->randomFloat(2, 1, 10),
            'total' => fake()->randomFloat(2, 10, 100),
            'method' => fake()->randomElement(['cash', 'card']),
            'status' => 'unpaid',
            'issued_at' => null,
        ];
    }
}
