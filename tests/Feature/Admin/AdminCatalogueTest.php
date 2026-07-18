<?php

namespace Tests\Feature\Admin;

use App\Models\Address;
use App\Models\Order;
use App\Models\Service;
use App\Models\ServiceArea;
use App\Models\TimeSlot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** FR-ADM-005/006/007/008: services, time slots, service areas, customers. */
class AdminCatalogueTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
    }

    public function test_admin_can_create_update_and_remove_a_service(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/services', [
            'name' => 'Shirt', 'unit' => 'item', 'price' => 2.5, 'active' => true,
        ]);
        $response->assertRedirect();
        $service = Service::firstWhere('name', 'Shirt');
        $this->assertNotNull($service);

        $this->actingAs($this->admin)->put("/admin/services/{$service->id}", ['price' => 3.0])->assertRedirect();
        $this->assertDatabaseHas('services', ['id' => $service->id, 'price' => 3.0]);

        $this->actingAs($this->admin)->delete("/admin/services/{$service->id}")->assertRedirect();
        $this->assertDatabaseMissing('services', ['id' => $service->id]);
    }

    public function test_admin_can_create_and_update_a_time_slot(): void
    {
        $area = ServiceArea::factory()->create();

        $response = $this->actingAs($this->admin)->post('/admin/time-slots', [
            'service_area_id' => $area->id, 'date' => now()->addDay()->toDateString(), 'window' => '09:00-12:00', 'capacity' => 10,
        ]);
        $response->assertRedirect();
        $slot = TimeSlot::where('service_area_id', $area->id)->first();
        $this->assertNotNull($slot);

        $this->actingAs($this->admin)->put("/admin/time-slots/{$slot->id}", ['capacity' => 15])->assertRedirect();
        $this->assertDatabaseHas('time_slots', ['id' => $slot->id, 'capacity' => 15]);
    }

    public function test_admin_can_toggle_a_service_area_active_state(): void
    {
        $area = ServiceArea::factory()->create(['active' => true]);

        $this->actingAs($this->admin)->post("/admin/service-areas/{$area->id}/toggle")->assertRedirect();
        $this->assertDatabaseHas('service_areas', ['id' => $area->id, 'active' => false]);

        $this->actingAs($this->admin)->post("/admin/service-areas/{$area->id}/toggle")->assertRedirect();
        $this->assertDatabaseHas('service_areas', ['id' => $area->id, 'active' => true]);
    }

    public function test_admin_can_list_and_search_customers(): void
    {
        $match = User::factory()->customer()->create(['name' => 'Alice Example']);
        User::factory()->customer()->create(['name' => 'Bob Other']);
        Order::factory()->create(['user_id' => $match->id]);

        $response = $this->actingAs($this->admin)->get('/admin/customers?search=Alice');

        $response->assertOk()->assertInertia(fn ($page) => $page
            ->component('Admin/Customers/Index')
            ->has('customers.data', 1)
            ->where('customers.data.0.orders_count', 1)
        );
    }

    public function test_admin_can_view_a_customer_detail_page(): void
    {
        $customer = User::factory()->customer()->create();
        Address::factory()->create(['user_id' => $customer->id]);
        Order::factory()->create(['user_id' => $customer->id]);

        $this->actingAs($this->admin)->get("/admin/customers/{$customer->id}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Customers/Show')
                ->has('addresses', 1)
                ->has('orders', 1)
            );
    }

    public function test_admin_can_view_revenue_analytics(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/reports/revenue');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Reports/Revenue')
                ->has('summary.total_revenue')
                ->has('summary.total_invoices')
                ->has('summary.avg_order_value')
                ->has('summary.pending_settlements')
                ->has('branch_stats')
            );
    }
}
