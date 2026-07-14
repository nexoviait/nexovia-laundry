<?php

namespace Database\Factories;

use App\Models\PromoCode;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PromoCode>
 */
class PromoCodeFactory extends Factory
{
    protected $model = PromoCode::class;

    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->bothify('PROMO###')),
            'type' => fake()->randomElement(['percent', 'fixed']),
            'value' => fake()->randomFloat(2, 5, 20),
            'active' => true,
            'starts_at' => now(),
            'expires_at' => now()->addMonths(3),
            'usage_limit' => 100,
            'used_count' => 0,
        ];
    }
}
