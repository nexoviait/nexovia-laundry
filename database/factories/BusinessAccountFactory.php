<?php

namespace Database\Factories;

use App\Models\BusinessAccount;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BusinessAccount>
 */
class BusinessAccountFactory extends Factory
{
    protected $model = BusinessAccount::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->customer(),
            'company' => fake()->company(),
            'vat_no' => fake()->optional()->numerify('GB#########'),
            'contract_notes' => fake()->optional()->sentence(),
            'priority_turnaround' => fake()->boolean(30),
        ];
    }
}
