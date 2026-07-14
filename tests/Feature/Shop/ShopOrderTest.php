<?php

namespace Tests\Feature\Shop;

use App\Models\GarmentTag;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Service;
use App\Models\Setting;
use App\Models\User;
use App\Services\Push\PushGateway;
use App\Services\Sms\SmsGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Doubles\FakePushGateway;
use Tests\Doubles\FakeSmsGateway;
use Tests\TestCase;

/**
 * FR-OPS-001: receive order with mismatch flagging.
 * FR-OPS-002: print a QR tag per order bag.
 * FR-OPS-005: final weight confirmation -> invoice -> ready.
 */
class ShopOrderTest extends TestCase
{
    use RefreshDatabase;

    private User $shop;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->instance(SmsGateway::class, new FakeSmsGateway);
        $this->app->instance(PushGateway::class, new FakePushGateway);

        $this->shop = User::factory()->shop()->create();
        Setting::create(['key' => 'vat_rate', 'value' => '20']);
        Setting::create(['key' => 'delivery_fee', 'value' => '2.50']);
    }

    public function test_receiving_an_order_with_matching_counts_creates_tags_without_flags(): void
    {
        $order = Order::factory()->create(['status' => 'picked_up']);
        $item = OrderItem::factory()->create(['order_id' => $order->id, 'qty' => 3]);

        $response = $this->actingAs($this->shop)->post("/shop/orders/{$order->id}/receive", [
            'counts' => [['order_item_id' => $item->id, 'actual_qty' => 3]],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'processing']);
        $this->assertDatabaseHas('garment_tags', ['order_item_id' => $item->id, 'issue_flag' => false, 'stage' => 'received']);
        $this->assertDatabaseMissing('order_notes', ['order_id' => $order->id]);
    }

    public function test_receiving_an_order_with_a_mismatch_flags_the_tag_and_logs_a_note(): void
    {
        $order = Order::factory()->create(['status' => 'picked_up']);
        $item = OrderItem::factory()->create(['order_id' => $order->id, 'qty' => 5]);

        $response = $this->actingAs($this->shop)->post("/shop/orders/{$order->id}/receive", [
            'counts' => [['order_item_id' => $item->id, 'actual_qty' => 3]],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'processing']);
        $this->assertDatabaseHas('garment_tags', ['order_item_id' => $item->id, 'issue_flag' => true]);
        $this->assertDatabaseHas('order_notes', ['order_id' => $order->id, 'visible_to_customer' => false]);
    }

    public function test_an_order_cannot_be_received_twice(): void
    {
        $order = Order::factory()->create(['status' => 'processing']);
        $item = OrderItem::factory()->create(['order_id' => $order->id, 'qty' => 1]);

        $this->actingAs($this->shop)->post("/shop/orders/{$order->id}/receive", [
            'counts' => [['order_item_id' => $item->id, 'actual_qty' => 1]],
        ])->assertSessionHas('error');

        $this->assertDatabaseCount('garment_tags', 0);
    }

    public function test_print_tags_page_lists_garment_tags_for_the_order(): void
    {
        $order = Order::factory()->create();
        $item = OrderItem::factory()->create(['order_id' => $order->id]);
        GarmentTag::factory()->create(['order_item_id' => $item->id]);

        $response = $this->actingAs($this->shop)->get("/shop/orders/{$order->id}/tags")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Shop/Orders/Tags'));

        $order = $response->viewData('page')['props']['order'];
        $this->assertCount(1, $order['items'][0]['garment_tags']);
    }

    public function test_finalize_generates_an_invoice_and_moves_the_order_to_ready(): void
    {
        $order = Order::factory()->create(['status' => 'processing', 'subtotal' => 10, 'discount' => 0, 'delivery_fee' => 2.5, 'vat' => 2]);
        $item = OrderItem::factory()->create(['order_id' => $order->id]);
        GarmentTag::factory()->create(['order_item_id' => $item->id, 'stage' => 'quality_check']);

        $response = $this->actingAs($this->shop)->post("/shop/orders/{$order->id}/finalize", [
            'final_weight' => 4.2,
        ]);

        $response->assertRedirect(route('shop.board'));
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'ready', 'final_weight' => '4.20']);
        $this->assertDatabaseHas('invoices', ['order_id' => $order->id, 'status' => 'unpaid']);
    }

    public function test_finalize_is_rejected_when_not_every_tag_has_reached_quality_check(): void
    {
        $order = Order::factory()->create(['status' => 'processing']);
        $item = OrderItem::factory()->create(['order_id' => $order->id]);
        GarmentTag::factory()->create(['order_item_id' => $item->id, 'stage' => 'ironing']);

        $response = $this->actingAs($this->shop)->post("/shop/orders/{$order->id}/finalize", []);

        $response->assertSessionHasErrors('final_weight');
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'processing']);
        $this->assertDatabaseMissing('invoices', ['order_id' => $order->id]);
    }

    public function test_finalize_recalculates_pricing_for_weight_based_items(): void
    {
        $order = Order::factory()->create(['status' => 'processing', 'discount' => 0, 'delivery_fee' => 2.5]);
        $service = Service::factory()->create(['unit' => 'kg', 'price' => 5]);
        $item = OrderItem::factory()->create([
            'order_id' => $order->id, 'service_id' => $service->id, 'qty' => 3, 'unit_price' => 5, 'line_total' => 15,
        ]);
        GarmentTag::factory()->create(['order_item_id' => $item->id, 'stage' => 'quality_check']);

        $this->actingAs($this->shop)->post("/shop/orders/{$order->id}/finalize", [
            'final_weight' => 4,
            'adjustments' => [['order_item_id' => $item->id, 'qty' => 4]],
        ])->assertRedirect();

        // subtotal 4 * 5 = 20; vat 20% = 4; total 20 - 0 + 2.5 + 4 = 26.5
        $this->assertDatabaseHas('order_items', ['id' => $item->id, 'qty' => 4, 'line_total' => 20]);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'subtotal' => 20, 'vat' => 4, 'total' => 26.5]);
    }
}
