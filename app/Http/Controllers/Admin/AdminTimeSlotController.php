<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceArea;
use App\Models\TimeSlot;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** FR-ADM-006: manage time slots (date, window, capacity) per service area. */
class AdminTimeSlotController extends Controller
{
    public function index(Request $request): Response
    {
        $data = $request->validate(['service_area_id' => ['nullable', 'integer']]);

        $query = TimeSlot::query()->with('serviceArea')
            ->where('date', '>=', now()->subDays(1)->toDateString());

        if (! empty($data['service_area_id'])) {
            $query->where('service_area_id', $data['service_area_id']);
        }

        return Inertia::render('TimeSlots/Index', [
            'timeSlots' => $query->orderBy('date')->orderBy('window')->paginate(50)->withQueryString(),
            'serviceAreas' => ServiceArea::query()->orderBy('name')->get(['id', 'name', 'active']),
            'filters' => $data,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'service_area_id' => ['required', 'integer', 'exists:service_areas,id'],
            'date' => ['required', 'date'],
            'window' => ['required', 'string', 'max:50'],
            'capacity' => ['required', 'integer', 'min:0'],
        ]);

        TimeSlot::create($data);

        return back()->with('success', 'Time slot created.');
    }

    public function update(Request $request, TimeSlot $timeSlot)
    {
        $data = $request->validate([
            'window' => ['sometimes', 'string', 'max:50'],
            'capacity' => ['sometimes', 'integer', 'min:0'],
        ]);

        $timeSlot->update($data);

        return back()->with('success', 'Time slot updated.');
    }

    public function destroy(TimeSlot $timeSlot)
    {
        $timeSlot->delete();

        return back()->with('success', 'Time slot removed.');
    }
}
