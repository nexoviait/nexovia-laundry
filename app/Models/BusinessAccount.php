<?php

namespace App\Models;

use App\Models\Concerns\RestrictsToOwningCustomer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BusinessAccount extends Model
{
    use HasFactory, RestrictsToOwningCustomer;

    protected $fillable = [
        'user_id',
        'company',
        'vat_no',
        'contract_notes',
        'priority_turnaround',
    ];

    protected function casts(): array
    {
        return [
            'priority_turnaround' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function contractPrices(): HasMany
    {
        return $this->hasMany(ContractPrice::class);
    }

    public function recurringSchedules(): HasMany
    {
        return $this->hasMany(RecurringSchedule::class);
    }
}
