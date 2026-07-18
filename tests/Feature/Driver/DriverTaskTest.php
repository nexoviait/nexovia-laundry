<?php

namespace Tests\Feature\Driver;

use App\Models\Address;
use App\Models\Driver;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\ServiceArea;
use App\Models\TimeSlot;
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
 * FR-RID-002 to 008: driver app task list, pickup, delivery (OTP + COD),
 * and failure reporting.
 */
class DriverTaskTest extends TestCase
{
    use RefreshDatabase;

    private User $driverUser;

    private Driver $driver;

    private FakeSmsGateway $sms;

    protected function setUp(): void
    {
        parent::setUp();

        $this->sms = new FakeSmsGateway;
        $this->app->instance(SmsGateway::class, $this->sms);
        $this->app->instance(PushGateway::class, new FakePushGateway);

        $this->driverUser = User::factory()->driver()->create();
        $this->driver = Driver::factory()->create(['user_id' => $this->driverUser->id, 'active' => true]);
    }

    private function orderForToday(string $status): Order
    {
        $area = ServiceArea::factory()->create();
        $address = Address::factory()->create(['service_area_id' => $area->id]);
        $slot = TimeSlot::factory()->create(['service_area_id' => $area->id, 'date' => now()->toDateString()]);

        return Order::factory()->create([
            'address_id' => $address->id,
            'time_slot_id' => $slot->id,
            'status' => $status,
        ]);
    }

    public function test_task_list_only_shows_todays_tasks_for_the_authenticated_driver(): void
    {
        $order = $this->orderForToday('assigned');
        $order->driverTasks()->create([
            'driver_id' => $this->driver->id, 'type' => 'pickup', 'status' => 'pending',
            'scheduled_at' => now(),
        ]);

        // Another driver's task — must not appear.
        $otherDriver = Driver::factory()->create();
        $otherOrder = $this->orderForToday('assigned');
        $otherOrder->driverTasks()->create([
            'driver_id' => $otherDriver->id, 'type' => 'pickup', 'status' => 'pending', 'scheduled_at' => now(),
        ]);

        // A task scheduled for tomorrow — must not appear in "today".
        $futureOrder = $this->orderForToday('assigned');
        $futureOrder->driverTasks()->create([
            'driver_id' => $this->driver->id, 'type' => 'pickup', 'status' => 'pending',
            'scheduled_at' => now()->addDay(),
        ]);

        $response = $this->actingAs($this->driverUser)->getJson('/api/v1/driver/tasks');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('order_id');
        $this->assertEqualsCanonicalizing([$order->id], $ids->all());
    }

    public function test_task_list_is_sorted_by_slot_then_area(): void
    {
        $areaB = ServiceArea::factory()->create(['name' => 'Bravo']);
        $areaA = ServiceArea::factory()->create(['name' => 'Alpha']);

        $slotLate = TimeSlot::factory()->create(['date' => now()->toDateString(), 'window' => '15:00-18:00']);
        $slotEarly = TimeSlot::factory()->create(['date' => now()->toDateString(), 'window' => '09:00-12:00']);

        $addressB = Address::factory()->create(['service_area_id' => $areaB->id]);
        $addressA = Address::factory()->create(['service_area_id' => $areaA->id]);

        $orderLate = Order::factory()->create(['address_id' => $addressB->id, 'time_slot_id' => $slotLate->id]);
        $orderEarly = Order::factory()->create(['address_id' => $addressA->id, 'time_slot_id' => $slotEarly->id]);

        foreach ([$orderLate, $orderEarly] as $order) {
            $order->driverTasks()->create([
                'driver_id' => $this->driver->id, 'type' => 'pickup', 'status' => 'pending', 'scheduled_at' => now(),
            ]);
        }

        $response = $this->actingAs($this->driverUser)->getJson('/api/v1/driver/tasks');

        $ids = collect($response->json('data'))->pluck('order_id');
        $this->assertSame([$orderEarly->id, $orderLate->id], $ids->all());
    }

