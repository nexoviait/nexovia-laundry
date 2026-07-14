<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Models\Concerns\RestrictsToOwningCustomerThroughOrder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StatusHistory extends Model
{
    use HasFactory, RestrictsToOwningCustomerThroughOrder;

    protected $fillable = [
        'order_id',
        'status',
        'note',
        'changed_by',
    ];

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
