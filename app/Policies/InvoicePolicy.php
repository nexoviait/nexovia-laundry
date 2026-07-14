<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;
use App\Policies\Concerns\AuthorizesCustomerOwnership;

class InvoicePolicy
{
    use AuthorizesCustomerOwnership;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Invoice $invoice): bool
    {
        return $this->ownsThroughOrder($user, $invoice, 'order');
    }

    public function update(User $user, Invoice $invoice): bool
    {
        return $this->isStaff($user);
    }
}
