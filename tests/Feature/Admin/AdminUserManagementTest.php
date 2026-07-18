<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Driver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    public function test_guest_cannot_access_user_management(): void
    {
        $this->get('/admin/customers')->assertRedirect('/admin/login');
        $this->post('/admin/customers', [])->assertRedirect('/admin/login');
    }

    public function test_admin_can_view_users(): void
    {
        $this->actingAs($this->admin)
            ->get('/admin/customers')
            ->assertOk();
    }

    public function test_admin_can_create_customer(): void
    {
        $response = $this->actingAs($this->admin)
            ->post('/admin/customers', [
                'name' => 'John Customer',
                'email' => 'john@example.com',
                'phone' => '+447700900111',
                'role' => 'customer',
                'language' => 'en',
                'branch' => 'Downtown Central', // should be ignored & set to null in controller
                'password' => 'secret123',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'name' => 'John Customer',
            'email' => 'john@example.com',
            'role' => 'customer',
            'branch' => null,
        ]);
    }

    public function test_admin_can_create_driver_with_profile(): void
    {
        $response = $this->actingAs($this->admin)
            ->post('/admin/customers', [
                'name' => 'Bob Driver',
                'email' => 'bob@example.com',
                'phone' => '+447700900222',
                'role' => 'driver',
                'language' => 'en',
                'branch' => 'Westside Hub',
                'password' => 'secret123',
            ]);

        $response->assertRedirect();
        
        $user = User::where('email', 'bob@example.com')->firstOrFail();
        $this->assertEquals('driver', $user->role);
        $this->assertEquals('Westside Hub', $user->branch);
        
        $this->assertDatabaseHas('drivers', [
            'user_id' => $user->id,
            'active' => true,
        ]);
    }

    public function test_admin_can_update_user(): void
    {
        $user = User::factory()->create(['role' => 'shop']);

        $response = $this->actingAs($this->admin)
            ->put("/admin/customers/{$user->id}", [
                'name' => 'Updated Staff Name',
                'email' => 'updated@example.com',
                'phone' => $user->phone,
                'role' => 'shop',
                'language' => 'es',
                'branch' => 'Eastside Depot',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Staff Name',
            'email' => 'updated@example.com',
            'language' => 'es',
            'branch' => 'Eastside Depot',
        ]);
    }

    public function test_admin_can_delete_user(): void
    {
        $user = User::factory()->create(['role' => 'shop']);

        $response = $this->actingAs($this->admin)
            ->delete("/admin/customers/{$user->id}");

        $response->assertRedirect();
        $this->assertModelMissing($user);
    }

    public function test_admin_cannot_delete_self(): void
    {
        $response = $this->actingAs($this->admin)
            ->delete("/admin/customers/{$this->admin->id}");

        $response->assertRedirect();
        $this->assertModelExists($this->admin);
    }

    public function test_admin_role_cannot_be_changed(): void
    {
        $otherAdmin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($this->admin)
            ->put("/admin/customers/{$otherAdmin->id}", [
                'name' => 'Attempted Change',
                'email' => $otherAdmin->email,
                'phone' => $otherAdmin->phone,
                'role' => 'shop', // attempt demotion
                'language' => 'en',
            ]);

        $response->assertRedirect();
        $otherAdmin->refresh();
        $this->assertEquals('admin', $otherAdmin->role);
        $this->assertNull($otherAdmin->branch);
    }
}
