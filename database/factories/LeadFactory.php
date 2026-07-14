<?php

namespace Database\Factories;

use App\Models\Lead;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Lead>
 */
class LeadFactory extends Factory
{
    protected $model = Lead::class;

    public function definition(): array
    {
        return [
            'user_id' => null,
            'phone' => fake()->unique()->numerify('+447#########'),
            'postcode' => fake()->postcode(),
            'note' => fake()->optional()->sentence(),
        ];
    }
}
