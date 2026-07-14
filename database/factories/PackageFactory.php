<?php

namespace Database\Factories;

use App\Models\Package;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Package>
 */
class PackageFactory extends Factory
{
    protected $model = Package::class;

    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['Starter Pack', 'Family Pack', 'Business Pack']),
            'description' => fake()->sentence(),
            'price' => fake()->randomFloat(2, 20, 100),
            'credits' => fake()->numberBetween(10, 50),
            'validity_days' => 90,
            'active' => true,
        ];
    }
}
