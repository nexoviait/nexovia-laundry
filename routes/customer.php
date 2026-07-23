<?php

use App\Http\Controllers\Customer\CustomerWebAddressController;
use App\Http\Controllers\Customer\CustomerWebAuthController;
use App\Http\Controllers\Customer\CustomerWebBookingController;
use App\Http\Controllers\Customer\CustomerWebOrderController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/login', [CustomerWebAuthController::class, 'showLogin'])->name('login');
    Route::post('/login/request', [CustomerWebAuthController::class, 'requestOtp'])->name('login.request');
    Route::post('/login/verify', [CustomerWebAuthController::class, 'verifyOtp'])->name('login.verify');
});

Route::match(['get', 'post'], '/logout', [CustomerWebAuthController::class, 'logout'])->name('logout');

Route::middleware(['auth', 'role:customer,business_client'])->group(function () {

    Route::get('/dashboard', [CustomerWebOrderController::class, 'index'])->name('dashboard');
    Route::post('/profile', [CustomerWebAuthController::class, 'updateProfile'])->name('profile.update');
    Route::get('/orders/{order}', [CustomerWebOrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{order}/cancel', [CustomerWebOrderController::class, 'cancel'])->name('orders.cancel');
    Route::post('/orders/{order}/rate', [CustomerWebOrderController::class, 'rate'])->name('orders.rate');
    Route::post('/orders/{order}/complaint', [CustomerWebOrderController::class, 'complaint'])->name('orders.complaint');

    Route::get('/book', [CustomerWebBookingController::class, 'create'])->name('book.create');
    Route::post('/book', [CustomerWebBookingController::class, 'store'])->name('book.store');
    Route::post('/book/estimate', [CustomerWebBookingController::class, 'estimate'])->name('book.estimate');

    Route::get('/addresses', [CustomerWebAddressController::class, 'index'])->name('addresses.index');
    Route::post('/addresses', [CustomerWebAddressController::class, 'store'])->name('addresses.store');
    Route::delete('/addresses/{address}', [CustomerWebAddressController::class, 'destroy'])->name('addresses.destroy');
});
