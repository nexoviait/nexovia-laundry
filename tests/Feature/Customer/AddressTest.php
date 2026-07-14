<?php

namespace Tests\Feature\Customer;

use App\Exceptions\OutOfServiceAreaException;
use App\Models\Address;
use App\Models\Lead;
use App\Models\ServiceArea;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * REQ-CUST-03 (saved addresses) and REQ-CUST-02 / NFR-03 (active-area
 * gating with lead capture for out-of-area attempts).
 */
class AddressTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->customer = User::factory()->customer()->create();
        ServiceArea::factory()->create(['name' => 'Lozells', 'postcode' => 'B19', 'active' => true]);
    }

    public function test_customer_can_add_an_address_inside_an_active_service_area(): void
    {
        $response = $this->actingAs($this->customer, 'sanctum')->postJson('/api/v1/addresses', [
            'label' => 'Home',
            'postcode' => 'B19 3AB',
            'directions' => 'Blue door',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.label', 'Home')
            ->assertJsonPath('data.postcode', 'B19 3AB')
            ->assertJsonPath('data.service_area.name', 'Lozells');

        $this->assertDatabaseHas('addresses', ['user_id' => $this->customer->id, 'postcode' => 'B19 3AB']);
    }

    public function test_address_outside_every_active_area_is_blocked_and_captured_as_a_lead(): void
    {
        $response = $this->actingAs($this->customer, 'sanctum')->postJson('/api/v1/addresses', [
            'label' => 'Out of range',
            'postcode' => 'ZZ99 9ZZ',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => OutOfServiceAreaException::MESSAGE,
                'blocked' => true,
            ]);

        $this->assertDatabaseMissing('addresses', ['postcode' => 'ZZ99 9ZZ']);
        $this->assertDatabaseHas('leads', [
            'user_id' => $this->customer->id,
            'phone' => $this->customer->phone,
            'postcode' => 'ZZ99 9ZZ',
        ]);
    }

    public function test_address_in_an_area_that_has_since_been_deactivated_is_blocked_on_creation(): void
    {
        ServiceArea::query()->update(['active' => false]);

        $response = $this->actingAs($this->customer, 'sanctum')->postJson('/api/v1/addresses', [
            'label' => 'Home',
            'postcode' => 'B19 3AB',
        ]);

        $response->assertStatus(422);
        $this->assertSame(1, Lead::count());
    }

    public function test_customer_only_sees_their_own_addresses(): void
    {
        $mine = Address::factory()->create(['user_id' => $this->customer->id]);
        Address::factory()->create(); // another customer's address

        $response = $this->actingAs($this->customer, 'sanctum')->getJson('/api/v1/addresses');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id');
        $this->assertEqualsCanonicalizing([$mine->id], $ids->all());
    }

    public function test_customer_can_update_their_own_address_label(): void
    {
        $address = Address::factory()->create(['user_id' => $this->customer->id, 'label' => 'Home']);

        $response = $this->actingAs($this->customer, 'sanctum')
            ->putJson("/api/v1/addresses/{$address->id}", ['label' => 'Work']);

        $response->assertOk()->assertJsonPath('data.label', 'Work');
    }

    public function test_moving_an_address_out_of_area_via_update_is_blocked_and_keeps_the_original(): void
    {
        $address = Address::factory()->create([
            'user_id' => $this->customer->id,
            'postcode' => 'B19 3AB',
        ]);

        $response = $this->actingAs($this->customer, 'sanctum')
            ->putJson("/api/v1/addresses/{$address->id}", ['postcode' => 'ZZ99 9ZZ']);

        $response->assertStatus(422);
        $this->assertDatabaseHas('addresses', ['id' => $address->id, 'postcode' => 'B19 3AB']);
    }

    public function test_customer_cannot_view_update_or_delete_another_customers_address(): void
    {
        $other = Address::factory()->create();

        $this->actingAs($this->customer, 'sanctum')->getJson("/api/v1/addresses/{$other->id}")->assertNotFound();
        $this->actingAs($this->customer, 'sanctum')->putJson("/api/v1/addresses/{$other->id}", ['label' => 'Hijack'])->assertNotFound();
        $this->actingAs($this->customer, 'sanctum')->deleteJson("/api/v1/addresses/{$other->id}")->assertNotFound();
    }

    public function test_customer_can_delete_their_own_address(): void
    {
        $address = Address::factory()->create(['user_id' => $this->customer->id]);

        $this->actingAs($this->customer, 'sanctum')
            ->deleteJson("/api/v1/addresses/{$address->id}")
            ->assertOk();

        $this->assertDatabaseMissing('addresses', ['id' => $address->id]);
    }
}
