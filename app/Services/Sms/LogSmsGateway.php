<?php

namespace App\Services\Sms;

use Illuminate\Support\Facades\Log;

/**
 * Development stand-in for a real SMS provider: prints the message to the
 * console/log instead of sending it. Default binding until a provider
 * (Twilio, etc.) is chosen.
 */
class LogSmsGateway implements SmsGateway
{
    public function send(string $phoneNumber, string $message): void
    {
        $line = "[SMS to {$phoneNumber}] {$message}";

        if (defined('STDOUT')) {
            fwrite(STDOUT, $line.PHP_EOL);
        }

        Log::info($line);
    }
}
