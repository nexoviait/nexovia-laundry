<?php

namespace App\Models;

use App\Models\Concerns\RestrictsToOwningCustomerThroughOrder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    use HasFactory, RestrictsToOwningCustomerThroughOrder;

    protected $fillable = [
        'order_id',
        'vat',
        'total',
        'method',
        'status',
        'issued_at',
    ];

    protected function casts(): array
    {
        return [
            'vat' => 'decimal:2',
            'total' => 'decimal:2',
            'issued_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
