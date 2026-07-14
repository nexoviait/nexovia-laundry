<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_login_with_admin_created_credentials(): void
    {
        User::factory()->admin()->create([
            'email' => 'admin@cleanquicklaundry.com',
            'password' => 'secret-password',
        ]);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'admin@cleanquicklaundry.com',
            'password' => 'secret-password',
        ]);

        $response->assertOk()
            ->assertJsonPath('user.role', 'admin')
            ->assertJsonStructure(['user', 'token']);
    }

    public function test_driver_can_login_with_admin_created_credentials(): void
    {
        User::factory()->driver()->create([
            'email' => 'driver@cleanquicklaundry.com',
            'password' => 'secret-password',
        ]);

        $this->postJson('/api/v1/login', [
            'email' => 'driver@cleanquicklaundry.com',
            'password' => 'secret-password',
        ])->assertOk()->assertJsonPath('user.role', 'driver');
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->admin()->create([
            'email' => 'admin@cleanquicklaundry.com',
            'password' => 'secret-password',
        ]);

        $this->postJson('/api/v1/login', [
            'email' => 'admin@cleanquicklaundry.com',
            'password' => 'wrong-password',
        ])->assertUnprocessable();
    }

    public function test_customers_cannot_use_the_password_login_endpoint(): void
    {
        // Customers created via OTP have no password at all.
        $customer = User::factory()->customer()->create([
            'email' => 'customer@example.com',
            'password' => null,
        ]);

        $this->postJson('/api/v1/login', [
            'email' => $customer->email,
            'password' => 'anything',
        ])->assertUnprocessable();
    }

    public function test_an_authenticated_staff_member_can_fetch_their_own_profile(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/me');

        $response->assertOk()->assertJsonPath('data.id', $admin->id);
    }

    public function test_logout_revokes_the_current_token(): void
    {
        $admin = User::factory()->admin()->create(['password' => 'secret-password']);

        $login = $this->postJson('/api/v1/login', [
            'email' => $admin->email,
            'password' => 'secret-password',
        ])->assertOk();

        $token = $login->json('token');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
