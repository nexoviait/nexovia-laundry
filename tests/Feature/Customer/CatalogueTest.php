<?php

namespace Tests\Feature\Customer;

use App\Models\Order;
use App\Models\Service;
use App\Models\ServiceArea;
use App\Models\TimeSlot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * REQ-CUST-04/05 (browse services & prices) and REQ-CUST-07 (time slots
 * with live capacity).
 */
class CatalogueTest extends TestCase
{
    use RefreshDatabase;

    public function test_customers_can_browse_active_services_and_prices_without_logging_in(): void
    {
        Service::factory()->create(['name' => 'Shirt', 'price' => 2.50, 'active' => true]);
        Service::factory()->create(['name' => 'Retired Service', 'active' => false]);

        $response = $this->getJson('/api/v1/services');

        $response->assertOk();
        $names = collect($response->json('data'))->pluck('name');
        $this->assertTrue($names->contains('Shirt'));
        $this->assertFalse($names->contains('Retired Service'));
    }

    public function test_time_slots_expose_live_remaining_capacity(): void
    {
        $area = ServiceArea::factory()->create(['active' => true]);
        $slot = TimeSlot::factory()->create(['service_area_id' => $area->id, 'capacity' => 2]);

        Order::factory()->count(2)->create(['time_slot_id' => $slot->id, 'status' => 'confirmed']);
        Order::factory()->create(['time_slot_id' => $slot->id, 'status' => 'cancelled']);

        $response = $this->getJson("/api/v1/time-slots?service_area_id={$area->id}");

        $response->assertOk();
        $payload = collect($response->json('data'))->firstWhere('id', $slot->id);

        $this->assertSame(2, $payload['booked']);
        $this->assertSame(0, $payload['available']);
    }

    public function test_capacity_reflects_bookings_across_all_customers_not_just_the_caller(): void
    {
        $area = ServiceArea::factory()->create(['active' => true]);
        $slot = TimeSlot::factory()->create(['service_area_id' => $area->id, 'capacity' => 5]);

        // Two other customers' bookings on the slot.
        Order::factory()->count(2)->create(['time_slot_id' => $slot->id, 'status' => 'confirmed']);

        // A third, unrelated customer (with zero bookings of their own) checks availability.
        $viewer = User::factory()->customer()->create();

        $response = $this->actingAs($viewer, 'sanctum')->getJson("/api/v1/time-slots?service_area_id={$area->id}");

        $payload = collect($response->json('data'))->firstWhere('id', $slot->id);

        $this->assertSame(2, $payload['booked']);
        $this->assertSame(3, $payload['available']);
    }
}
