<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TimeSlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_area_id',
        'date',
        'window',
        'capacity',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function serviceArea(): BelongsTo
    {
        return $this->belongsTo(ServiceArea::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
