<?php

namespace App\Services\Push;

use App\Models\User;

/**
 * Provider-agnostic push transport (REQ-CUST-05: in-app status
 * notifications). Swap the bound implementation (see AppServiceProvider)
 * for a real provider (FCM/APNs) later without touching calling code.
 */
interface PushGateway
{
    public function send(User $user, string $message): void;
}
