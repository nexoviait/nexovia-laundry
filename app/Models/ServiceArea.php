<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceArea extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'country',
        'postcode',
        'delivery_charge',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'delivery_charge' => 'decimal:2',
            'active' => 'boolean',
        ];
    }

    public function timeSlots(): HasMany
    {
        return $this->hasMany(TimeSlot::class);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }
}
