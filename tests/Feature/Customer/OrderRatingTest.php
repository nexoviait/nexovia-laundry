<?php

namespace Tests\Feature\Customer;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * REQ-CUST-11: star rating after delivery, via the Bearer-token API used
 * by the mobile app (mirrors the session-based web portal's rate() flow).
 */
class OrderRatingTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->customer = User::factory()->customer()->create();
    }

    public function test_customer_can_rate_a_delivered_order(): void
    {
        $order = Order::factory()->create(['user_id' => $this->customer->id, 'status' => 'delivered']);

        $response = $this->actingAs($this->customer)->postJson("/api/v1/orders/{$order->id}/rating", [
            'stars' => 5,
            'comment' => 'Excellent service',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'rated')
            ->assertJsonPath('data.rating.stars', 5);

        $this->assertDatabaseHas('ratings', [
            'order_id' => $order->id,
            'user_id' => $this->customer->id,
            'stars' => 5,
            'comment' => 'Excellent service',
        ]);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'rated']);
    }

    public function test_rating_is_rejected_before_the_order_is_delivered(): void
    {
        $order = Order::factory()->create(['user_id' => $this->customer->id, 'status' => 'out_for_delivery']);

        $this->actingAs($this->customer)->postJson("/api/v1/orders/{$order->id}/rating", ['stars' => 4])
            ->assertStatus(422);

        $this->assertDatabaseMissing('ratings', ['order_id' => $order->id]);
    }

    public function test_rating_requires_a_star_count_between_one_and_five(): void
    {
        $order = Order::factory()->create(['user_id' => $this->customer->id, 'status' => 'delivered']);

        $this->actingAs($this->customer)->postJson("/api/v1/orders/{$order->id}/rating", ['stars' => 6])
            ->assertJsonValidationErrors('stars');
    }

    public function test_customer_cannot_rate_another_customers_order(): void
    {
        $other = Order::factory()->create(['status' => 'delivered']);

        $this->actingAs($this->customer)->postJson("/api/v1/orders/{$other->id}/rating", ['stars' => 5])
            ->assertNotFound();
    }
}
