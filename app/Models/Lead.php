<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * REQ-CUST-02 / REQ-ADM-10: an out-of-area booking attempt, captured so the
 * business can see demand and follow up once that area launches.
 */
class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'phone',
        'postcode',
        'note',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
