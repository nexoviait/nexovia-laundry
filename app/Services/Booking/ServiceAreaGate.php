<?php

namespace App\Services\Booking;

use App\Exceptions\OutOfServiceAreaException;
use App\Models\Address;
use App\Models\Lead;
use App\Models\ServiceArea;
use App\Models\User;

/**
 * REQ-CUST-02 / NFR-03: bookings are only allowed inside an active service
 * area; everything else is captured as a Lead and blocked with a single,
 * consistent message (see OutOfServiceAreaException).
 */
class ServiceAreaGate
{
    /**
     * Resolve the active ServiceArea a postcode falls inside, if any.
     * Areas are stored as outward-code prefixes (e.g. "B19"); a customer
     * postcode matches if it starts with an active area's postcode.
     */
    public function resolveActiveArea(string $postcode): ?ServiceArea
    {
        $normalized = $this->normalize($postcode);

        return ServiceArea::query()
            ->where('active', true)
            ->get()
            ->first(fn (ServiceArea $area) => str_starts_with($normalized, $this->normalize($area->postcode)));
    }

    /**
     * Resolve the area for a postcode, or capture a Lead and throw the
     * standard "not in your area yet" block.
     *
     * @throws OutOfServiceAreaException
     */
    public function resolveOrBlock(string $postcode, ?User $user, ?string $note = null): ServiceArea
    {
        $area = $this->resolveActiveArea($postcode);

        if ($area === null) {
            $this->captureLead($postcode, $user, $note);

            throw new OutOfServiceAreaException;
        }

        return $area;
    }

    /**
     * Re-validate that an existing address still falls inside an active
     * area (an area may have been switched off since the address was
     * saved), or capture a Lead and throw the standard block.
     *
     * @throws OutOfServiceAreaException
     */
    public function assertAddressInActiveArea(Address $address, ?User $user, ?string $note = null): void
    {
        if ($address->serviceArea && $address->serviceArea->active) {
            return;
        }

        $this->captureLead($address->postcode, $user, $note);

        throw new OutOfServiceAreaException;
    }

    public function captureLead(string $postcode, ?User $user, ?string $note = null): Lead
    {
        return Lead::create([
            'user_id' => $user?->id,
            'phone' => $user?->phone,
            'postcode' => $postcode,
            'note' => $note,
        ]);
    }

    private function normalize(string $postcode): string
    {
        return strtoupper(str_replace(' ', '', $postcode));
    }
}
