<?php

namespace Database\Factories;

use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    protected $model = Service::class;

    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['Shirt', 'Trousers', 'Bedsheet', 'Jacket', 'Dress', 'Duvet']),
            'unit' => 'item',
            'price' => fake()->randomFloat(2, 1.5, 8),
            'tat' => '24h',
            'active' => true,
        ];
    }
}
