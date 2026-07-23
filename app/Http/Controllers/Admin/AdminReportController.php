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

class AdminReportController extends Controller
{
    public function index(Request $request): Response
    {
        $filter = $request->query('filter', 'monthly'); // 'day', 'weekly', 'monthly', 'custom'
        $tab = $request->query('tab', 'sales'); // 'sales' or 'undelivered'
        
        $dateStr = $request->query('date', Carbon::today()->toDateString());
        $fromDateStr = $request->query('from_date');
        $toDateStr = $request->query('to_date');

        // Resolve date range bounds
        [$startDate, $endDate, $periodLabel] = $this->resolveDateRange($filter, $dateStr, $fromDateStr, $toDateStr);

        // Fetch Orders for Sales Report
        $ordersQuery = Order::query()->withoutGlobalScopes()
            ->with(['user', 'address.serviceArea', 'timeSlot', 'driverTasks.driver.user', 'items.service', 'invoice']);

        if ($filter === 'day') {
            $ordersQuery->whereHas('timeSlot', fn ($q) => $q->whereDate('date', $startDate));
        } else {
            $ordersQuery->whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()]);
        }

        $allPeriodOrders = $ordersQuery->latest('id')->get();
        $notCancelled = $allPeriodOrders->filter(fn (Order $o) => $o->status !== OrderStatus::Cancelled);

        // Summary Calculations
        $totalRevenue = (float) $notCancelled->sum('total');
        $totalOrders = $allPeriodOrders->count();
        $completedCount = $allPeriodOrders->filter(fn (Order $o) => in_array($o->status->value, ['delivered', 'rated']))->count();
        $cancelledCount = $allPeriodOrders->filter(fn (Order $o) => $o->status === OrderStatus::Cancelled)->count();
        $avgOrderValue = ($totalOrders - $cancelledCount) > 0 ? $totalRevenue / ($totalOrders - $cancelledCount) : 0;

        // Payment status breakdown
        $paidOrders = $allPeriodOrders->filter(fn (Order $o) => in_array($o->status->value, ['delivered', 'rated']) || $o->invoice?->status === 'paid');
        $codPendingOrders = $allPeriodOrders->filter(fn (Order $o) => $o->status->value === 'out_for_delivery');
        $unpaidOrders = $allPeriodOrders->filter(fn (Order $o) => ! in_array($o->status->value, ['delivered', 'rated', 'cancelled', 'out_for_delivery']));

        $paymentBreakdown = [
            'paid_amount'        => (float) $paidOrders->sum('total'),
            'paid_count'         => $paidOrders->count(),
            'cod_pending_amount' => (float) $codPendingOrders->sum('total'),
            'cod_pending_count'  => $codPendingOrders->count(),
            'unpaid_amount'      => (float) $unpaidOrders->sum('total'),
            'unpaid_count'       => $unpaidOrders->count(),
        ];

        // Service Category breakdown
        $categoryStats = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('services', 'order_items.service_id', '=', 'services.id')
            ->where('orders.status', '<>', 'cancelled')
            ->whereBetween('orders.created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->select(
                DB::raw('COALESCE(services.category, \'General Laundry\') as category_name'),
                DB::raw('SUM(order_items.line_total) as total_sales'),
                DB::raw('COUNT(order_items.id) as item_count')
            )
            ->groupBy('category_name')
            ->get();

        // Undelivered & Active In-Transit Orders Query
        $undeliveredOrders = Order::query()->withoutGlobalScopes()
            ->with(['user', 'address.serviceArea', 'timeSlot', 'driverTasks.driver.user', 'items.service', 'garmentTags'])
            ->whereNotIn('status', [OrderStatus::Delivered->value, OrderStatus::Rated->value, OrderStatus::Cancelled->value])
            ->get()
            ->sortBy([
                fn (Order $a, Order $b) => $a->status->value === 'on_hold' ? 0 : 1,
                fn (Order $a, Order $b) => $a->id,
            ])
            ->values();

        $undeliveredSummary = [
            'total_undelivered' => $undeliveredOrders->count(),
            'on_hold_flagged'   => $undeliveredOrders->filter(fn (Order $o) => $o->status->value === 'on_hold')->count(),
            'out_for_delivery'  => $undeliveredOrders->filter(fn (Order $o) => $o->status->value === 'out_for_delivery')->count(),
            'in_processing'     => $undeliveredOrders->filter(fn (Order $o) => in_array($o->status->value, ['picked_up', 'processing', 'ready']))->count(),
        ];

        return Inertia::render('Admin/Reports/Index', [
            'filters' => [
                'filter'    => $filter,
                'tab'       => $tab,
                'date'      => $dateStr,
                'from_date' => $fromDateStr,
                'to_date'   => $toDateStr,
                'label'     => $periodLabel,
            ],
            'summary' => [
                'total_revenue'    => round($totalRevenue, 2),
                'total_orders'     => $totalOrders,
                'completed_orders' => $completedCount,
                'cancelled_orders' => $cancelledCount,
                'avg_order_value'  => round($avgOrderValue, 2),
                'payment'          => $paymentBreakdown,
            ],
            'category_stats'      => $categoryStats,
            'orders'              => $allPeriodOrders,
            'undelivered'         => $undeliveredOrders,
            'undelivered_summary' => $undeliveredSummary,
        ]);
    }

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
        $orders = Order::query()->withoutGlobalScopes()->get();
        $notCancelled = $orders->filter(fn ($o) => $o->status !== OrderStatus::Cancelled);

        $totalRevenue = (float) $notCancelled->sum('total');
        $totalInvoices = $notCancelled->count();
        $avgOrderValue = $totalInvoices > 0 ? (float) ($totalRevenue / $totalInvoices) : 0.0;

        $pendingSettlements = (float) $orders->filter(fn ($o) => in_array($o->status->value, ['confirmed', 'assigned', 'picked_up']))
            ->sum('total');

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
                    number_format((float) $order->total, 2, '.', ''),
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

    private function resolveDateRange(string $filter, ?string $dateStr, ?string $fromDateStr, ?string $toDateStr): array
    {
        $now = Carbon::now();

        if ($fromDateStr || $toDateStr) {
            $start = $fromDateStr ? Carbon::parse($fromDateStr)->startOfDay() : $now->copy()->startOfMonth();
            $end   = $toDateStr ? Carbon::parse($toDateStr)->endOfDay() : $now->copy()->endOfDay();
            return [$start, $end, "Selected Range ({$start->format('M d, Y')} - {$end->format('M d, Y')})"];
        }

        if ($filter === 'day') {
            $date = $dateStr ? Carbon::parse($dateStr) : Carbon::today();
            return [$date->copy()->startOfDay(), $date->copy()->endOfDay(), "Daily Report ({$date->format('M d, Y')})"];
        }

        if ($filter === 'weekly') {
            $start = $now->copy()->startOfWeek();
            $end   = $now->copy()->endOfWeek();
            return [$start, $end, "Weekly Report ({$start->format('M d')} - {$end->format('M d, Y')})"];
        }

        // Default: Monthly
        $start = $now->copy()->startOfMonth();
        $end   = $now->copy()->endOfMonth();
        return [$start, $end, "Monthly Report ({$now->format('F Y')})"];
    }
}
