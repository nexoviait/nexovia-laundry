<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Inertia\Inertia;
use Inertia\Response;

/** FR-OPS-001 to 005: the shop-floor board. */
class ShopBoardController extends Controller
{
    public function index(): Response
    {
        $base = Order::query()->withoutGlobalScopes()
            ->with(['user', 'address.serviceArea', 'items.service', 'items.garmentTags']);

        return Inertia::render('Shop/Board', [
            'toReceive' => OrderResource::collection(
                (clone $base)->where('status', 'picked_up')->latest()->get()
            ),
            'onFloor' => OrderResource::collection(
                (clone $base)->whereIn('status', ['processing', 'on_hold'])->latest()->get()
            ),
        ]);
    }
}
