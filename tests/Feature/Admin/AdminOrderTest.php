<?php

namespace Tests\Feature\Admin;

use App\Models\Address;
use App\Models\Driver;
use App\Models\Order;
use App\Models\Service;
use App\Models\ServiceArea;
use App\Models\Setting;
use App\Models\TimeSlot;
use App\Models\User;
use App\Services\Push\PushGateway;
use App\Services\Sms\SmsGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Doubles\FakePushGateway;
use Tests\Doubles\FakeSmsGateway;
use Tests\TestCase;

/**
 * FR-ADM-002/003/004/010/019/021/022: order board, manual entry, confirm,
 * assign driver, notes, cancellations/adjustments.
 */
class AdminOrderTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->instance(SmsGateway::class, new FakeSmsGateway);
        $this->app->instance(PushGateway::class, new FakePushGateway);

        $this->admin = User::factory()->admin()->create();
        Setting::create(['key' => 'vat_rate', 'value' => '20']);
        Setting::create(['key' => 'delivery_fee', 'value' => '2.50']);
    }

    public function test_order_board_lists_orders_and_pending_count(): void
    {
        Order::factory()->count(2)->create(['status' => 'pending']);
        Order::factory()->create(['status' => 'confirmed']);

        $this->actingAs($this->admin)->get('/admin/orders')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Orders/Board')
                ->where('pendingCount', 2)
                ->has('orders.data', 3)
            );
    }

    public function test_order_show_page_exposes_order_fields_unwrapped(): void
    {
        $order = Order::factory()->create(['status' => 'pending']);

        $this->actingAs($this->admin)->get("/admin/orders/{$order->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Orders/Show')
                ->where('order.id', $order->id)
                ->where('order.status', 'pending')
            );
    }

    public function test_order_board_can_be_filtered_by_status(): void
    {
        Order::factory()->create(['status' => 'pending']);
        Order::factory()->create(['status' => 'delivered']);

        $this->actingAs($this->admin)->get('/admin/orders?status=delivered')
            ->assertInertia(fn (Assert $page) => $page->has('orders.data', 1));
    }

    public function test_order_board_can_be_filtered_by_service_area(): void
    {
        $areaA = ServiceArea::factory()->create();
        $areaB = ServiceArea::factory()->create();
        $addressA = Address::factory()->create(['service_area_id' => $areaA->id]);
        $addressB = Address::factory()->create(['service_area_id' => $areaB->id]);
        Order::factory()->create(['address_id' => $addressA->id]);
        Order::factory()->create(['address_id' => $addressB->id]);

        $this->actingAs($this->admin)->get("/admin/orders?service_area_id={$areaA->id}")
            ->assertInertia(fn (Assert $page) => $page->has('orders.data', 1));
    }

    public function test_admin_can_confirm_a_pending_order(): void
    {
        $order = Order::factory()->create(['status' => 'pending']);

        $this->actingAs($this->admin)->post("/admin/orders/{$order->id}/confirm")->assertRedirect();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'confirmed']);
        $this->assertDatabaseHas('status_histories', [
            'order_id' => $order->id, 'status' => 'confirmed', 'changed_by' => $this->admin->id,
        ]);
    }

    public function test_admin_can_assign_a_driver_to_a_confirmed_order(): void
    {
        $order = Order::factory()->create(['status' => 'confirmed']);
        $driver = Driver::factory()->create(['active' => true]);

        $this->actingAs($this->admin)
            ->post("/admin/orders/{$order->id}/assign-driver", ['driver_id' => $driver->id])
            ->assertRedirect();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'assigned']);
        $this->assertDatabaseHas('driver_tasks', [
            'order_id' => $order->id, 'driver_id' => $driver->id, 'type' => 'pickup',
        ]);
    }

    public function test_admin_can_change_the_pickup_time_slot(): void
    {
        $area = ServiceArea::factory()->create();
        $address = Address::factory()->create(['service_area_id' => $area->id]);
        $oldSlot = TimeSlot::factory()->create(['service_area_id' => $area->id]);
        $newSlot = TimeSlot::factory()->create(['service_area_id' => $area->id, 'capacity' => 5]);
        $order = Order::factory()->create(['address_id' => $address->id, 'time_slot_id' => $oldSlot->id, 'status' => 'confirmed']);

        $this->actingAs($this->admin)
            ->post("/admin/orders/{$order->id}/time-slot", ['time_slot_id' => $newSlot->id])
            ->assertRedirect();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'time_slot_id' => $newSlot->id]);
    }

    public function test_time_slot_change_is_rejected_when_the_new_slot_is_full(): void
    {
        $slot = TimeSlot::factory()->create(['capacity' => 1]);
        Order::factory()->create(['time_slot_id' => $slot->id, 'status' => 'confirmed']);
        $order = Order::factory()->create(['status' => 'confirmed']);

        $this->actingAs($this->admin)
            ->post("/admin/orders/{$order->id}/time-slot", ['time_slot_id' => $slot->id])
            ->assertSessionHasErrors('time_slot_id');
    }

    public function test_admin_can_add_an_internal_note_and_a_customer_visible_note(): void
    {
        $order = Order::factory()->create();

        $this->actingAs($this->admin)->post("/admin/orders/{$order->id}/notes", [
            'note' => 'Internal only',
            'visible_to_customer' => false,
        ])->assertRedirect();

        $this->actingAs($this->admin)->post("/admin/orders/{$order->id}/notes", [
            'note' => 'Your order is on its way',
            'visible_to_customer' => true,
        ])->assertRedirect();

        $this->assertDatabaseHas('order_notes', ['order_id' => $order->id, 'note' => 'Internal only', 'visible_to_customer' => false]);
        $this->assertDatabaseHas('order_notes', ['order_id' => $order->id, 'note' => 'Your order is on its way', 'visible_to_customer' => true]);
    }

    public function test_admin_can_cancel_an_order_with_a_reason(): void
    {
        $order = Order::factory()->create(['status' => 'pending']);

        $this->actingAs($this->admin)
            ->post("/admin/orders/{$order->id}/cancel", ['reason' => 'Customer changed their mind'])
            ->assertRedirect();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'cancelled']);
        $this->assertDatabaseHas('status_histories', [
            'order_id' => $order->id, 'status' => 'cancelled', 'note' => 'Customer changed their mind',
        ]);
    }

    public function test_admin_can_override_cancel_an_order_already_processing(): void
    {
        $order = Order::factory()->create(['status' => 'processing']);

        $this->actingAs($this->admin)
            ->post("/admin/orders/{$order->id}/cancel", ['reason' => 'Damaged, refunding'])
            ->assertRedirect();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'cancelled']);
    }

    public function test_cancellation_requires_a_reason(): void
    {
        $order = Order::factory()->create(['status' => 'pending']);

        $this->actingAs($this->admin)->post("/admin/orders/{$order->id}/cancel", [])
            ->assertSessionHasErrors('reason');
    }

    public function test_admin_can_adjust_the_order_discount_with_a_reason(): void
    {
        $order = Order::factory()->create(['subtotal' => 20, 'delivery_fee' => 2.5, 'vat' => 4, 'discount' => 0, 'total' => 26.5]);

        $this->actingAs($this->admin)->post("/admin/orders/{$order->id}/adjust", [
            'discount' => 5,
            'reason' => 'Goodwill gesture',
        ])->assertRedirect();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'discount' => 5, 'total' => 21.5]);
        $this->assertDatabaseHas('order_notes', ['order_id' => $order->id]);
    }

    public function test_admin_can_create_a_manual_order_for_a_new_customer(): void
    {
        $area = ServiceArea::factory()->create(['postcode' => 'B19', 'active' => true]);
        $slot = TimeSlot::factory()->create(['service_area_id' => $area->id, 'capacity' => 5]);
        $service = Service::factory()->create(['price' => 3, 'active' => true]);

        $response = $this->actingAs($this->admin)->post('/admin/orders', [
            'phone' => '+447700900123',
            'name' => 'Walk-in Customer',
            'label' => 'Home',
            'postcode' => 'B19 3AB',
            'time_slot_id' => $slot->id,
            'items' => [['service_id' => $service->id, 'qty' => 2]],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['phone' => '+447700900123', 'role' => 'customer']);
        $this->assertDatabaseHas('orders', ['status' => 'pending']);
    }

    public function test_admin_can_manually_transition_order_status(): void
    {
        $order = Order::factory()->create(['status' => 'pending']);

        $this->actingAs($this->admin)->post("/admin/orders/{$order->id}/transition", [
            'status' => 'confirmed',
            'note' => 'Manually confirmed by Admin staff member',
        ])->assertRedirect();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'confirmed']);
        $this->assertDatabaseHas('status_histories', [
            'order_id' => $order->id,
            'status' => 'confirmed',
            'note' => 'Manually confirmed by Admin staff member',
            'changed_by' => $this->admin->id,
        ]);
    }
}
