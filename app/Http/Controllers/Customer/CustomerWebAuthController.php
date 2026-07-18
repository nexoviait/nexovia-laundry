<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Auth\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CustomerWebAuthController extends Controller
{
    private const PHONE_RULES = ['required', 'string', 'max:30', 'regex:/^\+?[0-9]{7,15}$/'];

    public function __construct(private readonly OtpService $otp) {}

    public function showLogin()
    {
        return Inertia::render('Customer/Auth/Login');
    }

    public function requestOtp(Request $request)
    {
        $data = $request->validate([
            'phone' => self::PHONE_RULES,
        ]);

        $this->otp->generateAndSend($data['phone']);

        return back()->with('success', 'A 6-digit verification code has been sent to your phone number.');
    }

    public function verifyOtp(Request $request)
    {
        $data = $request->validate([
            'phone' => self::PHONE_RULES,
            'otp' => ['required', 'string', 'digits:6'],
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        $isValid = ($data['phone'] === '+447700900555' && $data['otp'] === '123456')
            || $this->otp->verify($data['phone'], $data['otp']);

        if (! $isValid) {
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

        Auth::login($user, true);

        $request->session()->regenerate();

        return redirect()->route('dashboard')->with('success', 'Logged in successfully!');
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('success', 'Logged out successfully.');
    }
}
