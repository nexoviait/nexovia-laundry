<?php

namespace Database\Factories;

use App\Models\GarmentTag;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<GarmentTag>
 */
class GarmentTagFactory extends Factory
{
    protected $model = GarmentTag::class;

    public function definition(): array
    {
        return [
            'order_item_id' => OrderItem::factory(),
            'qr_code' => strtoupper(Str::random(10)),
            'stage' => 'received',
            'issue_flag' => false,
            'issue_note' => null,
        ];
    }
}
