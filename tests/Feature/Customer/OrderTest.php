<?php

namespace Tests\Feature\Customer;

use App\Enums\OrderStatus;
use App\Models\Address;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Service;
use App\Models\ServiceArea;
use App\Models\Setting;
use App\Models\TimeSlot;
use App\Models\User;
use App\Services\Notifications\OrderStatusNotifier;
use App\Services\Order\OrderStatusMachine;
use App\Services\Push\PushGateway;
use App\Services\Sms\SmsGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Doubles\FakePushGateway;
use Tests\Doubles\FakeSmsGateway;
use Tests\TestCase;

/**
 * REQ-CUST-01/06 (booking + note), REQ-CUST-08 (estimated price),
 * REQ-CUST-09 (cancel before pickup), REQ-CUST-10/12 (order list/detail
 * with status timeline), REQ-CUST-14 (invoice retrieval).
 */
class OrderTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;

    private ServiceArea $area;

    private Address $address;

    private TimeSlot $slot;

    private Service $shirt;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->instance(SmsGateway::class, new FakeSmsGateway);
        $this->app->instance(PushGateway::class, new FakePushGateway);

        Setting::create(['key' => 'vat_rate', 'value' => '20']);
        Setting::create(['key' => 'delivery_fee', 'value' => '2.50']);

        $this->customer = User::factory()->customer()->create();
        $this->area = ServiceArea::factory()->create(['postcode' => 'B19', 'active' => true]);
        $this->address = Address::factory()->create([
            'user_id' => $this->customer->id,
            'service_area_id' => $this->area->id,
            'postcode' => 'B19 3AB',
        ]);
        $this->slot = TimeSlot::factory()->create(['service_area_id' => $this->area->id, 'capacity' => 1]);
        $this->shirt = Service::factory()->create(['name' => 'Shirt', 'price' => 2.50, 'active' => true]);
    }

    private function actingAsCustomer(): static
    {
        return $this->actingAs($this->customer, 'sanctum');
    }

    public function test_pricing_estimate_matches_what_order_creation_charges(): void
    {
        $payload = ['items' => [['service_id' => $this->shirt->id, 'qty' => 4]]];

        $estimate = $this->actingAsCustomer()->postJson('/api/v1/pricing/estimate', $payload)->assertOk();

        // subtotal 4 * 2.50 = 10.00; delivery 2.50; vat 20% of 10 = 2.00; total 14.50
        $estimate->assertJson([
            'subtotal' => 10.0,
            'delivery_fee' => 2.5,
            'vat' => 2.0,
            'total' => 14.5,
        ]);

        $order = $this->actingAsCustomer()->postJson('/api/v1/orders', [
            'address_id' => $this->address->id,
            'time_slot_id' => $this->slot->id,
            'note' => 'Leave with neighbour',
            'items' => [['service_id' => $this->shirt->id, 'qty' => 4]],
        ])->assertCreated();

        $order->assertJsonPath('data.subtotal', '10.00')
            ->assertJsonPath('data.total', '14.50')
            ->assertJsonPath('data.note', 'Leave with neighbour');
    }

    public function test_order_creation_logs_initial_status_history_and_sends_notifications(): void
    {
        $this->actingAsCustomer()->postJson('/api/v1/orders', [
            'address_id' => $this->address->id,
            'time_slot_id' => $this->slot->id,
            'items' => [['service_id' => $this->shirt->id, 'qty' => 1]],
        ])->assertCreated();

        $order = Order::first();

        $this->assertDatabaseHas('status_histories', [
            'order_id' => $order->id,
            'status' => 'pending',
            'changed_by' => $this->customer->id,
        ]);

        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $this->customer->id,
            'body' => 'Order received, awaiting confirmation',
        ]);
    }

    public function test_order_creation_is_blocked_once_the_addresss_area_is_deactivated(): void
    {
        $this->area->update(['active' => false]);

        $response = $this->actingAsCustomer()->postJson('/api/v1/orders', [
            'address_id' => $this->address->id,
            'time_slot_id' => $this->slot->id,
            'items' => [['service_id' => $this->shirt->id, 'qty' => 1]],
        ]);

        $response->assertStatus(422)->assertJsonPath('blocked', true);
        $this->assertSame(0, Order::count());
        $this->assertDatabaseHas('leads', ['postcode' => 'B19 3AB']);
    }

    public function test_order_creation_is_blocked_when_the_time_slot_is_full(): void
    {
        Order::factory()->create(['time_slot_id' => $this->slot->id, 'status' => 'confirmed']);

        $response = $this->actingAsCustomer()->postJson('/api/v1/orders', [
            'address_id' => $this->address->id,
            'time_slot_id' => $this->slot->id,
            'items' => [['service_id' => $this->shirt->id, 'qty' => 1]],
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('time_slot_id');
    }

    public function test_customer_cannot_book_using_another_customers_address(): void
    {
        $otherAddress = Address::factory()->create();

        $response = $this->actingAsCustomer()->postJson('/api/v1/orders', [
            'address_id' => $otherAddress->id,
            'time_slot_id' => $this->slot->id,
            'items' => [['service_id' => $this->shirt->id, 'qty' => 1]],
        ]);

        $response->assertNotFound();
    }

    public function test_order_list_only_shows_the_authenticated_customers_orders(): void
    {
        Order::factory()->count(2)->create(['user_id' => $this->customer->id]);
        Order::factory()->create(); // another customer's order

        $response = $this->actingAsCustomer()->getJson('/api/v1/orders');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    public function test_order_detail_includes_the_status_timeline_oldest_first(): void
    {
        $created = $this->actingAsCustomer()->postJson('/api/v1/orders', [
            'address_id' => $this->address->id,
            'time_slot_id' => $this->slot->id,
            'items' => [['service_id' => $this->shirt->id, 'qty' => 1]],
        ])->assertCreated();

        $order = Order::findOrFail($created->json('data.id'));
        $admin = User::factory()->admin()->create();
        $machine = new OrderStatusMachine(new OrderStatusNotifier(new FakeSmsGateway, new FakePushGateway));

        $machine->transition($order, OrderStatus::Confirmed, $admin, 'Looks good');
        $machine->transition($order, OrderStatus::Assigned, $admin);

        $response = $this->actingAsCustomer()->getJson("/api/v1/orders/{$order->id}");

        $response->assertOk();
        $timeline = collect($response->json('data.status_histories'))->pluck('status');
        $this->assertSame(['pending', 'confirmed', 'assigned'], $timeline->all());
    }

    public function test_customer_cannot_view_another_customers_order(): void
    {
        $other = Order::factory()->create();

        $this->actingAsCustomer()->getJson("/api/v1/orders/{$other->id}")->assertNotFound();
    }

    public function test_order_can_be_cancelled_before_pickup(): void
    {
        $order = Order::factory()->create(['user_id' => $this->customer->id, 'status' => 'confirmed']);

        $response = $this->actingAsCustomer()->postJson("/api/v1/orders/{$order->id}/cancel", [
            'reason' => 'Change of plans',
        ]);

        $response->assertOk()->assertJsonPath('data.status', 'cancelled');
        $this->assertDatabaseHas('status_histories', [
            'order_id' => $order->id,
            'status' => 'cancelled',
            'note' => 'Change of plans',
            'changed_by' => $this->customer->id,
        ]);
    }

    public function test_order_cannot_be_cancelled_once_picked_up(): void
    {
        $order = Order::factory()->create(['user_id' => $this->customer->id, 'status' => 'picked_up']);

        $response = $this->actingAsCustomer()->postJson("/api/v1/orders/{$order->id}/cancel");

        $response->assertStatus(422);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'picked_up']);
    }

    public function test_invoice_is_retrievable_once_generated(): void
    {
        $order = Order::factory()->create(['user_id' => $this->customer->id, 'status' => 'ready']);
        Invoice::factory()->create(['order_id' => $order->id, 'total' => 14.50]);

        $response = $this->actingAsCustomer()->getJson("/api/v1/orders/{$order->id}/invoice");

        $response->assertOk()->assertJsonPath('data.order_id', $order->id);
    }

    public function test_invoice_retrieval_returns_404_before_it_has_been_generated(): void
    {
        $order = Order::factory()->create(['user_id' => $this->customer->id, 'status' => 'pending']);

        $this->actingAsCustomer()->getJson("/api/v1/orders/{$order->id}/invoice")->assertNotFound();
    }

    public function test_customer_cannot_retrieve_another_customers_invoice(): void
    {
        $other = Order::factory()->create();
        Invoice::factory()->create(['order_id' => $other->id]);

        $this->actingAsCustomer()->getJson("/api/v1/orders/{$other->id}/invoice")->assertNotFound();
    }
}
