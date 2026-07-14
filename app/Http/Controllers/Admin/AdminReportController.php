<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
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

        return Inertia::render('Reports/Daily', [
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
