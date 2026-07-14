<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use App\Services\Booking\ServiceAreaGate;
use Illuminate\Http\Request;

/**
 * REQ-CUST-03 / REQ-CUST-02: customers manage saved addresses; every
 * address must resolve to an active service area or the attempt is
 * blocked and captured as a lead instead of being saved.
 */
class AddressController extends Controller
{
    public function __construct(private readonly ServiceAreaGate $areaGate) {}

    public function index(Request $request)
    {
        return AddressResource::collection(
            $request->user()->addresses()->with('serviceArea')->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'label' => ['required', 'string', 'max:255'],
            'postcode' => ['required', 'string', 'max:10'],
            'map_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'map_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'directions' => ['nullable', 'string'],
        ]);

        $user = $request->user();

        $area = $this->areaGate->resolveOrBlock($data['postcode'], $user, 'Blocked while adding an address');

        $address = Address::create([
            'user_id' => $user->id,
            'service_area_id' => $area->id,
            'label' => $data['label'],
            'postcode' => $data['postcode'],
            'map_lat' => $data['map_lat'] ?? null,
            'map_lng' => $data['map_lng'] ?? null,
            'directions' => $data['directions'] ?? null,
        ]);

        return new AddressResource($address->load('serviceArea'));
    }

    public function show(Address $address)
    {
        $this->authorize('view', $address);

        return new AddressResource($address->load('serviceArea'));
    }

    public function update(Request $request, Address $address)
    {
        $this->authorize('update', $address);

        $data = $request->validate([
            'label' => ['sometimes', 'string', 'max:255'],
            'postcode' => ['sometimes', 'string', 'max:10'],
            'map_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'map_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'directions' => ['nullable', 'string'],
        ]);

        if (isset($data['postcode']) && $data['postcode'] !== $address->postcode) {
            $area = $this->areaGate->resolveOrBlock($data['postcode'], $request->user(), 'Blocked while updating an address');
            $data['service_area_id'] = $area->id;
        }

        $address->update($data);

        return new AddressResource($address->load('serviceArea'));
    }

    public function destroy(Address $address)
    {
        $this->authorize('delete', $address);

        $address->delete();

        return response()->json(['message' => 'Address deleted.']);
    }
}
