<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TimeSlotResource;
use App\Models\TimeSlot;
use Illuminate\Http\Request;

/**
 * REQ-CUST-07: browsable time slots with live remaining capacity. Public —
 * customers should see slot availability before committing to sign-up.
 */
class TimeSlotController extends Controller
{
    public function index(Request $request)
    {
        $data = $request->validate([
            'service_area_id' => ['nullable', 'integer'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $query = TimeSlot::query()
            ->with('serviceArea')
            // Count bookings across ALL customers, not just the caller's own
            // orders — Order carries a per-customer isolation scope that
            // would otherwise under-count capacity for an authenticated customer.
            ->withCount(['orders as booked_count' => function ($query) {
                $query->withoutGlobalScopes()->whereNotIn('status', ['cancelled']);
            }])
            ->where('date', '>=', $data['from'] ?? now()->toDateString());

        if (isset($data['to'])) {
            $query->where('date', '<=', $data['to']);
        }

        if (isset($data['service_area_id'])) {
            $query->where('service_area_id', $data['service_area_id']);
        }

        $slots = $query->orderBy('date')->orderBy('window')->get();

        return TimeSlotResource::collection($slots);
    }
}
