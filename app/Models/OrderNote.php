<?php

namespace App\Models;

use App\Models\Concerns\RestrictsToOwningCustomerThroughOrder;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

class OrderNote extends Model
{
    use HasFactory, RestrictsToOwningCustomerThroughOrder;

    protected $fillable = [
        'order_id',
        'user_id',
        'note',
        'visible_to_customer',
    ];

    protected function casts(): array
    {
        return [
            'visible_to_customer' => 'boolean',
        ];
    }

    /**
     * FR-ADM-022: internal notes are staff-only even on the customer's own
     * order — only visible_to_customer notes are ever exposed to them.
     */
    protected static function booted(): void
    {
        static::addGlobalScope('customer_visibility', function (Builder $query) {
            $user = Auth::user();

            if ($user && $user->role === 'customer') {
                $query->where('visible_to_customer', true);
            }
        });
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
