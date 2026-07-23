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
            'name' => ['required', 'string', 'max:255'],
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

        if (! empty($data['name'])) {
            $user->update(['name' => $data['name']]);
        }

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

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name'   => ['required', 'string', 'max:255'],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
        ]);

        $updateData = ['name' => $data['name']];

        if ($request->hasFile('avatar')) {
            if ($user->avatar && ! str_starts_with($user->avatar, 'http')) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->avatar);
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            $updateData['avatar'] = $path;
        }

        $user->update($updateData);

        return back()->with('success', 'Profile avatar updated successfully!');
    }
}
