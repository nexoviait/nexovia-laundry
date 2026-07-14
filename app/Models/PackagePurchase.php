<?php

namespace App\Models;

use App\Models\Concerns\RestrictsToOwningCustomer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PackagePurchase extends Model
{
    use HasFactory, RestrictsToOwningCustomer;

    protected $fillable = [
        'user_id',
        'package_id',
        'balance',
        'expiry_date',
    ];

    protected function casts(): array
    {
        return [
            'balance' => 'decimal:2',
            'expiry_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }
}
