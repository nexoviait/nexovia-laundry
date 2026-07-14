<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AddressResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'postcode' => $this->postcode,
            'map_lat' => $this->map_lat,
            'map_lng' => $this->map_lng,
            'directions' => $this->directions,
            'service_area' => new ServiceAreaResource($this->whenLoaded('serviceArea')),
            'created_at' => $this->created_at,
        ];
    }
}
