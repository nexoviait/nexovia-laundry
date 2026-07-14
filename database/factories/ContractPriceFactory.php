<?php

namespace Database\Factories;

use App\Models\BusinessAccount;
use App\Models\ContractPrice;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ContractPrice>
 */
class ContractPriceFactory extends Factory
{
    protected $model = ContractPrice::class;

    public function definition(): array
    {
        return [
            'business_account_id' => BusinessAccount::factory(),
            'service_id' => Service::factory(),
            'price' => fake()->randomFloat(2, 1, 6),
        ];
    }
}
