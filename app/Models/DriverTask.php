<?php

namespace App\Models;

use App\Models\Concerns\RestrictsToOwningCustomerThroughOrder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DriverTask extends Model
{
    use HasFactory, RestrictsToOwningCustomerThroughOrder;

    protected $fillable = [
        'order_id',
        'driver_id',
        'type',
        'status',
        'photos',
        'otp',
        'otp_verified_at',
        'gps_lat',
        'gps_lng',
        'item_count',
        'weight',
        'payment_method',
        'cod_amount',
        'failure_reason',
        'scheduled_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'photos' => 'array',
            'otp_verified_at' => 'datetime',
            'gps_lat' => 'decimal:7',
            'gps_lng' => 'decimal:7',
            'weight' => 'decimal:2',
            'cod_amount' => 'decimal:2',
            'scheduled_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }
}
