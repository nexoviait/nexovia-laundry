<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BannerResource;
use App\Http\Resources\CmsPageResource;
use App\Models\Banner;
use App\Models\CmsPage;

/** REQ-ADM-08: public read access to active banners/CMS pages for the customer app. */
class PublicContentController extends Controller
{
    public function banners()
    {
        return BannerResource::collection(
            Banner::query()->where('active', true)->orderBy('sort_order')->get()
        );
    }

    public function cmsPage(string $slug)
    {
        $page = CmsPage::query()->where('slug', $slug)->where('active', true)->first();

        if (! $page) {
            return response()->json(['message' => 'Page not found.'], 404);
        }

        return new CmsPageResource($page);
    }
}
