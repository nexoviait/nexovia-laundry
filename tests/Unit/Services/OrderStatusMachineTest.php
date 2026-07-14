<?php

namespace Tests\Unit\Services;

use App\Enums\OrderStatus;
use App\Exceptions\InvalidOrderTransitionException;
use App\Models\GarmentTag;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\StatusHistory;
use App\Models\User;
use App\Models\UserNotification;
use App\Services\Notifications\OrderStatusNotifier;
use App\Services\Order\OrderStatusMachine;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Doubles\FakePushGateway;
use Tests\Doubles\FakeSmsGateway;
use Tests\TestCase;

class OrderStatusMachineTest extends TestCase
{
    use RefreshDatabase;

    private OrderStatusMachine $machine;

    private FakeSmsGateway $sms;

    private FakePushGateway $push;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->sms = new FakeSmsGateway;
        $this->push = new FakePushGateway;
        $this->machine = new OrderStatusMachine(new OrderStatusNotifier($this->sms, $this->push));
        $this->admin = User::factory()->admin()->create();
    }

    private function orderWithTagsAtStage(string $stage, int $tagCount = 2): Order
    {
        $order = Order::factory()->withStatus('processing')->create();
        $item = OrderItem::factory()->create(['order_id' => $order->id]);
        GarmentTag::factory()->count($tagCount)->create(['order_item_id' => $item->id, 'stage' => $stage]);

        return $order->fresh();
    }

    public function test_the_full_forward_path_from_pending_to_rated_is_allowed(): void
    {
        $order = Order::factory()->withStatus('pending')->create();

        $order = $this->machine->transition($order, OrderStatus::Confirmed, $this->admin);
        $this->assertSame(OrderStatus::Confirmed, $order->status);

        $order = $this->machine->transition($order, OrderStatus::Assigned, $this->admin);
        $order = $this->machine->transition($order, OrderStatus::PickedUp, $this->admin);
        $order = $this->machine->transition($order, OrderStatus::Processing, $this->admin);

        $item = OrderItem::factory()->create(['order_id' => $order->id]);
        GarmentTag::factory()->create(['order_item_id' => $item->id, 'stage' => 'quality_check']);

        $order = $this->machine->transition($order->fresh(), OrderStatus::Ready, $this->admin);
        $order = $this->machine->transition($order, OrderStatus::OutForDelivery, $this->admin);
        $order = $this->machine->transition($order, OrderStatus::Delivered, $this->admin);
        $order = $this->machine->transition($order, OrderStatus::Rated, $order->user);

        $this->assertSame(OrderStatus::Rated, $order->status);
        $this->assertSame(8, StatusHistory::where('order_id', $order->id)->count());
    }

    public function test_skipping_a_status_is_rejected(): void
    {
        $order = Order::factory()->withStatus('pending')->create();

        $this->expectException(InvalidOrderTransitionException::class);

        $this->machine->transition($order, OrderStatus::Assigned, $this->admin);
    }

    public function test_moving_backward_is_rejected(): void
    {
        $order = Order::factory()->withStatus('confirmed')->create();

        $this->expectException(InvalidOrderTransitionException::class);

        $this->machine->transition($order, OrderStatus::Pending, $this->admin);
    }

    public function test_re_entering_the_same_status_is_rejected(): void
    {
        $order = Order::factory()->withStatus('confirmed')->create();

        $this->expectException(InvalidOrderTransitionException::class);

        $this->machine->transition($order, OrderStatus::Confirmed, $this->admin);
    }

    /**
     * @return array<string, array{0: string}>
     */
    public static function cancellableStatuses(): array
    {
        return [
            'pending' => ['pending'],
            'confirmed' => ['confirmed'],
            'assigned' => ['assigned'],
            'picked_up' => ['picked_up'],
        ];
    }

    #[DataProvider('cancellableStatuses')]
    public function test_cancellation_is_allowed_before_processing_starts(string $status): void
    {
        $order = Order::factory()->withStatus($status)->create();

        $order = $this->machine->transition($order, OrderStatus::Cancelled, $this->admin, 'Customer requested');

        $this->assertSame(OrderStatus::Cancelled, $order->status);
    }

    /**
     * @return array<string, array{0: string}>
     */
    public static function pipelineStatuses(): array
    {
        return [
            'processing' => ['processing'],
            'ready' => ['ready'],
            'out_for_delivery' => ['out_for_delivery'],
            'delivered' => ['delivered'],
            'rated' => ['rated'],
        ];
    }

    #[DataProvider('pipelineStatuses')]
    public function test_standard_cancellation_is_rejected_once_processing_has_started(string $status): void
    {
        $order = Order::factory()->withStatus($status)->create();

        $this->expectException(InvalidOrderTransitionException::class);

        $this->machine->transition($order, OrderStatus::Cancelled, $this->admin);
    }

    public function test_ready_requires_every_garment_tag_to_have_reached_quality_check(): void
    {
        $order = $this->orderWithTagsAtStage('ironing');

        $this->expectException(InvalidOrderTransitionException::class);

        $this->machine->transition($order, OrderStatus::Ready, $this->admin);
    }

    public function test_ready_is_rejected_when_only_some_garment_tags_are_at_quality_check(): void
    {
        $order = Order::factory()->withStatus('processing')->create();
        $item = OrderItem::factory()->create(['order_id' => $order->id]);
        GarmentTag::factory()->create(['order_item_id' => $item->id, 'stage' => 'quality_check']);
        GarmentTag::factory()->create(['order_item_id' => $item->id, 'stage' => 'washing']);

        $this->expectException(InvalidOrderTransitionException::class);

        $this->machine->transition($order, OrderStatus::Ready, $this->admin);
    }

    public function test_ready_is_rejected_when_the_order_has_no_garment_tags_at_all(): void
    {
        $order = Order::factory()->withStatus('processing')->create();

        $this->expectException(InvalidOrderTransitionException::class);

        $this->machine->transition($order, OrderStatus::Ready, $this->admin);
    }

    public function test_ready_succeeds_once_every_garment_tag_reaches_quality_check(): void
    {
        $order = $this->orderWithTagsAtStage('quality_check');

        $order = $this->machine->transition($order, OrderStatus::Ready, $this->admin);

        $this->assertSame(OrderStatus::Ready, $order->status);
    }

    public function test_admin_override_can_cancel_an_order_already_in_the_pipeline(): void
    {
        $order = Order::factory()->withStatus('processing')->create();

        $order = $this->machine->forceCancel($order, $this->admin, 'Damaged beyond repair, refunding customer');

        $this->assertSame(OrderStatus::Cancelled, $order->status);
        $this->assertDatabaseHas('status_histories', [
            'order_id' => $order->id,
            'status' => 'cancelled',
            'changed_by' => $this->admin->id,
            'note' => 'Damaged beyond repair, refunding customer',
        ]);
    }

    #[DataProvider('cancellableStatuses')]
    public function test_admin_override_is_rejected_before_processing_has_started(string $status): void
    {
        $order = Order::factory()->withStatus($status)->create();

        $this->expectException(InvalidOrderTransitionException::class);

        $this->machine->forceCancel($order, $this->admin, 'Should use the standard cancel path instead');
    }

    public function test_admin_override_is_rejected_once_already_delivered(): void
    {
        $order = Order::factory()->withStatus('delivered')->create();

        $this->expectException(InvalidOrderTransitionException::class);

        $this->machine->forceCancel($order, $this->admin, 'Too late');
    }

    public function test_every_transition_logs_status_history_with_the_acting_user_and_a_timestamp(): void
    {
        $order = Order::factory()->withStatus('pending')->create();

        $this->machine->transition($order, OrderStatus::Confirmed, $this->admin, 'Looks good');

        $this->assertDatabaseHas('status_histories', [
            'order_id' => $order->id,
            'status' => 'confirmed',
            'changed_by' => $this->admin->id,
            'note' => 'Looks good',
        ]);

        $history = StatusHistory::where('order_id', $order->id)->first();
        $this->assertNotNull($history->created_at);
    }

    public function test_transition_fires_the_customer_facing_notification_matrix_for_the_new_status(): void
    {
        $order = Order::factory()->withStatus('pending')->create();

        $this->machine->transition($order, OrderStatus::Confirmed, $this->admin);

        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $order->user_id,
            'body' => 'Order confirmed',
        ]);

        $this->assertCount(1, $this->sms->sent);
        $this->assertSame($order->user->phone, $this->sms->sent[0]['phone']);
        $this->assertSame('Order confirmed', $this->sms->sent[0]['message']);

        $this->assertCount(1, $this->push->sent);
        $this->assertSame('Order confirmed', $this->push->sent[0]['message']);
    }

    public function test_rated_status_has_no_srs_defined_customer_message_so_no_notification_fires(): void
    {
        $order = Order::factory()->withStatus('delivered')->create();

        $before = UserNotification::count();

        $this->machine->transition($order, OrderStatus::Rated, $order->user);

        $this->assertSame($before, UserNotification::count());
        $this->assertCount(0, $this->push->sent);
    }
}
