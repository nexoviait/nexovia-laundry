<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** FR-ADM-005: dynamic item/price management. */
class AdminServiceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Services/Index', [
            'services' => Service::query()->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'unit' => ['required', 'string', 'in:item,kg'],
            'price' => ['required', 'numeric', 'min:0'],
            'tat' => ['nullable', 'string', 'max:50'],
            'active' => ['boolean'],
        ]);

        Service::create($data);

        return back()->with('success', 'Service created.');
    }

    public function update(Request $request, Service $service)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'unit' => ['sometimes', 'string', 'in:item,kg'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'tat' => ['nullable', 'string', 'max:50'],
            'active' => ['sometimes', 'boolean'],
        ]);

        $service->update($data);

        return back()->with('success', 'Service updated.');
    }

    public function destroy(Service $service)
    {
        $service->delete();

        return back()->with('success', 'Service removed.');
    }
}
