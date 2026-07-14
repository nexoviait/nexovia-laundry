<?php

namespace App\Models;

use App\Models\Concerns\RestrictsToOwningCustomer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserNotification extends Model
{
    use HasFactory, RestrictsToOwningCustomer;

    protected $table = 'user_notifications';

    protected $fillable = [
        'user_id',
        'title',
        'body',
        'type',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
