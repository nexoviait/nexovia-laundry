<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'qty' => $this->qty,
            'unit_price' => $this->unit_price,
            'line_total' => $this->line_total,
            'service' => new ServiceResource($this->whenLoaded('service')),
            'garment_tags' => GarmentTagResource::collection($this->whenLoaded('garmentTags')),
        ];
    }
}
