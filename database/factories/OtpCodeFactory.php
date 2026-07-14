<?php

namespace Database\Factories;

use App\Models\OtpCode;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<OtpCode>
 */
class OtpCodeFactory extends Factory
{
    protected $model = OtpCode::class;

    public function definition(): array
    {
        return [
            'phone' => fake()->unique()->numerify('+447#########'),
            'code' => Hash::make('123456'),
            'attempts' => 0,
            'expires_at' => now()->addMinutes(5),
            'consumed_at' => null,
        ];
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => ['expires_at' => now()->subMinute()]);
    }

    public function consumed(): static
    {
        return $this->state(fn (array $attributes) => ['consumed_at' => now()]);
    }
}
