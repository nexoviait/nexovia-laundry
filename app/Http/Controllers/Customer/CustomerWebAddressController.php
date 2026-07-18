<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Services\Booking\ServiceAreaGate;
use App\Exceptions\OutOfServiceAreaException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CustomerWebAddressController extends Controller
{
    public function __construct(private readonly ServiceAreaGate $areaGate) {}

    public function index(Request $request)
    {
        return \Inertia\Inertia::render('Customer/Addresses/Index', [
            'addresses' => $request->user()->addresses()->with('serviceArea')->latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'label' => ['required', 'string', 'max:255'],
            'postcode' => ['required', 'string', 'max:10'],
            'directions' => ['nullable', 'string'],
        ]);

        $user = $request->user();

        try {
            $area = $this->areaGate->resolveOrBlock($data['postcode'], $user, 'Blocked while adding web address');
        } catch (OutOfServiceAreaException $e) {
            return back()->withErrors([
                'postcode' => $e->getMessage(),
            ]);
        }

        Address::create([
            'user_id' => $user->id,
            'service_area_id' => $area->id,
            'label' => $data['label'],
            'postcode' => $data['postcode'],
            'directions' => $data['directions'] ?? null,
        ]);

        return back()->with('success', 'Address saved successfully!');
    }

    public function destroy(Request $request, Address $address)
    {
        // Authorize deleting using policies
        if ($address->user_id !== $request->user()->id) {
            abort(403);
        }

        $address->delete();

        return back()->with('success', 'Address deleted.');
    }
}
