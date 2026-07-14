<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'vat' => $this->vat,
            'total' => $this->total,
            'method' => $this->method,
            'status' => $this->status,
            'issued_at' => $this->issued_at,
        ];
    }
}
