<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * REQ-CUST-02 / NFR-03: thrown whenever a booking attempt (address
 * creation or order placement) falls outside every active service area.
 * The attempt has already been captured as a Lead by the time this is
 * thrown — see ServiceAreaGate.
 */
class OutOfServiceAreaException extends Exception
{
    public const MESSAGE = "We are not in your area yet — we've noted your interest and will let you know when we launch there.";

    public function __construct()
    {
        parent::__construct(self::MESSAGE);
    }

    public function render(Request $request): JsonResponse
    {
        return response()->json([
            'message' => self::MESSAGE,
            'blocked' => true,
        ], 422);
    }
}
