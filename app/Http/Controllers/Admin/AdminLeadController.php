<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** REQ-ADM-10: view captured leads (out-of-area booking attempts). */
class AdminLeadController extends Controller
{
    public function index(Request $request): Response
    {
        $data = $request->validate(['search' => ['nullable', 'string', 'max:255']]);

        $query = Lead::query()->with('user')->latest();

        if (! empty($data['search'])) {
            $search = $data['search'];
            $query->where(fn ($q) => $q->where('postcode', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%"));
        }

        return Inertia::render('Admin/Leads/Index', [
            'leads' => $query->paginate(25)->withQueryString(),
            'filters' => $data,
        ]);
    }
}
