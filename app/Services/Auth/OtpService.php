<?php

namespace App\Services\Auth;

use App\Models\OtpCode;
use App\Services\Sms\SmsGateway;
use Illuminate\Support\Facades\Hash;

class OtpService
{
    private const CODE_LENGTH = 6;

    private const TTL_MINUTES = 5;

    private const MAX_ATTEMPTS = 5;

    public function __construct(private readonly SmsGateway $gateway) {}

    /**
     * Generate a fresh OTP for the phone number, invalidate any prior
     * outstanding code, and send it through the configured SMS gateway.
     */
    public function generateAndSend(string $phone): OtpCode
    {
        OtpCode::active($phone)->update(['consumed_at' => now()]);

        $plainCode = str_pad((string) random_int(0, 10 ** self::CODE_LENGTH - 1), self::CODE_LENGTH, '0', STR_PAD_LEFT);

        $otp = OtpCode::create([
            'phone' => $phone,
            'code' => Hash::make($plainCode),
            'expires_at' => now()->addMinutes(self::TTL_MINUTES),
        ]);

        $this->gateway->send($phone, "Your Clean Quick Laundry verification code is {$plainCode}. It expires in ".self::TTL_MINUTES.' minutes.');

        return $otp;
    }

    /**
     * Verify a submitted code against the latest outstanding OTP for the
     * phone number. Codes are single-use: a successful verification (or
     * exceeding the attempt limit) consumes the record.
     */
    public function verify(string $phone, string $code): bool
    {
        $otp = OtpCode::active($phone)->first();

        if (! $otp) {
            return false;
        }

        if (! Hash::check($code, $otp->code)) {
            $otp->increment('attempts');

            if ($otp->attempts >= self::MAX_ATTEMPTS) {
                $otp->update(['consumed_at' => now()]);
            }

            return false;
        }

        $otp->update(['consumed_at' => now()]);

        return true;
    }
}
