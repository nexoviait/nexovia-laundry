<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TimeSlotResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'date' => $this->date?->toDateString(),
            'window' => $this->window,
            'capacity' => $this->capacity,
            'booked' => $this->when(isset($this->booked_count), fn () => (int) $this->booked_count),
            'available' => $this->when(
                isset($this->booked_count),
                fn () => max(0, $this->capacity - (int) $this->booked_count)
            ),
            'service_area' => new ServiceAreaResource($this->whenLoaded('serviceArea')),
        ];
    }
}
