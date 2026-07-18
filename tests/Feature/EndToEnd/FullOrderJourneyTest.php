<?php

namespace Tests\Feature\EndToEnd;

use App\Enums\OrderStatus;
use App\Models\DriverTask;
use App\Models\GarmentTag;
use App\Models\OrderItem;
use App\Models\ServiceArea;
use App\Models\User;
use App\Services\Push\PushGateway;
use App\Services\Sms\SmsGateway;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Doubles\FakePushGateway;
use Tests\Doubles\FakeSmsGateway;
use Tests\TestCase;

/**
 * Runs the whole Phase 1 order journey against seeded launch data, exactly
 * as the real system would: customer books -> admin confirms & assigns ->
 * driver picks up -> shop processes -> driver delivers with OTP. Asserts
 * the order status machine, invoice generation, and every customer
 * notification (§4.1 "Customer sees" text) fire at the right step.
 */
class FullOrderJourneyTest extends TestCase
{
    use RefreshDatabase;

    private FakeSmsGateway $sms;

    private FakePushGateway $push;

    protected function setUp(): void
    {
        parent::setUp();

        $this->sms = new FakeSmsGateway;
        $this->push = new FakePushGateway;
        $this->app->instance(SmsGateway::class, $this->sms);
        $this->app->instance(PushGateway::class, $this->push);

        $this->seed(DatabaseSeeder::class);
        Storage::fake('public');
    }

