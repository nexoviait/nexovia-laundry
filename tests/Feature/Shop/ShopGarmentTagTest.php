<?php

namespace Tests\Feature\Shop;

use App\Models\GarmentTag;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Services\Push\PushGateway;
use App\Services\Sms\SmsGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Doubles\FakePushGateway;
use Tests\Doubles\FakeSmsGateway;
use Tests\TestCase;

/**
 * FR-OPS-003: one-click stage updates.
 * FR-OPS-004: issue flagging with photos, puts the order ON_HOLD.
 */
class ShopGarmentTagTest extends TestCase
{
    use RefreshDatabase;

    private User $shop;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->instance(SmsGateway::class, new FakeSmsGateway);
        $this->app->instance(PushGateway::class, new FakePushGateway);

        $this->shop = User::factory()->shop()->create();
    }

    private function tagOnProcessingOrder(string $stage = 'received'): GarmentTag
    {
        $order = Order::factory()->create(['status' => 'processing']);
        $item = OrderItem::factory()->create(['order_id' => $order->id]);

        return GarmentTag::factory()->create(['order_item_id' => $item->id, 'stage' => $stage]);
    }

    public function test_stage_can_be_advanced_one_click(): void
    {
        $tag = $this->tagOnProcessingOrder('received');

        $this->actingAs($this->shop)->post("/shop/garment-tags/{$tag->id}/stage", ['stage' => 'washing'])
            ->assertRedirect();

        $this->assertDatabaseHas('garment_tags', ['id' => $tag->id, 'stage' => 'washing']);
    }

    public function test_stage_can_be_skipped_forward(): void
    {
        $tag = $this->tagOnProcessingOrder('received');

        $this->actingAs($this->shop)->post("/shop/garment-tags/{$tag->id}/stage", ['stage' => 'quality_check'])
            ->assertRedirect();

        $this->assertDatabaseHas('garment_tags', ['id' => $tag->id, 'stage' => 'quality_check']);
    }

    public function test_stage_cannot_move_backward(): void
    {
        $tag = $this->tagOnProcessingOrder('ironing');

        $this->actingAs($this->shop)->post("/shop/garment-tags/{$tag->id}/stage", ['stage' => 'washing'])
            ->assertSessionHas('error');

        $this->assertDatabaseHas('garment_tags', ['id' => $tag->id, 'stage' => 'ironing']);
    }

    public function test_stage_update_is_rejected_when_the_order_is_not_on_the_floor(): void
    {
        $order = Order::factory()->create(['status' => 'picked_up']);
        $item = OrderItem::factory()->create(['order_id' => $order->id]);
        $tag = GarmentTag::factory()->create(['order_item_id' => $item->id, 'stage' => 'received']);

        $this->actingAs($this->shop)->post("/shop/garment-tags/{$tag->id}/stage", ['stage' => 'washing'])
            ->assertSessionHas('error');

        $this->assertDatabaseHas('garment_tags', ['id' => $tag->id, 'stage' => 'received']);
    }

    public function test_flagging_an_issue_with_a_photo_puts_the_order_on_hold(): void
    {
        Storage::fake('public');
        $tag = $this->tagOnProcessingOrder('washing');
        $order = $tag->orderItem->order;

        $response = $this->actingAs($this->shop)->post("/shop/garment-tags/{$tag->id}/issue", [
            'note' => 'Stain found on collar',
            'photos' => [UploadedFile::fake()->image('stain.jpg')],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('garment_tags', ['id' => $tag->id, 'issue_flag' => true, 'issue_note' => 'Stain found on collar']);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'on_hold']);

        $tag->refresh();
        $this->assertCount(1, $tag->issue_photos);
        Storage::disk('public')->assertExists($tag->issue_photos[0]);
    }

    public function test_resolving_the_only_flagged_tag_resumes_the_order_to_processing(): void
    {
        $order = Order::factory()->create(['status' => 'on_hold']);
        $item = OrderItem::factory()->create(['order_id' => $order->id]);
        $tag = GarmentTag::factory()->create(['order_item_id' => $item->id, 'issue_flag' => true, 'issue_note' => 'Damaged']);

        $this->actingAs($this->shop)->post("/shop/garment-tags/{$tag->id}/resolve")->assertRedirect();

        $this->assertDatabaseHas('garment_tags', ['id' => $tag->id, 'issue_flag' => false]);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'processing']);
    }

    public function test_resolving_one_of_several_flagged_tags_keeps_the_order_on_hold(): void
    {
        $order = Order::factory()->create(['status' => 'on_hold']);
        $item = OrderItem::factory()->create(['order_id' => $order->id]);
        $tagA = GarmentTag::factory()->create(['order_item_id' => $item->id, 'issue_flag' => true]);
        $tagB = GarmentTag::factory()->create(['order_item_id' => $item->id, 'issue_flag' => true]);

        $this->actingAs($this->shop)->post("/shop/garment-tags/{$tagA->id}/resolve")->assertRedirect();

        $this->assertDatabaseHas('garment_tags', ['id' => $tagA->id, 'issue_flag' => false]);
        $this->assertDatabaseHas('garment_tags', ['id' => $tagB->id, 'issue_flag' => true]);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'on_hold']);
    }

    public function test_resolve_is_rejected_when_the_order_is_not_on_hold(): void
    {
        $tag = $this->tagOnProcessingOrder('washing');

        $this->actingAs($this->shop)->post("/shop/garment-tags/{$tag->id}/resolve")
            ->assertSessionHas('error');
    }
}
