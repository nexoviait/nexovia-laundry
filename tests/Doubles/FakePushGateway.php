<?php

namespace Tests\Doubles;

use App\Models\User;
use App\Services\Push\PushGateway;

class FakePushGateway implements PushGateway
{
    /** @var array<int, array{user_id: int, message: string}> */
    public array $sent = [];

    public function send(User $user, string $message): void
    {
        $this->sent[] = ['user_id' => $user->id, 'message' => $message];
    }
}
