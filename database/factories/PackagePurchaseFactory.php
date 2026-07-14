<?php

namespace Database\Factories;

use App\Models\Package;
use App\Models\PackagePurchase;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PackagePurchase>
 */
class PackagePurchaseFactory extends Factory
{
    protected $model = PackagePurchase::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->customer(),
            'package_id' => Package::factory(),
            'balance' => fake()->randomFloat(2, 0, 50),
            'expiry_date' => fake()->dateTimeBetween('+30 days', '+90 days')->format('Y-m-d'),
        ];
    }
}
