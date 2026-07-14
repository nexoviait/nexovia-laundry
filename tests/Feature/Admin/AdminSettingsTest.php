<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** FR-SET-001/002/003: currency (GBP default), business profile, VAT, delivery charges. */
class AdminSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_update_currency_vat_and_business_profile(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->put('/admin/settings', [
            'currency' => 'gbp',
            'vat_rate' => 20,
            'delivery_fee' => 3.5,
            'business_name' => 'Clean Quick Laundry',
            'business_phone' => '+441211234567',
            'business_email' => 'hello@cleanquicklaundry.com',
            'business_address' => '1 High Street, Birmingham',
            'opening_hours' => 'Mon-Sat 08:00-18:00',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('settings', ['key' => 'currency', 'value' => 'GBP']);
        $this->assertDatabaseHas('settings', ['key' => 'vat_rate', 'value' => '20']);
        $this->assertDatabaseHas('settings', ['key' => 'delivery_fee', 'value' => '3.5']);
        $this->assertDatabaseHas('settings', ['key' => 'business_name', 'value' => 'Clean Quick Laundry']);
    }

    public function test_settings_page_defaults_currency_to_gbp_when_unset(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get('/admin/settings')
            ->assertInertia(fn ($page) => $page->where('settings.currency', 'GBP'));
    }
}
