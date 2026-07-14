<?php

namespace Tests\Feature\Shop;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** FR-OPS-001 to 005 access control: shop staff (and admins) only. */
class ShopAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_shop_staff_can_log_in_and_are_redirected_to_the_shop_board(): void
    {
        User::factory()->shop()->create(['email' => 'shop@cleanquicklaundry.com', 'password' => 'secret-password']);

        $response = $this->post('/admin/login', [
            'email' => 'shop@cleanquicklaundry.com',
            'password' => 'secret-password',
        ]);

        $response->assertRedirect('/shop/board');
        $this->assertAuthenticated();
    }

    public function test_shop_staff_can_reach_the_board(): void
    {
        $shop = User::factory()->shop()->create();

        $this->actingAs($shop)->get('/shop/board')->assertOk();
    }

    public function test_admin_can_also_reach_the_shop_board(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get('/shop/board')->assertOk();
    }

    public function test_driver_cannot_reach_the_shop_board(): void
    {
        $driver = User::factory()->driver()->create();

        $this->actingAs($driver)->get('/shop/board')->assertForbidden();
    }

    public function test_customer_cannot_reach_the_shop_board(): void
    {
        $customer = User::factory()->customer()->create();

        $this->actingAs($customer)->get('/shop/board')->assertForbidden();
    }

    public function test_guest_is_redirected_to_login_when_visiting_the_shop_board(): void
    {
        $this->get('/shop/board')->assertRedirect('/admin/login');
    }
}
