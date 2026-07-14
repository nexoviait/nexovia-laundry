<?php

namespace Database\Factories;

use App\Models\ServiceArea;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ServiceArea>
 */
class ServiceAreaFactory extends Factory
{
    protected $model = ServiceArea::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->citySuffix().' '.fake()->city(),
            'postcode' => fake()->unique()->postcode(),
            'active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => ['active' => false]);
    }
}
