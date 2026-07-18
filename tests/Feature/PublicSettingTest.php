<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** FR-CUS-027: currency + basic business info exposed publicly for the customer app. */
class PublicSettingTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_settings_are_readable_without_authentication(): void
    {
        Setting::create(['key' => 'currency', 'value' => 'GBP']);
        Setting::create(['key' => 'business_name', 'value' => 'Clean Quick Laundry']);
        Setting::create(['key' => 'vat_rate', 'value' => '20']); // must not leak

        $response = $this->getJson('/api/v1/settings/public');

        $response->assertOk()
            ->assertJson(['currency' => 'GBP', 'business_name' => 'Clean Quick Laundry'])
            ->assertJsonMissing(['vat_rate' => '20']);
    }

    public function test_currency_defaults_to_gbp_when_unset(): void
    {
        $this->getJson('/api/v1/settings/public')->assertJson(['currency' => 'GBP']);
    }

    public function test_push_token_can_be_registered_by_an_authenticated_user(): void
    {
        $customer = User::factory()->customer()->create();

        $response = $this->actingAs($customer)->postJson('/api/v1/me/push-token', [
            'push_token' => 'ExponentPushToken[abc123]',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('users', ['id' => $customer->id, 'push_token' => 'ExponentPushToken[abc123]']);
    }

    public function test_push_token_registration_requires_authentication(): void
    {
        $this->postJson('/api/v1/me/push-token', ['push_token' => 'x'])->assertUnauthorized();
    }
}
