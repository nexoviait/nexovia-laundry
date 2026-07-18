<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class BannerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'image_url' => $this->image_path ? Storage::disk('public')->url($this->image_path) : null,
            'link' => $this->link,
            'active' => $this->active,
            'sort_order' => $this->sort_order,
        ];
    }
}
