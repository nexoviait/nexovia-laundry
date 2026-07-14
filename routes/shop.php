<?php

use App\Http\Controllers\Shop\ShopBoardController;
use App\Http\Controllers\Shop\ShopGarmentTagController;
use App\Http\Controllers\Shop\ShopOrderController;
use Illuminate\Support\Facades\Route;

// FR-OPS-001 to 005: facility (shop-floor) screens. Admins can also see
// this panel for oversight; drivers use their own app, not this one.
Route::prefix('shop')->name('shop.')->middleware(['auth', 'role:shop,admin'])->group(function () {
    Route::get('/board', [ShopBoardController::class, 'index'])->name('board');

    // FR-OPS-001: receive order with mismatch flagging.
    Route::post('/orders/{order}/receive', [ShopOrderController::class, 'receive'])->name('orders.receive');
    // FR-OPS-002: print a QR tag per order bag.
    Route::get('/orders/{order}/tags', [ShopOrderController::class, 'tags'])->name('orders.tags');
    // FR-OPS-005: final weight confirmation -> invoice -> ready.
    Route::post('/orders/{order}/finalize', [ShopOrderController::class, 'finalize'])->name('orders.finalize');

    // FR-OPS-003: one-click stage updates.
    Route::post('/garment-tags/{garmentTag}/stage', [ShopGarmentTagController::class, 'updateStage'])->name('garment-tags.stage');
    // FR-OPS-004: issue flagging with photos -> ON_HOLD.
    Route::post('/garment-tags/{garmentTag}/issue', [ShopGarmentTagController::class, 'flagIssue'])->name('garment-tags.issue');
    Route::post('/garment-tags/{garmentTag}/resolve', [ShopGarmentTagController::class, 'resolveIssue'])->name('garment-tags.resolve');
});
