<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DriverTaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'type' => $this->type,
            'status' => $this->status,
            'photos' => collect($this->photos ?? [])->map(fn (string $path) => \Illuminate\Support\Facades\Storage::disk('public')->url($path))->all(),
            'otp_verified_at' => $this->otp_verified_at,
            'gps_lat' => $this->gps_lat,
            'gps_lng' => $this->gps_lng,
            'item_count' => $this->item_count,
            'weight' => $this->weight,
            'payment_method' => $this->payment_method,
            'cod_amount' => $this->cod_amount,
            'failure_reason' => $this->failure_reason,
            'scheduled_at' => $this->scheduled_at,
            'completed_at' => $this->completed_at,
            'driver' => new DriverResource($this->whenLoaded('driver')),
            'order' => new OrderResource($this->whenLoaded('order')),
        ];
    }
}
