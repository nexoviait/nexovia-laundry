<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * FR-ADM-001: admin/staff panel login, admin-created credentials only
 * (mirrors the API's staff login rules — no customer accounts here).
 * Shared by admin and shop-floor staff (FR-OPS-001 to 005); drivers use
 * their own app, not this web panel.
 */
class AdminAuthController extends Controller
{
    private const ALLOWED_ROLES = ['super_admin', 'admin', 'shop'];

    public function create(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])
            ->whereIn('role', self::ALLOWED_ROLES)
            ->first();

        if (! $user || ! $user->password || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect()->route($user->role === 'shop' ? 'shop.board' : 'admin.orders.index');
    }

    public function destroy(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }
}
