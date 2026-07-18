<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DriverTaskController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OtpAuthController;
use App\Http\Controllers\Api\PricingController;
use App\Http\Controllers\Api\PublicContentController;
use App\Http\Controllers\Api\PublicSettingController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\TimeSlotController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public auth
    // FR-CUS-001: customer registration/login by phone OTP.
    Route::post('/auth/otp/request', [OtpAuthController::class, 'request'])
        ->middleware('throttle:otp-request');
    Route::post('/auth/otp/verify', [OtpAuthController::class, 'verify'])
        ->middleware('throttle:otp-verify');

    // FR-RID-001: staff (admin/driver/shop) login with admin-created credentials.
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/me/push-token', [AuthController::class, 'registerPushToken']);

        // Admin-only config management (build order step 2)
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            // service-areas, time-slots, services, settings, banners, cms-pages
        });

        // Customer booking (build order step 3)
        Route::middleware('role:customer,business_client')->group(function () {
            // REQ-CUST-03: saved addresses, area-gated (REQ-CUST-02).
            Route::apiResource('addresses', AddressController::class);

            // REQ-CUST-08: live price estimate while building a basket.
            Route::post('/pricing/estimate', [PricingController::class, 'estimate']);

            // REQ-CUST-01/04/09/10/12/14: booking, history, cancellation, invoice.
            Route::get('/orders', [OrderController::class, 'index']);
            Route::post('/orders', [OrderController::class, 'store']);
            Route::get('/orders/{order}', [OrderController::class, 'show']);
            Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);
            Route::get('/orders/{order}/invoice', [OrderController::class, 'invoice']);
            // REQ-CUST-11: star rating after delivery.
            Route::post('/orders/{order}/rating', [OrderController::class, 'rate']);
        });

        // Order lifecycle — shared by customer (read), admin (transition) (build order step 4)

        // FR-RID-002 to 008: driver app task list, pickup, delivery, failure reporting.
        Route::middleware('role:driver')->prefix('driver')->group(function () {
            Route::get('/tasks', [DriverTaskController::class, 'index']);
            Route::get('/tasks/{driverTask}', [DriverTaskController::class, 'show']);
            Route::post('/tasks/{driverTask}/pickup', [DriverTaskController::class, 'pickup']);
            Route::post('/tasks/{driverTask}/start-delivery', [DriverTaskController::class, 'startDelivery']);
            Route::post('/tasks/{driverTask}/deliver', [DriverTaskController::class, 'deliver']);
            Route::post('/tasks/{driverTask}/fail', [DriverTaskController::class, 'fail']);
        });

        // Shop panel endpoints (build order step 6)
        Route::middleware('role:shop')->prefix('shop')->group(function () {
            // garment tag scan/stage update, issue flag
        });
    });

    // Public catalogue reads — no auth required for browsing before booking.
    // REQ-CUST-04/05: services and per-piece prices.
    Route::get('/services', [ServiceController::class, 'index']);
    // REQ-CUST-07: bookable time slots with live capacity.
    Route::get('/time-slots', [TimeSlotController::class, 'index']);
    // FR-CUS-027: currency + basic business info for the customer app.
    Route::get('/settings/public', [PublicSettingController::class, 'show']);
    // REQ-ADM-08: active banners and CMS pages for the customer app.
    Route::get('/banners', [PublicContentController::class, 'banners']);
    Route::get('/cms-pages/{slug}', [PublicContentController::class, 'cmsPage']);
});
