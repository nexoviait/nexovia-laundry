<?php

namespace App\Services\Sms;

/**
 * Provider-agnostic SMS transport. Swap the bound implementation
 * (see AppServiceProvider) for a real provider (e.g. Twilio) later
 * without touching calling code — see SRS open question on SMS provider.
 */
interface SmsGateway
{
    public function send(string $phoneNumber, string $message): void;
}
