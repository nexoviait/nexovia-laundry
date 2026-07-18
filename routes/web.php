<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

Route::get('/', function (Request $request) {
    if (! Auth::check()) {
        return redirect()->route('login');
    }

    $user = $request->user();
    if ($user->role === 'admin') {
        return redirect()->route('admin.orders.index');
    }
    if ($user->role === 'shop') {
        return redirect()->route('shop.board');
    }
    if ($user->role === 'driver') {
        return redirect()->route('driver.dashboard');
    }
    return redirect()->route('dashboard');
})->name('home');

require __DIR__.'/customer.php';
require __DIR__.'/admin.php';
require __DIR__.'/shop.php';
require __DIR__.'/driver.php';
