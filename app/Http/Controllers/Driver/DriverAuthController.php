<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class DriverAuthController extends Controller
{
    /** Show the driver login form. */
    public function create(): Response
    {
        return Inertia::render('Driver/Login');
    }

    /** Authenticate the driver. */
    public function store(Request $request)
    {
        $data = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt(['email' => $data['email'], 'password' => $data['password']], true)) {
            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our records.',
            ]);
        }

        $user = Auth::user();

        if ($user->role !== 'driver') {
            Auth::logout();
            throw ValidationException::withMessages([
                'email' => 'This portal is for drivers only.',
            ]);
        }

        $request->session()->regenerate();

        return redirect()->route('driver.dashboard');
    }

    /** Log the driver out. */
    public function destroy(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('driver.login');
    }
}
