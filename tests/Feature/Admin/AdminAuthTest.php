<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** FR-ADM-001: admin panel login with roles. */
class AdminAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_log_in_and_reach_the_order_board(): void
    {
        User::factory()->admin()->create(['email' => 'admin@cleanquicklaundry.com', 'password' => 'secret-password']);

        $response = $this->post('/admin/login', [
            'email' => 'admin@cleanquicklaundry.com',
            'password' => 'secret-password',
        ]);

        $response->assertRedirect('/admin/orders');
        $this->assertAuthenticated();
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->admin()->create(['email' => 'admin@cleanquicklaundry.com', 'password' => 'secret-password']);

        $response = $this->post('/admin/login', [
            'email' => 'admin@cleanquicklaundry.com',
            'password' => 'wrong',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_non_admin_staff_cannot_log_into_the_admin_panel(): void
    {
        User::factory()->driver()->create(['email' => 'driver@cleanquicklaundry.com', 'password' => 'secret-password']);

        $response = $this->post('/admin/login', [
            'email' => 'driver@cleanquicklaundry.com',
            'password' => 'secret-password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_guest_is_redirected_to_login_when_visiting_the_order_board(): void
    {
        $this->get('/admin/orders')->assertRedirect('/admin/login');
    }

    public function test_customer_role_is_forbidden_from_the_admin_panel(): void
    {
        $customer = User::factory()->customer()->create();

        $this->actingAs($customer)->get('/admin/orders')->assertForbidden();
    }

    public function test_admin_can_log_out(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post('/admin/logout')->assertRedirect('/admin/login');
        $this->assertGuest();
    }
}
