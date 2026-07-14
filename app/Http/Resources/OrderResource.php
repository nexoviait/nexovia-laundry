<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'subtotal' => $this->subtotal,
            'discount' => $this->discount,
            'delivery_fee' => $this->delivery_fee,
            'vat' => $this->vat,
            'total' => $this->total,
            'note' => $this->note,
            'user' => new UserResource($this->whenLoaded('user')),
            'address' => new AddressResource($this->whenLoaded('address')),
            'time_slot' => new TimeSlotResource($this->whenLoaded('timeSlot')),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'driver_tasks' => DriverTaskResource::collection($this->whenLoaded('driverTasks')),
            'invoice' => new InvoiceResource($this->whenLoaded('invoice')),
            'status_histories' => StatusHistoryResource::collection($this->whenLoaded('statusHistories')),
            'notes' => OrderNoteResource::collection($this->whenLoaded('notes')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
