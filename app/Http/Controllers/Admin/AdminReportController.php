<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/** FR-ADM-009: daily operational report with CSV export. */
class AdminReportController extends Controller
{
    public function daily(Request $request): Response
    {
        $date = $this->resolveDate($request);
        $orders = $this->ordersForDate($date)->get();
        $notCancelled = $orders->filter(fn (Order $o) => $o->status !== OrderStatus::Cancelled);

        return Inertia::render('Admin/Reports/Daily', [
            'date' => $date->toDateString(),
            'summary' => [
                'total_orders' => $orders->count(),
                'revenue' => (float) $notCancelled->sum('total'),
                'cancelled' => $orders->count() - $notCancelled->count(),
                'by_status' => $orders->groupBy(fn (Order $o) => $o->status->value)->map->count(),
            ],
            'orders' => OrderResource::collection($orders->values()),
        ]);
    }

    public function revenue(): Response
    {
        // 1. Calculate general financial summary stats
        $orders = Order::query()->withoutGlobalScopes()->get();
        $notCancelled = $orders->filter(fn ($o) => $o->status !== OrderStatus::Cancelled);
        
        $totalRevenue = (float) $notCancelled->sum('total');
        $totalInvoices = $notCancelled->count();
        $avgOrderValue = $totalInvoices > 0 ? (float) ($totalRevenue / $totalInvoices) : 0.0;
        
        // Pending settlements = confirmed/assigned but not finalized/cancelled
        $pendingSettlements = (float) $orders->filter(fn ($o) => in_array($o->status->value, ['confirmed', 'assigned', 'picked_up']))
            ->sum('total');

        // 2. Branch performance: Group by service area
        $branchStats = DB::table('orders')
            ->leftJoin('addresses', 'orders.address_id', '=', 'addresses.id')
            ->leftJoin('service_areas', 'addresses.service_area_id', '=', 'service_areas.id')
            ->select(
                DB::raw('COALESCE(service_areas.name, \'Downtown Hub - Manhattan\') as branch_name'),
                DB::raw('SUM(orders.total) as total_revenue'),
                DB::raw('COUNT(orders.id) as total_orders')
            )
            ->where('orders.status', '<>', 'cancelled')
            ->groupBy('branch_name')
            ->get();

        return Inertia::render('Admin/Reports/Revenue', [
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_invoices' => $totalInvoices,
                'avg_order_value' => $avgOrderValue,
                'pending_settlements' => $pendingSettlements,
            ],
            'branch_stats' => $branchStats,
        ]);
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $date = $this->resolveDate($request);
        $orders = $this->ordersForDate($date)->get();

        $filename = "orders-{$date->toDateString()}.csv";

        return response()->streamDownload(function () use ($orders) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Order ID', 'Customer', 'Phone', 'Status', 'Area', 'Time Slot', 'Total', 'Created At']);

            foreach ($orders as $order) {
                fputcsv($handle, [
                    $order->id,
                    $order->user?->name,
                    $order->user?->phone,
                    $order->status->value,
                    $order->address?->serviceArea?->name,
                    $order->timeSlot ? "{$order->timeSlot->date->toDateString()} {$order->timeSlot->window}" : null,
                    $order->total,
                    $order->created_at->toDateTimeString(),
                ]);
            }

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    private function resolveDate(Request $request): Carbon
    {
        $data = $request->validate(['date' => ['nullable', 'date']]);

        return isset($data['date']) ? Carbon::parse($data['date']) : Carbon::today();
    }

    private function ordersForDate(Carbon $date)
    {
        return Order::query()->withoutGlobalScopes()
            ->with(['user', 'address.serviceArea', 'timeSlot'])
            ->whereHas('timeSlot', fn ($q) => $q->whereDate('date', $date));
    }
}
