<?php

namespace Database\Factories;

use App\Models\Address;
use App\Models\BusinessAccount;
use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Property>
 */
class PropertyFactory extends Factory
{
    protected $model = Property::class;

    public function definition(): array
    {
        return [
            'business_account_id' => BusinessAccount::factory(),
            'address_id' => Address::factory(),
            'name' => fake()->streetAddress(),
        ];
    }
}
