<?php

namespace Tests\Feature\Admin;

use App\Models\Order;
use App\Models\TimeSlot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

/** FR-ADM-009: daily report with CSV export. */
class AdminReportTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
    }

    public function test_daily_report_summarizes_orders_for_the_selected_date(): void
    {
        $today = TimeSlot::factory()->create(['date' => Carbon::today()->toDateString()]);
        $tomorrow = TimeSlot::factory()->create(['date' => Carbon::tomorrow()->toDateString()]);

        Order::factory()->create(['time_slot_id' => $today->id, 'status' => 'confirmed', 'total' => 20]);
        Order::factory()->create(['time_slot_id' => $today->id, 'status' => 'cancelled', 'total' => 15]);
        Order::factory()->create(['time_slot_id' => $tomorrow->id, 'status' => 'confirmed', 'total' => 99]);

        $response = $this->actingAs($this->admin)->get('/admin/reports/daily');

        $response->assertOk()->assertInertia(fn ($page) => $page
            ->component('Reports/Daily')
            ->where('summary.total_orders', 2)
            ->where('summary.cancelled', 1)
            ->where('summary.revenue', fn ($revenue) => (float) $revenue === 20.0)
        );
    }

    public function test_csv_export_contains_the_orders_for_the_date(): void
    {
        $slot = TimeSlot::factory()->create(['date' => Carbon::today()->toDateString()]);
        $order = Order::factory()->create(['time_slot_id' => $slot->id, 'status' => 'confirmed', 'total' => 42.5]);

        $response = $this->actingAs($this->admin)->get('/admin/reports/daily/export');

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');

        $content = $response->streamedContent();
        $rows = array_map('str_getcsv', array_filter(explode("\n", trim($content))));

        $this->assertSame(
            ['Order ID', 'Customer', 'Phone', 'Status', 'Area', 'Time Slot', 'Total', 'Created At'],
            $rows[0]
        );
        $this->assertSame((string) $order->id, $rows[1][0]);
        $this->assertSame('confirmed', $rows[1][3]);
        $this->assertSame('42.50', $rows[1][6]);
    }
}