    public function test_the_full_order_journey_from_booking_to_delivery(): void
    {
        $area = ServiceArea::where('name', 'Lozells')->firstOrFail();
        $customerPhone = '+447700900555';

        // --- 1. Customer: phone OTP onboarding -------------------------------------------------
        $this->postJson('/api/v1/auth/otp/request', ['phone' => $customerPhone])->assertOk();
        $otp = $this->sms->lastCodeFor($customerPhone);
        $this->assertNotNull($otp, 'Expected an OTP to have been sent to the customer.');

        $verify = $this->postJson('/api/v1/auth/otp/verify', [
            'phone' => $customerPhone,
            'otp' => $otp,
            'name' => 'Ada Journey',
        ])->assertOk();
        $customerToken = $verify->json('token');

        // --- 2. Customer: browse catalogue (FR-CUS-004/005/007) ---------------------------------
        $services = $this->getJson('/api/v1/services')->assertOk()->json('data');
        $this->assertNotEmpty($services, 'Expected seeded services to be available.');
        $shirt = collect($services)->firstWhere('name', 'Shirt');
        $this->assertNotNull($shirt);

        $slots = $this->getJson("/api/v1/time-slots?service_area_id={$area->id}")->assertOk()->json('data');
        $this->assertNotEmpty($slots, 'Expected seeded time slots to be available.');
        $slot = $slots[0];

        // --- 3. Customer: add an address inside the seeded active area (FR-CUS-002/028) --------
        $address = $this->withToken($customerToken)
            ->postJson('/api/v1/addresses', [
                'label' => 'Home',
                'postcode' => $area->postcode.' 1AA',
                'directions' => 'Blue door, ring twice',
            ])
            ->assertCreated()
            ->json('data');

        // --- 4. Customer: place the order (FR-CUS-001/006/008) ----------------------------------
        $order = $this->withToken($customerToken)
            ->postJson('/api/v1/orders', [
                'address_id' => $address['id'],
                'time_slot_id' => $slot['id'],
                'note' => 'Please knock, doorbell is broken',
                'items' => [['service_id' => $shirt['id'], 'qty' => 3]],
            ])
            ->assertCreated()
            ->json('data');

        $this->assertSame('pending', $order['status']);
        $this->assertNotificationFired($order['id'], $customerPhone, 'pending');

        // --- 5. Admin: confirm order + assign driver (FR-ADM-004/021) ---------------------------
        $admin = User::where('email', 'admin@cleanquicklaundry.com')->firstOrFail();
        $driverUser = User::where('email', 'driver@cleanquicklaundry.com')->firstOrFail();
        $driver = $driverUser->driver;

        $this->freshAuth()->actingAs($admin)->post("/admin/orders/{$order['id']}/confirm")->assertRedirect();
        $this->assertNotificationFired($order['id'], $customerPhone, 'confirmed');

        $this->freshAuth()->actingAs($admin)
            ->post("/admin/orders/{$order['id']}/assign-driver", ['driver_id' => $driver->id])
            ->assertRedirect();
        $this->assertDatabaseHas('orders', ['id' => $order['id'], 'status' => 'assigned']);
        $this->assertDatabaseHas('driver_tasks', ['order_id' => $order['id'], 'driver_id' => $driver->id, 'type' => 'pickup']);
        $this->assertDatabaseHas('driver_tasks', ['order_id' => $order['id'], 'driver_id' => $driver->id, 'type' => 'delivery']);
        $this->assertNotificationFired($order['id'], $customerPhone, 'assigned');

        $pickupTask = DriverTask::where('order_id', $order['id'])->where('type', 'pickup')->firstOrFail();
        $deliveryTask = DriverTask::where('order_id', $order['id'])->where('type', 'delivery')->firstOrFail();

        // --- 6. Driver: pick up (FR-RID-004) -----------------------------------------------------
        $this->freshAuth()->actingAs($driverUser)->post("/api/v1/driver/tasks/{$pickupTask->id}/pickup", [
            'item_count' => 3,
            'weight' => 1.2,
            'photos' => [UploadedFile::fake()->image('pickup.jpg')],
        ])->assertOk();

        $this->assertDatabaseHas('orders', ['id' => $order['id'], 'status' => 'picked_up']);
        $this->assertNotificationFired($order['id'], $customerPhone, 'picked_up');

        // --- 7. Shop: receive with intake, work the floor, finalize (FR-OPS-001/003/005) --------
        $shopUser = User::where('email', 'shop@cleanquicklaundry.com')->firstOrFail();
        $orderItem = OrderItem::where('order_id', $order['id'])->firstOrFail();

        $this->freshAuth()->actingAs($shopUser)->post("/shop/orders/{$order['id']}/receive", [
            'counts' => [['order_item_id' => $orderItem->id, 'actual_qty' => 3]],
        ])->assertRedirect();

        $this->assertDatabaseHas('orders', ['id' => $order['id'], 'status' => 'processing']);
        $this->assertNotificationFired($order['id'], $customerPhone, 'processing');

        $tag = GarmentTag::where('order_item_id', $orderItem->id)->firstOrFail();
        foreach (['washing', 'drying', 'ironing', 'quality_check'] as $stage) {
            $this->freshAuth()->actingAs($shopUser)
                ->post("/shop/garment-tags/{$tag->id}/stage", ['stage' => $stage])
                ->assertRedirect();
        }
        $this->assertDatabaseHas('garment_tags', ['id' => $tag->id, 'stage' => 'quality_check']);

        $this->freshAuth()->actingAs($shopUser)->post("/shop/orders/{$order['id']}/finalize", [
            'final_weight' => 1.3,
        ])->assertRedirect();

        $this->assertDatabaseHas('orders', ['id' => $order['id'], 'status' => 'ready']);
        $this->assertDatabaseHas('invoices', ['order_id' => $order['id'], 'status' => 'unpaid']);
        $this->assertNotificationFired($order['id'], $customerPhone, 'ready');

        // --- 8. Driver: start delivery run + OTP handover (FR-RID-005/006/007) ------------------
        $this->freshAuth()->actingAs($driverUser)
            ->postJson("/api/v1/driver/tasks/{$deliveryTask->id}/start-delivery")
            ->assertOk();

        $this->assertDatabaseHas('orders', ['id' => $order['id'], 'status' => 'out_for_delivery']);
        $this->assertNotificationFired($order['id'], $customerPhone, 'out_for_delivery');

        $deliveryOtp = collect($this->sms->sent)
            ->last(fn ($m) => $m['phone'] === $customerPhone && str_contains($m['message'], 'confirm handover'));
        $this->assertNotNull($deliveryOtp, 'Expected a delivery handover OTP to have been sent.');
        preg_match('/handover: (\d{4})/', $deliveryOtp['message'], $matches);
        $handoverCode = $matches[1] ?? null;
        $this->assertNotNull($handoverCode);

        $this->freshAuth()->actingAs($driverUser)->postJson("/api/v1/driver/tasks/{$deliveryTask->id}/deliver", [
            'otp' => $handoverCode,
            'payment_method' => 'cash',
            'cod_amount' => $order['total'],
        ])->assertOk();

        // --- 9. Final assertions -------------------------------------------------------------
        $this->assertDatabaseHas('orders', ['id' => $order['id'], 'status' => 'delivered']);
        $this->assertDatabaseHas('invoices', ['order_id' => $order['id'], 'status' => 'paid', 'method' => 'cash']);
        $this->assertNotificationFired($order['id'], $customerPhone, 'delivered');

        $orderDetail = $this->freshAuth()->withToken($customerToken)
            ->getJson("/api/v1/orders/{$order['id']}")
            ->assertOk()
            ->json('data');

        $statuses = collect($orderDetail['status_histories'])->pluck('status')->all();
        $this->assertSame(
            ['pending', 'confirmed', 'assigned', 'picked_up', 'processing', 'ready', 'out_for_delivery', 'delivered'],
            $statuses
        );
    }

    /**
     * Laravel's actingAs() sets the resolved user directly on the 'web'
     * guard, and Sanctum checks that guard before falling back to Bearer
     * token lookup (see config/sanctum.php `guard`). Without this, a
     * later actingAs() call for one actor (e.g. the admin web panel)
     * silently hijacks a subsequent Bearer-token request meant for a
     * different actor (e.g. the customer's API token).
     */
    private function freshAuth(): static
    {
        $this->app['auth']->forgetGuards();

        return $this;
    }

    /**
     * Asserts the §4.1 "Customer sees" notification fired for a status:
     * an in-app UserNotification row, an SMS, and a push message, all
     * carrying the exact copy from OrderStatus::customerMessage().
     */
    private function assertNotificationFired(int $orderId, string $customerPhone, string $status): void
    {
        $message = OrderStatus::from($status)->customerMessage();

        $this->assertDatabaseHas('user_notifications', ['body' => $message]);

        $this->assertTrue(
            collect($this->sms->sent)->contains(fn ($m) => $m['phone'] === $customerPhone && $m['message'] === $message),
            "Expected an SMS with the '{$status}' status message to have been sent."
        );

        $this->assertTrue(
            collect($this->push->sent)->contains(fn ($m) => $m['message'] === $message),
            "Expected a push notification with the '{$status}' status message to have been sent."
        );
    }
}
