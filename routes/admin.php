<?php

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminBannerController;
use App\Http\Controllers\Admin\AdminCmsPageController;
use App\Http\Controllers\Admin\AdminCustomerController;
use App\Http\Controllers\Admin\AdminLeadController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminReportController;
use App\Http\Controllers\Admin\AdminServiceAreaController;
use App\Http\Controllers\Admin\AdminServiceController;
use App\Http\Controllers\Admin\AdminSettingController;
use App\Http\Controllers\Admin\AdminTimeSlotController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->group(function () {
    // FR-ADM-001: admin login (guest only).
    Route::middleware('guest')->group(function () {
        Route::get('/login', [AdminAuthController::class, 'create'])->name('login');
        Route::post('/login', [AdminAuthController::class, 'store'])->name('login.store');
    });

    // Shared by any staff role signed into this web app (admin or shop).
    Route::match(['get', 'post'], '/logout', [AdminAuthController::class, 'destroy'])->name('logout');

    Route::middleware(['auth', 'role:admin'])->group(function () {
        Route::get('/dashboard', fn () => redirect()->route('admin.orders.index'))->name('dashboard');
        // FR-ADM-002/019: order board with live alert queue.
        Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders.index');
        Route::get('/live-map-data', [AdminOrderController::class, 'liveMapData'])->name('orders.live-map-data');
        // FR-ADM-003: manual order entry.
        Route::get('/orders/new', [AdminOrderController::class, 'create'])->name('orders.create');
        Route::post('/orders', [AdminOrderController::class, 'storeManual'])->name('orders.store');
        Route::get('/orders/{order}', [AdminOrderController::class, 'show'])->name('orders.show');
        // FR-ADM-004/021: confirm + set/change pickup time + assign driver.
        Route::post('/orders/{order}/confirm', [AdminOrderController::class, 'confirm'])->name('orders.confirm');
        Route::post('/orders/{order}/time-slot', [AdminOrderController::class, 'updateTimeSlot'])->name('orders.time-slot');
        Route::post('/orders/{order}/assign-driver', [AdminOrderController::class, 'assignDriver'])->name('orders.assign-driver');
        // FR-ADM-022: internal + customer-visible notes.
        Route::post('/orders/{order}/notes', [AdminOrderController::class, 'addNote'])->name('orders.notes.store');
        // FR-ADM-010: cancellations/adjustments with reasons.
        Route::post('/orders/{order}/cancel', [AdminOrderController::class, 'cancel'])->name('orders.cancel');
        Route::post('/orders/{order}/adjust', [AdminOrderController::class, 'adjust'])->name('orders.adjust');
        Route::post('/orders/{order}/transition', [AdminOrderController::class, 'transitionStatus'])->name('orders.transition');

        // FR-ADM-005: dynamic item/price management.
        Route::get('/services', [AdminServiceController::class, 'index'])->name('services.index');
        Route::post('/services', [AdminServiceController::class, 'store'])->name('services.store');
        Route::put('/services/{service}', [AdminServiceController::class, 'update'])->name('services.update');
        Route::delete('/services/{service}', [AdminServiceController::class, 'destroy'])->name('services.destroy');

        // FR-ADM-006: time slots.
        Route::get('/time-slots', [AdminTimeSlotController::class, 'index'])->name('time-slots.index');
        Route::post('/time-slots', [AdminTimeSlotController::class, 'store'])->name('time-slots.store');
        Route::put('/time-slots/{timeSlot}', [AdminTimeSlotController::class, 'update'])->name('time-slots.update');
        Route::delete('/time-slots/{timeSlot}', [AdminTimeSlotController::class, 'destroy'])->name('time-slots.destroy');

        // FR-ADM-007: service areas + activate/deactivate.
        Route::get('/service-areas', [AdminServiceAreaController::class, 'index'])->name('service-areas.index');
        Route::post('/service-areas', [AdminServiceAreaController::class, 'store'])->name('service-areas.store');
        Route::put('/service-areas/{serviceArea}', [AdminServiceAreaController::class, 'update'])->name('service-areas.update');
        Route::post('/service-areas/{serviceArea}/toggle', [AdminServiceAreaController::class, 'toggle'])->name('service-areas.toggle');
        Route::delete('/service-areas/{serviceArea}', [AdminServiceAreaController::class, 'destroy'])->name('service-areas.destroy');

        // FR-ADM-008: customer list and user management.
        Route::get('/customers', [AdminCustomerController::class, 'index'])->name('customers.index');
        Route::post('/customers', [AdminCustomerController::class, 'store'])->name('customers.store');
        Route::get('/customers/{customer}', [AdminCustomerController::class, 'show'])->name('customers.show');
        Route::put('/customers/{user}', [AdminCustomerController::class, 'update'])->name('customers.update');
        Route::delete('/customers/{user}', [AdminCustomerController::class, 'destroy'])->name('customers.destroy');

        // FR-ADM-009: master reporting desk + daily + revenue + undelivered audit.
        Route::get('/reports', [AdminReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/daily', [AdminReportController::class, 'daily'])->name('reports.daily');
        Route::get('/reports/daily/export', [AdminReportController::class, 'exportCsv'])->name('reports.daily.export');
        Route::get('/reports/revenue', [AdminReportController::class, 'revenue'])->name('reports.revenue');

        // FR-SET-001/002/003: currency, business profile, VAT, delivery charges.
        Route::get('/settings', [AdminSettingController::class, 'edit'])->name('settings.edit');
        Route::put('/settings', [AdminSettingController::class, 'update'])->name('settings.update');

        // REQ-ADM-08: banners and CMS pages.
        Route::get('/banners', [AdminBannerController::class, 'index'])->name('banners.index');
        Route::post('/banners', [AdminBannerController::class, 'store'])->name('banners.store');
        Route::put('/banners/{banner}', [AdminBannerController::class, 'update'])->name('banners.update');
        Route::delete('/banners/{banner}', [AdminBannerController::class, 'destroy'])->name('banners.destroy');

        Route::get('/cms-pages', [AdminCmsPageController::class, 'index'])->name('cms-pages.index');
        Route::post('/cms-pages', [AdminCmsPageController::class, 'store'])->name('cms-pages.store');
        Route::put('/cms-pages/{cmsPage}', [AdminCmsPageController::class, 'update'])->name('cms-pages.update');
        Route::delete('/cms-pages/{cmsPage}', [AdminCmsPageController::class, 'destroy'])->name('cms-pages.destroy');

        // REQ-ADM-10: view captured leads (out-of-area booking attempts).
        Route::get('/leads', [AdminLeadController::class, 'index'])->name('leads.index');

        // Customer Complaints & Issue Desk
        Route::get('/complaints', [\App\Http\Controllers\Admin\AdminComplaintController::class, 'index'])->name('complaints.index');
        Route::put('/complaints/{complaint}', [\App\Http\Controllers\Admin\AdminComplaintController::class, 'update'])->name('complaints.update');
    });
});
