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
        $data = $request->validate(['search' => ['nullable', 'string', 'max:255']]);

        $query = User::query()
            ->where('role', 'customer')
            ->withCount(['orders as orders_count' => fn ($q) => $q->withoutGlobalScopes()]);

        if (! empty($data['search'])) {
            $search = $data['search'];
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"));
        }

        return Inertia::render('Customers/Index', [
            'customers' => $query->latest()->paginate(25)->withQueryString(),
            'filters' => $data,
        ]);
    }

    public function show(User $customer): Response
    {
        abort_unless($customer->role === 'customer', 404);

        return Inertia::render('Customers/Show', [
            'customer' => $customer,
            'addresses' => $customer->addresses()->with('serviceArea')->get(),
            'orders' => $customer->orders()->withoutGlobalScopes()->latest()->limit(20)->get(),
        ]);
    }
}
