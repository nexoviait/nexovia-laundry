<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class GarmentTagResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_item_id' => $this->order_item_id,
            'qr_code' => $this->qr_code,
            'stage' => $this->stage,
            'issue_flag' => $this->issue_flag,
            'issue_note' => $this->issue_note,
            'issue_photos' => collect($this->issue_photos ?? [])->map(fn (string $path) => Storage::disk('public')->url($path))->all(),
        ];
    }
}
