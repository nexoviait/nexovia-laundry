<?php

namespace Database\Factories;

use App\Models\Banner;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Banner>
 */
class BannerFactory extends Factory
{
    protected $model = Banner::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'image_path' => 'banners/'.fake()->uuid().'.jpg',
            'link' => fake()->optional()->url(),
            'active' => true,
            'sort_order' => fake()->numberBetween(0, 10),
        ];
    }
}
