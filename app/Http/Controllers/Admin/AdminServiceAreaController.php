<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceArea;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** FR-ADM-007: manage service areas and toggle active/inactive. */
class AdminServiceAreaController extends Controller
{
    public function index(): Response
    {
        $zoneNamesRaw = Setting::query()->where('key', 'available_zone_names')->value('value')
            ?? 'Dhaka, Chittagong, Motijheel, Lozells, Handsworth, Newtown, Sylhet, Mirpur, Banani, Gulshan';
        $countriesRaw = Setting::query()->where('key', 'available_countries')->value('value')
            ?? 'Bangladesh, United Kingdom, United States, United Arab Emirates, Saudi Arabia, Canada';

        $availableZoneNames = array_values(array_unique(array_filter(array_map('trim', explode(',', $zoneNamesRaw)))));
        $availableCountries = array_values(array_unique(array_filter(array_map('trim', explode(',', $countriesRaw)))));

        return Inertia::render('Admin/ServiceAreas/Index', [
            'serviceAreas'       => ServiceArea::query()->orderBy('name')->get(),
            'availableZoneNames' => $availableZoneNames,
            'availableCountries' => $availableCountries,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'postcode' => ['required', 'string', 'max:10'],
            'delivery_charge' => ['nullable', 'numeric', 'min:0'],
            'active' => ['boolean'],
        ]);

        ServiceArea::create($data);

        return back()->with('success', 'Service area created.');
    }

    public function update(Request $request, ServiceArea $serviceArea)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'country' => ['sometimes', 'string', 'max:255'],
            'postcode' => ['sometimes', 'string', 'max:10'],
            'delivery_charge' => ['nullable', 'numeric', 'min:0'],
            'active' => ['sometimes', 'boolean'],
        ]);

        $serviceArea->update($data);

        return back()->with('success', 'Service area updated.');
    }

    public function toggle(ServiceArea $serviceArea)
    {
        $serviceArea->update(['active' => ! $serviceArea->active]);

        return back()->with('success', $serviceArea->active ? 'Service area activated.' : 'Service area deactivated.');
    }

    public function destroy(ServiceArea $serviceArea)
    {
        $serviceArea->delete();

        return back()->with('success', 'Service area deleted.');
    }
}
