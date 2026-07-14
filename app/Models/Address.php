<?php

namespace App\Models;

use App\Models\Concerns\RestrictsToOwningCustomer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Address extends Model
{
    use HasFactory, RestrictsToOwningCustomer;

    protected $fillable = [
        'user_id',
        'service_area_id',
        'label',
        'postcode',
        'map_lat',
        'map_lng',
        'directions',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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
