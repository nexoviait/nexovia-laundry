<?php

namespace Tests\Feature;

use App\Models\Banner;
use App\Models\CmsPage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** REQ-ADM-08: public read access to active banners/CMS pages for the customer app. */
class PublicContentTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_active_banners_are_returned_publicly(): void
    {
        Banner::factory()->create(['title' => 'Active Banner', 'active' => true]);
        Banner::factory()->create(['title' => 'Inactive Banner', 'active' => false]);

        $response = $this->getJson('/api/v1/banners');

        $response->assertOk();
        $titles = collect($response->json('data'))->pluck('title');
        $this->assertTrue($titles->contains('Active Banner'));
        $this->assertFalse($titles->contains('Inactive Banner'));
    }

    public function test_an_active_cms_page_is_readable_by_slug(): void
    {
        CmsPage::factory()->create(['slug' => 'about-us', 'title' => 'About Us', 'active' => true]);

        $this->getJson('/api/v1/cms-pages/about-us')
            ->assertOk()
            ->assertJsonPath('data.title', 'About Us');
    }

    public function test_an_inactive_cms_page_404s(): void
    {
        CmsPage::factory()->create(['slug' => 'draft-page', 'active' => false]);

        $this->getJson('/api/v1/cms-pages/draft-page')->assertNotFound();
    }

    public function test_an_unknown_slug_404s(): void
    {
        $this->getJson('/api/v1/cms-pages/does-not-exist')->assertNotFound();
    }
}
