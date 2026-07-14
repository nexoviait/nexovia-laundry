<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\Auth\OtpService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * FR-CUS-001: customer registration/login by phone number with SMS OTP.
 * Verifying a code logs the customer in, creating the account on first use
 * — there is no separate password-based registration step for customers.
 */
class OtpAuthController extends Controller
{
    private const PHONE_RULES = ['required', 'string', 'max:30', 'regex:/^\+?[0-9]{7,15}$/'];

    public function __construct(private readonly OtpService $otp) {}

    public function request(Request $request)
    {
        $data = $request->validate([
            'phone' => self::PHONE_RULES,
        ]);

        $this->otp->generateAndSend($data['phone']);

        return response()->json([
            'message' => 'OTP sent.',
        ]);
    }

    public function verify(Request $request)
    {
        $data = $request->validate([
            'phone' => self::PHONE_RULES,
            'otp' => ['required', 'string', 'digits:6'],
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        if (! $this->otp->verify($data['phone'], $data['otp'])) {
            throw ValidationException::withMessages([
                'otp' => ['The code is invalid or has expired.'],
            ]);
        }

        $user = User::firstOrCreate(
            ['phone' => $data['phone']],
            [
                'name' => $data['name'] ?? 'Customer',
                'role' => 'customer',
                'password' => null,
            ]
        );

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }
}
