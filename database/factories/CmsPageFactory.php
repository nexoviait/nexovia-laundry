<?php

namespace Database\Factories;

use App\Models\CmsPage;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<CmsPage>
 */
class CmsPageFactory extends Factory
{
    protected $model = CmsPage::class;

    public function definition(): array
    {
        $title = fake()->sentence(3);

        return [
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(1, 100000),
            'content' => fake()->paragraphs(3, true),
            'active' => true,
        ];
    }
}
