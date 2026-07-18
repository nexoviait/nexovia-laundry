<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** FR-ADM-008: view/manage customers. */
class AdminCustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'in:all,admin,staff,driver,customer'],
        ]);

        $query = User::query()
            ->with(['driver'])
            ->withCount(['orders as orders_count' => fn ($q) => $q->withoutGlobalScopes()]);

        // Filter by role if set and not 'all'
        if (! empty($data['role']) && $data['role'] !== 'all') {
            $query->where('role', $data['role']);
        }

        // Search name, email, phone
        if (! empty($data['search'])) {
            $search = $data['search'];
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"));
        }

        // Summary counts
        $totalUsers = User::count();
        $activeDrivers = User::where('role', 'driver')->count();
        $customerCount = User::where('role', 'customer')->count();
        $staffCount = User::where('role', 'staff')->count();

        $paginated = $query->latest()->paginate(25)->withQueryString();

        return Inertia::render('Admin/Customers/Index', [
            'customers' => $paginated,
            'users' => $paginated,
            'filters' => $data,
            'summary' => [
                'total_users' => $totalUsers,
                'active_drivers' => $activeDrivers,
                'customer_count' => $customerCount,
                'staff_count' => $staffCount,
            ]
        ]);
    }

    public function show(User $customer): Response
    {
        abort_unless(in_array($customer->role, ['customer', 'business_client']), 404);

        return Inertia::render('Admin/Customers/Show', [
            'customer' => $customer,
            'addresses' => $customer->addresses()->with('serviceArea')->get(),
            'orders' => $customer->orders()->withoutGlobalScopes()->latest()->limit(20)->get(),
            'stats' => [
                'orders_count' => $customer->orders()->withoutGlobalScopes()->count(),
                'total_spent' => (float) $customer->orders()->withoutGlobalScopes()->where('status', 'delivered')->sum('total'),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone' => ['required', 'string', 'max:255', 'unique:users'],
            'role' => ['required', 'string', 'in:super_admin,admin,shop,driver,customer,business_client'],
            'language' => ['required', 'string', 'in:en,es'],
            'branch' => ['nullable', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:6'],
            'vehicle_type' => ['nullable', 'string', 'max:255'],
            'vehicle_number' => ['nullable', 'string', 'max:255'],
        ]);

        $role = $data['role'];
        $branch = in_array($role, ['super_admin', 'admin', 'customer', 'business_client']) ? null : ($data['branch'] ?? null);

        $user = \App\Models\User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'role' => $role,
            'language' => $data['language'],
            'branch' => $branch,
            'password' => \Illuminate\Support\Facades\Hash::make($data['password']),
        ]);

        if ($user->role === 'driver') {
            \App\Models\Driver::create([
                'user_id' => $user->id,
                'vehicle_type' => $data['vehicle_type'] ?? 'van',
                'vehicle_number' => $data['vehicle_number'] ?? 'CQ21 VAN',
                'active' => true,
            ]);
        }

        return back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        // Prevent changing active admin or super admin role
        if ($user->role === 'super_admin') {
            $request->merge(['role' => 'super_admin']);
        } elseif ($user->role === 'admin') {
            $request->merge(['role' => 'admin']);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone' => ['required', 'string', 'max:255', 'unique:users,phone,' . $user->id],
            'role' => ['required', 'string', 'in:super_admin,admin,shop,driver,customer,business_client'],
            'language' => ['required', 'string', 'in:en,es'],
            'branch' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'min:6'],
            'vehicle_type' => ['nullable', 'string', 'max:255'],
            'vehicle_number' => ['nullable', 'string', 'max:255'],
            'driver_active' => ['nullable', 'boolean'],
        ]);

        $role = $data['role'];
        $branch = in_array($role, ['super_admin', 'admin', 'customer', 'business_client']) ? null : ($data['branch'] ?? null);

        $updateData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'role' => $role,
            'language' => $data['language'],
            'branch' => $branch,
        ];

        if (! empty($data['password'])) {
            $updateData['password'] = \Illuminate\Support\Facades\Hash::make($data['password']);
        }

        $oldRole = $user->role;
        $user->update($updateData);

        if ($user->role === 'driver') {
            \App\Models\Driver::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'vehicle_type' => $data['vehicle_type'] ?? 'van',
                    'vehicle_number' => $data['vehicle_number'] ?? 'CQ21 VAN',
                    'active' => isset($data['driver_active']) ? (bool) $data['driver_active'] : true
                ]
            );
        } elseif ($user->role !== 'driver' && $oldRole === 'driver') {
            $user->driver()->delete();
        }

        return back()->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete yourself.');
        }

        if ($user->role === 'driver') {
            $user->driver()->delete();
        }

        $user->delete();

        return back()->with('success', 'User deleted successfully.');
    }
}
