<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CmsPage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** REQ-ADM-08: manage CMS pages (About, Terms, etc.). */
class AdminCmsPageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/CmsPages/Index', [
            'pages' => CmsPage::query()->orderBy('title')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash', 'unique:cms_pages,slug'],
            'content' => ['required', 'string'],
        ]);

        CmsPage::create([
            'title' => $data['title'],
            'slug' => $data['slug'] ?? Str::slug($data['title']),
            'content' => $data['content'],
            'active' => true,
        ]);

        return back()->with('success', 'Page created.');
    }

    public function update(Request $request, CmsPage $cmsPage)
    {
        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'alpha_dash', Rule::unique('cms_pages', 'slug')->ignore($cmsPage->id)],
            'content' => ['sometimes', 'string'],
            'active' => ['sometimes', 'boolean'],
        ]);

        $cmsPage->update($data);

        return back()->with('success', 'Page updated.');
    }

    public function destroy(CmsPage $cmsPage)
    {
        $cmsPage->delete();

        return back()->with('success', 'Page removed.');
    }
}
