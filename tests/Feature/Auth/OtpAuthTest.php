<?php

namespace Tests\Feature\Auth;

use App\Models\OtpCode;
use App\Models\User;
use App\Services\Sms\SmsGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Doubles\FakeSmsGateway;
use Tests\TestCase;

class OtpAuthTest extends TestCase
{
    use RefreshDatabase;

    private FakeSmsGateway $gateway;

    protected function setUp(): void
    {
        parent::setUp();

        $this->gateway = new FakeSmsGateway;
        $this->app->instance(SmsGateway::class, $this->gateway);
    }

    public function test_requesting_an_otp_sends_a_code_via_the_sms_gateway(): void
    {
        $response = $this->postJson('/api/v1/auth/otp/request', ['phone' => '+447700900001']);

        $response->assertOk();
        $this->assertCount(1, $this->gateway->sent);
        $this->assertNotNull($this->gateway->lastCodeFor('+447700900001'));
        $this->assertDatabaseCount('otp_codes', 1);
    }

    public function test_verifying_a_correct_otp_creates_a_new_customer_and_returns_a_token(): void
    {
        $phone = '+447700900002';
        $this->postJson('/api/v1/auth/otp/request', ['phone' => $phone])->assertOk();
        $code = $this->gateway->lastCodeFor($phone);

        $response = $this->postJson('/api/v1/auth/otp/verify', [
            'phone' => $phone,
            'otp' => $code,
            'name' => 'Ada Customer',
        ]);

        $response->assertOk()
            ->assertJsonPath('user.phone', $phone)
            ->assertJsonStructure(['user', 'token']);

        $this->assertDatabaseHas('users', ['phone' => $phone, 'role' => 'customer', 'name' => 'Ada Customer']);
    }

    public function test_verifying_logs_in_an_existing_customer_instead_of_duplicating_them(): void
    {
        $existing = User::factory()->customer()->create(['phone' => '+447700900003']);

        $this->postJson('/api/v1/auth/otp/request', ['phone' => $existing->phone])->assertOk();
        $code = $this->gateway->lastCodeFor($existing->phone);

        $this->postJson('/api/v1/auth/otp/verify', [
            'phone' => $existing->phone,
            'otp' => $code,
        ])->assertOk();

        $this->assertSame(1, User::where('phone', $existing->phone)->count());
    }

    public function test_verifying_with_a_wrong_code_is_rejected(): void
    {
        $phone = '+447700900004';
        $this->postJson('/api/v1/auth/otp/request', ['phone' => $phone])->assertOk();

        $response = $this->postJson('/api/v1/auth/otp/verify', [
            'phone' => $phone,
            'otp' => '000000',
        ]);

        $response->assertUnprocessable();
        $this->assertDatabaseMissing('users', ['phone' => $phone]);
    }

    public function test_an_otp_cannot_be_reused_after_a_successful_verification(): void
    {
        $phone = '+447700900005';
        $this->postJson('/api/v1/auth/otp/request', ['phone' => $phone])->assertOk();
        $code = $this->gateway->lastCodeFor($phone);

        $this->postJson('/api/v1/auth/otp/verify', ['phone' => $phone, 'otp' => $code])->assertOk();

        $second = $this->postJson('/api/v1/auth/otp/verify', ['phone' => $phone, 'otp' => $code]);

        $second->assertUnprocessable();
    }

    public function test_an_expired_otp_is_rejected(): void
    {
        $phone = '+447700900006';

        OtpCode::factory()->expired()->create([
            'phone' => $phone,
            'code' => bcrypt('123456'),
        ]);

        $response = $this->postJson('/api/v1/auth/otp/verify', [
            'phone' => $phone,
            'otp' => '123456',
        ]);

        $response->assertUnprocessable();
    }

    public function test_requesting_a_new_otp_invalidates_the_previous_outstanding_code(): void
    {
        $phone = '+447700900007';

        $this->postJson('/api/v1/auth/otp/request', ['phone' => $phone])->assertOk();
        $firstCode = $this->gateway->lastCodeFor($phone);

        $this->postJson('/api/v1/auth/otp/request', ['phone' => $phone])->assertOk();

        $response = $this->postJson('/api/v1/auth/otp/verify', [
            'phone' => $phone,
            'otp' => $firstCode,
        ]);

        $response->assertUnprocessable();
    }

    public function test_otp_requests_for_the_same_phone_are_rate_limited(): void
    {
        $phone = '+447700900008';

        for ($i = 0; $i < 3; $i++) {
            $this->postJson('/api/v1/auth/otp/request', ['phone' => $phone])->assertOk();
        }

        $this->postJson('/api/v1/auth/otp/request', ['phone' => $phone])
            ->assertStatus(429);
    }

    public function test_otp_verify_attempts_are_rate_limited(): void
    {
        $phone = '+447700900009';
        $this->postJson('/api/v1/auth/otp/request', ['phone' => $phone])->assertOk();

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/otp/verify', ['phone' => $phone, 'otp' => '000000']);
        }

        $this->postJson('/api/v1/auth/otp/verify', ['phone' => $phone, 'otp' => '000000'])
            ->assertStatus(429);
    }
}
