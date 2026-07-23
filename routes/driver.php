<?php

use App\Http\Controllers\Driver\DriverAuthController;
use App\Http\Controllers\Driver\DriverWebController;
use Illuminate\Support\Facades\Route;

// Guest-only login routes
Route::middleware('guest')->prefix('driver')->name('driver.')->group(function () {
    Route::get('/login', [DriverAuthController::class, 'create'])->name('login');
    Route::post('/login', [DriverAuthController::class, 'store'])->name('login.store');
});

Route::match(['get', 'post'], '/driver/logout', [DriverAuthController::class, 'destroy'])->name('driver.logout');

// Authenticated driver routes
Route::middleware(['auth', 'role:driver'])->prefix('driver')->name('driver.')->group(function () {

    Route::get('/dashboard', [DriverWebController::class, 'dashboard'])->name('dashboard');
    Route::get('/live-queue', [DriverWebController::class, 'liveQueue'])->name('live-queue');
    Route::get('/otp-handover', [DriverWebController::class, 'otpHandover'])->name('otp-handover');
    Route::get('/support', [DriverWebController::class, 'support'])->name('support');
    Route::get('/settings', [DriverWebController::class, 'settings'])->name('settings');
    Route::put('/settings', [DriverWebController::class, 'updateSettings'])->name('settings.update');
    Route::post('/toggle-status', [DriverWebController::class, 'toggleStatus'])->name('toggle-status');
    Route::get('/history', [DriverWebController::class, 'history'])->name('history');
    Route::get('/tasks/{driverTask}', [DriverWebController::class, 'showTask'])->name('tasks.show');
    Route::post('/tasks/{driverTask}/pickup', [DriverWebController::class, 'pickup'])->name('tasks.pickup');
    Route::post('/tasks/{driverTask}/start-delivery', [DriverWebController::class, 'startDelivery'])->name('tasks.start-delivery');
    Route::post('/tasks/{driverTask}/deliver', [DriverWebController::class, 'deliver'])->name('tasks.deliver');
    Route::post('/tasks/{driverTask}/fail', [DriverWebController::class, 'fail'])->name('tasks.fail');
});
