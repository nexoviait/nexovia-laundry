<?php

namespace App\Models;

use App\Models\Concerns\RestrictsToOwningCustomerThroughOrder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderItem extends Model
{
    use HasFactory, RestrictsToOwningCustomerThroughOrder;

    protected $fillable = [
        'order_id',
        'service_id',
        'qty',
        'unit_price',
        'line_total',
    ];

    protected function casts(): array
    {
        return [
            'qty' => 'decimal:2',
            'unit_price' => 'decimal:2',
            'line_total' => 'decimal:2',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function garmentTags(): HasMany
    {
        return $this->hasMany(GarmentTag::class);
    }
}
