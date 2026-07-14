<?php

namespace App\Http\Controllers\Shop;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\GarmentTag;
use App\Services\Order\OrderStatusMachine;
use Illuminate\Http\Request;

/**
 * FR-OPS-003: one-click stage updates.
 * FR-OPS-004: issue flagging with photos, puts the order ON_HOLD.
 */
class ShopGarmentTagController extends Controller
{
    public function __construct(private readonly OrderStatusMachine $machine) {}

    public function updateStage(Request $request, GarmentTag $garmentTag)
    {
        $data = $request->validate([
            'stage' => ['required', 'string', 'in:'.implode(',', GarmentTag::STAGES)],
        ]);

        $order = $garmentTag->orderItem->order;

        if ($order->status !== OrderStatus::Processing) {
            return back()->with('error', 'This order is not currently on the floor.');
        }

        $currentIndex = array_search($garmentTag->stage, GarmentTag::STAGES, true);
        $nextIndex = array_search($data['stage'], GarmentTag::STAGES, true);

        if ($nextIndex < $currentIndex) {
            return back()->with('error', 'Stage cannot move backward.');
        }

        $garmentTag->update(['stage' => $data['stage']]);

        return back()->with('success', 'Stage updated.');
    }

    public function flagIssue(Request $request, GarmentTag $garmentTag)
    {
        $data = $request->validate([
            'note' => ['required', 'string', 'max:1000'],
            'photos' => ['nullable', 'array', 'max:4'],
            'photos.*' => ['image', 'max:5120'],
        ]);

        $paths = collect($request->file('photos', []))
            ->map(fn ($photo) => $photo->store('garment-issues', 'public'))
            ->all();

        $garmentTag->update([
            'issue_flag' => true,
            'issue_note' => $data['note'],
            'issue_photos' => array_merge($garmentTag->issue_photos ?? [], $paths),
        ]);

        $order = $garmentTag->orderItem->order;

        if ($order->status === OrderStatus::Processing) {
            $this->machine->transition(
                $order,
                OrderStatus::OnHold,
                $request->user(),
                "Issue flagged on tag #{$garmentTag->id}: {$data['note']}"
            );
        }

        return back()->with('success', 'Issue flagged — order placed on hold.');
    }

    public function resolveIssue(Request $request, GarmentTag $garmentTag)
    {
        $order = $garmentTag->orderItem->order;

        if ($order->status !== OrderStatus::OnHold) {
            return back()->with('error', 'This order is not on hold.');
        }

        $garmentTag->update(['issue_flag' => false]);

        $stillFlagged = $order->items()->with('garmentTags')->get()
            ->flatMap->garmentTags
            ->contains(fn (GarmentTag $tag) => $tag->issue_flag);

        if (! $stillFlagged) {
            $this->machine->transition($order, OrderStatus::Processing, $request->user(), 'All flagged issues resolved.');
        }

        return back()->with('success', $stillFlagged ? 'Issue resolved — other issues remain.' : 'Issue resolved — order resumed.');
    }
}
