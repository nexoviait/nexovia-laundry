<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminComplaintController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status', 'all');

        $query = Complaint::query()->with(['user', 'order']);

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $complaints = $query->latest()->paginate(25);

        return Inertia::render('Admin/Complaints/Index', [
            'complaints' => $complaints,
            'filters' => [
                'status' => $status,
            ],
            'summary' => [
                'pending' => Complaint::query()->where('status', 'pending')->count(),
                'resolved' => Complaint::query()->where('status', 'resolved')->count(),
                'total' => Complaint::query()->count(),
            ]
        ]);
    }

    public function update(Request $request, Complaint $complaint)
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:pending,investigating,resolved,closed'],
        ]);

        $updateData = ['status' => $data['status']];

        if ($data['status'] === 'resolved') {
            $updateData['resolved_at'] = now();
        }

        $complaint->update($updateData);

        return back()->with('success', "Complaint #{$complaint->id} status updated to {$data['status']}.");
    }
}
