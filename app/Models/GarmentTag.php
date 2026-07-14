<?php

namespace App\Models;

use App\Models\Concerns\RestrictsToOwningCustomerThroughOrder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GarmentTag extends Model
{
    use HasFactory, RestrictsToOwningCustomerThroughOrder;

    /** Forward-only stage progression (REQ-SHOP-02 / FR-OPS-003). */
    public const STAGES = ['received', 'washing', 'drying', 'ironing', 'quality_check', 'ready'];

    /** Owning order is reached through the order item, not directly. */
    protected static string $customerOwnerRelation = 'orderItem.order';

    protected $fillable = [
        'order_item_id',
        'qr_code',
        'stage',
        'issue_flag',
        'issue_note',
        'issue_photos',
    ];

    protected function casts(): array
    {
        return [
            'issue_flag' => 'boolean',
            'issue_photos' => 'array',
        ];
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }
}
