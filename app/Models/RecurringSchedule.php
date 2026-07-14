<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecurringSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_account_id',
        'property_id',
        'frequency',
        'day_of_week',
        'time_window',
        'active',
        'next_run_date',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
            'next_run_date' => 'date',
        ];
    }

    public function businessAccount(): BelongsTo
    {
        return $this->belongsTo(BusinessAccount::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
