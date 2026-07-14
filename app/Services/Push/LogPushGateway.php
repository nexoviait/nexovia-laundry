<?php

namespace App\Services\Push;

use App\Models\User;
use Illuminate\Support\Facades\Log;

/**
 * Development stand-in for a real push provider: prints the message to the
 * console/log instead of sending it. Default binding until a provider
 * (FCM/APNs, etc.) is chosen.
 */
class LogPushGateway implements PushGateway
{
    public function send(User $user, string $message): void
    {
        $line = "[PUSH to user#{$user->id} ({$user->name})] {$message}";

        if (defined('STDOUT')) {
            fwrite(STDOUT, $line.PHP_EOL);
        }

        Log::info($line);
    }
}
