<?php

namespace App\Providers;

use App\Services\Push\LogPushGateway;
use App\Services\Push\PushGateway;
use App\Services\Sms\LogSmsGateway;
use App\Services\Sms\SmsGateway;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(SmsGateway::class, function () {
            return match (config('services.sms.driver')) {
                // Add real providers here (e.g. 'twilio' => new TwilioSmsGateway(...)).
                default => new LogSmsGateway,
            };
        });

        $this->app->bind(PushGateway::class, function () {
            return match (config('services.push.driver')) {
                // Add real providers here (e.g. 'fcm' => new FcmPushGateway(...)).
                default => new LogPushGateway,
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // NFR-005: rate-limit OTP requests to stop SMS abuse/enumeration.
        RateLimiter::for('otp-request', function (Request $request) {
            return [
                Limit::perMinute(3)->by('otp-request-phone:'.$request->input('phone')),
                Limit::perMinute(10)->by('otp-request-ip:'.$request->ip()),
            ];
        });

        RateLimiter::for('otp-verify', function (Request $request) {
            return Limit::perMinute(5)->by('otp-verify-phone:'.$request->input('phone'));
        });
    }
}
