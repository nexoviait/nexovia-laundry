<?php

namespace Tests\Feature\Customer;

use App\Enums\OrderStatus;
use App\Models\Address;
use App\Models\Lead;
use App\Models\Order;
use App\Models\Service;
use App\Models\ServiceArea;
use App\Models\TimeSlot;
use App\Models\User;
use App\Services\Push\PushGateway;
use App\Services\Sms\SmsGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Doubles\FakePushGateway;
use Tests\Doubles\FakeSmsGateway;
use Tests\TestCase;

class CustomerWebPortalTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;
    private ServiceArea $area;
    private FakeSmsGateway $sms;

    protected function setUp(): void
    {
        parent::setUp();

        $this->sms = new FakeSmsGateway;
        $this->app->instance(SmsGateway::class, $this->sms);
        $this->app->instance(PushGateway::class, new FakePushGateway);

        $this->customer = User::factory()->customer()->create(['phone' => '+447700900555']);
        $this->area = ServiceArea::factory()->create(['name' => 'Lozells', 'postcode' => 'B19', 'active' => true]);
    }

    public function test_guest_is_redirected_to_login_when_visiting_dashboard(): void
    {
        $response = $this->get('/dashboard');
        $response->assertRedirect('/login');
    }

    public function test_guest_can_view_login_page(): void
    {
        $response = $this->get('/login');
        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Customer/Auth/Login'));
    }

    public function test_customer_can_request_otp_and_login_on_web(): void
    {
        // 1. Request OTP
        $response = $this->post('/login/request', ['phone' => '+447700900555']);
        $response->assertRedirect();
        
        $otp = $this->sms->lastCodeFor('+447700900555');
        $this->assertNotNull($otp);

        // 2. Verify OTP
        $verifyResponse = $this->post('/login/verify', [
            'phone' => '+447700900555',
            'otp' => $otp,
            'name' => 'Web Customer',
        ]);

        $verifyResponse->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($this->customer);
    }

    public function test_customer_can_view_dashboard_with_orders(): void
    {
        $order = Order::factory()->create(['user_id' => $this->customer->id, 'status' => 'pending']);

        $response = $this->actingAs($this->customer)
            ->get('/dashboard');

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Customer/Dashboard')
                ->has('orders.data', 1)
            );
    }

    public function test_customer_can_add_address_on_web(): void
    {
        $response = $this->actingAs($this->customer)
            ->post('/addresses', [
                'label' => 'Home',
                'postcode' => 'B19 3AB',
                'directions' => 'Ring twice',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('addresses', [
            'user_id' => $this->customer->id,
            'postcode' => 'B19 3AB',
            'label' => 'Home',
        ]);
    }

    public function test_out_of_area_postcode_on_web_redirects_with_errors_and_captures_lead(): void
    {
        $response = $this->actingAs($this->customer)
            ->post('/addresses', [
                'label' => 'Out of bounds',
                'postcode' => 'ZZ99 9ZZ',
            ]);

        $response->assertSessionHasErrors('postcode');
        $this->assertDatabaseHas('leads', [
            'user_id' => $this->customer->id,
            'postcode' => 'ZZ99 9ZZ',
        ]);
    }

    public function test_customer_can_place_order_on_web(): void
    {
        $address = Address::factory()->create(['user_id' => $this->customer->id, 'service_area_id' => $this->area->id]);
        $slot = TimeSlot::factory()->create(['service_area_id' => $this->area->id, 'capacity' => 5]);
        $service = Service::factory()->create(['price' => 5, 'active' => true]);

        $response = $this->actingAs($this->customer)
            ->post('/book', [
                'address_id' => $address->id,
                'time_slot_id' => $slot->id,
                'note' => 'Leave at back door',
                'items' => [['service_id' => $service->id, 'qty' => 3]],
            ]);

        $response->assertRedirect();
        
        $order = Order::latest()->first();
        $this->assertNotNull($order);
        $this->assertEquals(15.00, $order->subtotal);
        $this->assertEquals(OrderStatus::Pending, $order->status);
    }

    public function test_customer_can_rate_delivered_order_on_web(): void
    {
        $order = Order::factory()->create(['user_id' => $this->customer->id, 'status' => 'delivered']);

        $response = $this->actingAs($this->customer)
            ->post("/orders/{$order->id}/rate", [
                'stars' => 5,
                'comment' => 'Perfect cleanup!',
            ]);

        $response->assertRedirect();
        
        $this->assertDatabaseHas('ratings', [
            'order_id' => $order->id,
            'stars' => 5,
            'comment' => 'Perfect cleanup!',
        ]);

        $order->refresh();
        $this->assertEquals(OrderStatus::Rated, $order->status);
    }
}
