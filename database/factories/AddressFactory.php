<?php

namespace Database\Factories;

use App\Models\Address;
use App\Models\ServiceArea;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Address>
 */
class AddressFactory extends Factory
{
    protected $model = Address::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->customer(),
            'service_area_id' => ServiceArea::factory(),
            'label' => fake()->randomElement(['Home', 'Work', 'Other']),
            'postcode' => fake()->postcode(),
            'map_lat' => fake()->latitude(52.4, 52.5),
            'map_lng' => fake()->longitude(-1.95, -1.85),
            'directions' => fake()->optional()->sentence(),
        ];
    }
}
