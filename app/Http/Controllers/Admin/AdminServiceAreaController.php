<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceArea;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** FR-ADM-007: manage service areas and toggle active/inactive. */
class AdminServiceAreaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('ServiceAreas/Index', [
            'serviceAreas' => ServiceArea::query()->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'postcode' => ['required', 'string', 'max:10'],
            'active' => ['boolean'],
        ]);

        ServiceArea::create($data);

        return back()->with('success', 'Service area created.');
    }

    public function update(Request $request, ServiceArea $serviceArea)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'postcode' => ['sometimes', 'string', 'max:10'],
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
}