    public function test_driver_can_view_their_own_task_detail_with_address_for_navigation(): void
    {
        $order = $this->orderForToday('assigned');
        $task = $order->driverTasks()->create([
            'driver_id' => $this->driver->id, 'type' => 'pickup', 'status' => 'pending', 'scheduled_at' => now(),
        ]);

        $response = $this->actingAs($this->driverUser)->getJson("/api/v1/driver/tasks/{$task->id}");

        $response->assertOk();
        $this->assertEquals($order->address->map_lat, $response->json('data.order.address.map_lat'));
        $response->assertJsonPath('data.order.address.postcode', $order->address->postcode);
    }

    public function test_driver_cannot_view_another_drivers_task(): void
    {
        $otherDriver = Driver::factory()->create();
        $order = $this->orderForToday('assigned');
        $task = $order->driverTasks()->create([
            'driver_id' => $otherDriver->id, 'type' => 'pickup', 'status' => 'pending', 'scheduled_at' => now(),
        ]);

        $this->actingAs($this->driverUser)->getJson("/api/v1/driver/tasks/{$task->id}")->assertForbidden();
    }

    public function test_pickup_records_count_weight_and_photos_and_advances_the_order(): void
    {
        Storage::fake('public');

        $order = $this->orderForToday('assigned');
        $task = $order->driverTasks()->create([
            'driver_id' => $this->driver->id, 'type' => 'pickup', 'status' => 'pending', 'scheduled_at' => now(),
        ]);

        $response = $this->actingAs($this->driverUser)->post("/api/v1/driver/tasks/{$task->id}/pickup", [
            'item_count' => 6,
            'weight' => 3.4,
            'photos' => [UploadedFile::fake()->image('a.jpg'), UploadedFile::fake()->image('b.jpg')],
        ]);

        $response->assertOk()
            ->assertJsonPath('data.item_count', 6)
            ->assertJsonPath('data.status', 'completed');

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'picked_up']);
        $task->refresh();
        $this->assertCount(2, $task->photos);
        Storage::disk('public')->assertExists($task->photos[0]);
    }

    public function test_pickup_requires_at_least_one_photo(): void
    {
        $order = $this->orderForToday('assigned');
        $task = $order->driverTasks()->create([
            'driver_id' => $this->driver->id, 'type' => 'pickup', 'status' => 'pending', 'scheduled_at' => now(),
        ]);

        $this->actingAs($this->driverUser)
            ->post("/api/v1/driver/tasks/{$task->id}/pickup", ['item_count' => 3], ['Accept' => 'application/json'])
            ->assertJsonValidationErrors('photos');
    }

    public function test_pickup_requires_no_more_than_four_photos(): void
    {
        $order = $this->orderForToday('assigned');
        $task = $order->driverTasks()->create([
            'driver_id' => $this->driver->id, 'type' => 'pickup', 'status' => 'pending', 'scheduled_at' => now(),
        ]);

        $this->actingAs($this->driverUser)
            ->post("/api/v1/driver/tasks/{$task->id}/pickup", [
                'item_count' => 3,
                'photos' => array_fill(0, 5, UploadedFile::fake()->image('x.jpg')),
            ], ['Accept' => 'application/json'])
            ->assertJsonValidationErrors('photos');
    }

    public function test_starting_delivery_generates_and_sms_an_otp_and_advances_the_order(): void
    {
        $order = $this->orderForToday('ready');
        $task = $order->driverTasks()->create([
            'driver_id' => $this->driver->id, 'type' => 'delivery', 'status' => 'pending', 'scheduled_at' => now(),
        ]);

        $response = $this->actingAs($this->driverUser)->postJson("/api/v1/driver/tasks/{$task->id}/start-delivery");

        $response->assertOk()->assertJsonPath('data.status', 'en_route');
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'out_for_delivery']);

        // One SMS is the OTP itself; the state machine also sends its own
        // "out for delivery" status notification — both are expected.
        $otpSms = collect($this->sms->sent)->first(fn ($m) => str_contains($m['message'], 'confirm handover'));
        $this->assertNotNull($otpSms, 'Expected an OTP SMS to have been sent.');
        $this->assertSame($order->user->phone, $otpSms['phone']);

        $task->refresh();
        $this->assertNotNull($task->otp);
    }

    public function test_delivery_is_confirmed_with_the_correct_otp_and_records_cash_on_delivery(): void
    {
        $order = $this->orderForToday('out_for_delivery');
        Invoice::factory()->create(['order_id' => $order->id, 'status' => 'unpaid', 'total' => 26.50]);
        $task = $order->driverTasks()->create([
            'driver_id' => $this->driver->id, 'type' => 'delivery', 'status' => 'en_route',
            'otp' => '4321', 'scheduled_at' => now(),
        ]);

        $response = $this->actingAs($this->driverUser)->postJson("/api/v1/driver/tasks/{$task->id}/deliver", [
            'otp' => '4321',
            'payment_method' => 'cash',
            'cod_amount' => 26.50,
        ]);

        $response->assertOk()->assertJsonPath('data.status', 'completed');
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'delivered']);
        $this->assertDatabaseHas('invoices', ['order_id' => $order->id, 'status' => 'paid', 'method' => 'cash']);
    }

    public function test_delivery_is_rejected_with_the_wrong_otp(): void
    {
        $order = $this->orderForToday('out_for_delivery');
        $task = $order->driverTasks()->create([
            'driver_id' => $this->driver->id, 'type' => 'delivery', 'status' => 'en_route',
            'otp' => '4321', 'scheduled_at' => now(),
        ]);

        $this->actingAs($this->driverUser)->postJson("/api/v1/driver/tasks/{$task->id}/deliver", [
            'otp' => '0000',
            'payment_method' => 'cash',
            'cod_amount' => 10,
        ])->assertJsonValidationErrors('otp');

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'out_for_delivery']);
    }

    public function test_an_otp_cannot_be_reused_after_delivery_is_confirmed(): void
    {
        $order = $this->orderForToday('out_for_delivery');
        Invoice::factory()->create(['order_id' => $order->id]);
        $task = $order->driverTasks()->create([
            'driver_id' => $this->driver->id, 'type' => 'delivery', 'status' => 'en_route',
            'otp' => '4321', 'scheduled_at' => now(),
        ]);

        $this->actingAs($this->driverUser)->postJson("/api/v1/driver/tasks/{$task->id}/deliver", [
            'otp' => '4321', 'payment_method' => 'cash', 'cod_amount' => 10,
        ])->assertOk();

        $this->actingAs($this->driverUser)->postJson("/api/v1/driver/tasks/{$task->id}/deliver", [
            'otp' => '4321', 'payment_method' => 'cash', 'cod_amount' => 10,
        ])->assertJsonValidationErrors('otp');
    }

    public function test_driver_can_report_a_failed_pickup_with_a_reason(): void
    {
        $order = $this->orderForToday('assigned');
        $task = $order->driverTasks()->create([
            'driver_id' => $this->driver->id, 'type' => 'pickup', 'status' => 'pending', 'scheduled_at' => now(),
        ]);

        $response = $this->actingAs($this->driverUser)->postJson("/api/v1/driver/tasks/{$task->id}/fail", [
            'reason' => 'Customer not home',
        ]);

        $response->assertOk()->assertJsonPath('data.status', 'failed');
        $this->assertDatabaseHas('driver_tasks', ['id' => $task->id, 'status' => 'failed', 'failure_reason' => 'Customer not home']);
        $this->assertDatabaseHas('order_notes', ['order_id' => $order->id, 'visible_to_customer' => false]);
        // Order status is left as-is for admin follow-up, not force-advanced.
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'assigned']);
    }

    public function test_driver_with_no_linked_driver_profile_is_rejected(): void
    {
        $bareUser = User::factory()->driver()->create();

        $this->actingAs($bareUser)->getJson('/api/v1/driver/tasks')->assertForbidden();
    }
}
