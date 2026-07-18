<?php

namespace Tests\Feature\Driver;

use App\Models\Address;
use App\Models\Driver;
use App\Models\DriverTask;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\ServiceArea;
use App\Models\Setting;
use App\Models\TimeSlot;
use App\Models\User;
use App\Services\Push\PushGateway;
use App\Services\Sms\SmsGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Doubles\FakePushGateway;
use Tests\Doubles\FakeSmsGateway;
use Tests\TestCase;

class DriverWebTaskTest extends TestCase
{
    use RefreshDatabase;

    private User $driverUser;
    private Driver $driver;
    private Order $order;
    private DriverTask $pickupTask;
    private DriverTask $deliveryTask;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->instance(SmsGateway::class, new FakeSmsGateway);
        $this->app->instance(PushGateway::class, new FakePushGateway);

        $this->driverUser = User::factory()->create(['role' => 'driver']);
        $this->driver = Driver::factory()->create([
            'user_id' => $this->driverUser->id,
            'vehicle_type' => 'van',
            'vehicle_number' => 'CQ21 VAN',
            'active' => true,
        ]);

        $area = ServiceArea::factory()->create();
        $address = Address::factory()->create(['service_area_id' => $area->id]);
        $slot = TimeSlot::factory()->create(['service_area_id' => $area->id]);

        $this->order = Order::factory()->create([
            'user_id' => User::factory()->create(['role' => 'customer'])->id,
            'address_id' => $address->id,
            'time_slot_id' => $slot->id,
            'status' => 'assigned',
            'subtotal' => 10,
            'discount' => 0,
            'delivery_fee' => 2.50,
            'vat' => 2.00,
            'total' => 14.50,
        ]);

        $this->pickupTask = DriverTask::factory()->create([
            'driver_id' => $this->driver->id,
            'order_id' => $this->order->id,
            'type' => 'pickup',
            'status' => 'pending',
            'scheduled_at' => now()->toDateString(),
        ]);

        $this->deliveryTask = DriverTask::factory()->create([
            'driver_id' => $this->driver->id,
            'order_id' => $this->order->id,
            'type' => 'delivery',
            'status' => 'pending',
            'scheduled_at' => now()->toDateString(),
        ]);
    }

    public function test_driver_can_view_dashboard_with_todays_tasks(): void
    {
        $this->actingAs($this->driverUser)
            ->get('/driver/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Driver/Dashboard')
                ->has('tasks', 2)
            );
    }

    public function test_driver_can_view_task_detail(): void
    {
        $this->actingAs($this->driverUser)
            ->get("/driver/tasks/{$this->pickupTask->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Driver/TaskShow')
                ->where('task.id', $this->pickupTask->id)
            );
    }

    public function test_driver_can_confirm_pickup_with_photos(): void
    {
        Storage::fake('public');

        $photo = UploadedFile::fake()->image('laundry.jpg');

        $response = $this->actingAs($this->driverUser)
            ->post("/driver/tasks/{$this->pickupTask->id}/pickup", [
                'item_count' => 3,
                'weight' => 5.2,
                'photos' => [$photo],
            ]);

        $response->assertRedirect('/driver/dashboard');

        $this->assertDatabaseHas('driver_tasks', [
            'id' => $this->pickupTask->id,
            'status' => 'completed',
            'item_count' => 3,
            'weight' => 5.2,
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $this->order->id,
            'status' => 'picked_up',
        ]);
    }

    public function test_driver_can_start_delivery_to_send_otp(): void
    {
        $this->order->update(['status' => 'ready']);

        $response = $this->actingAs($this->driverUser)
            ->post("/driver/tasks/{$this->deliveryTask->id}/start-delivery")
            ->assertRedirect();

        $this->assertDatabaseHas('driver_tasks', [
            'id' => $this->deliveryTask->id,
            'status' => 'en_route',
        ]);

        $this->assertNotNull($this->deliveryTask->fresh()->otp);

        $this->assertDatabaseHas('orders', [
            'id' => $this->order->id,
            'status' => 'out_for_delivery',
        ]);
    }

    public function test_driver_can_complete_delivery_with_correct_otp(): void
    {
        $this->order->update(['status' => 'out_for_delivery']);
        $this->deliveryTask->update(['otp' => '9999', 'status' => 'en_route']);

        Invoice::factory()->create([
            'order_id' => $this->order->id,
            'total' => 14.50,
            'status' => 'unpaid',
        ]);

        $response = $this->actingAs($this->driverUser)
            ->post("/driver/tasks/{$this->deliveryTask->id}/deliver", [
                'otp' => '9999',
                'payment_method' => 'cash',
                'cod_amount' => 14.50,
            ]);

        $response->assertRedirect('/driver/dashboard');

        $this->assertDatabaseHas('driver_tasks', [
            'id' => $this->deliveryTask->id,
            'status' => 'completed',
            'payment_method' => 'cash',
            'cod_amount' => 14.50,
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $this->order->id,
            'status' => 'delivered',
        ]);

        $this->assertDatabaseHas('invoices', [
            'order_id' => $this->order->id,
            'status' => 'paid',
            'method' => 'cash',
        ]);
    }

    public function test_driver_can_fail_task_with_reason(): void
    {
        $response = $this->actingAs($this->driverUser)
            ->post("/driver/tasks/{$this->pickupTask->id}/fail", [
                'reason' => 'Customer was not at home',
            ]);

        $response->assertRedirect('/driver/dashboard');

        $this->assertDatabaseHas('driver_tasks', [
            'id' => $this->pickupTask->id,
            'status' => 'failed',
            'failure_reason' => 'Customer was not at home',
        ]);

        $this->assertDatabaseHas('order_notes', [
            'order_id' => $this->order->id,
            'note' => 'Pickup failed: Customer was not at home',
        ]);
    }
}
