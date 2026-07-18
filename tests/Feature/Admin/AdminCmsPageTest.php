<?php

namespace Tests\Feature\Admin;

use App\Models\CmsPage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** REQ-ADM-08: manage CMS pages. */
class AdminCmsPageTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
    }

    public function test_admin_can_view_cms_pages(): void
    {
        CmsPage::factory()->create(['title' => 'About Us']);

        $this->actingAs($this->admin)->get('/admin/cms-pages')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/CmsPages/Index')
                ->has('pages', 1)
            );
    }

    public function test_admin_can_create_a_page_with_an_auto_generated_slug(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/cms-pages', [
            'title' => 'About Us',
            'content' => 'We are a laundry service.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('cms_pages', ['title' => 'About Us', 'slug' => 'about-us', 'active' => true]);
    }

    public function test_page_slug_must_be_unique(): void
    {
        CmsPage::factory()->create(['slug' => 'about-us']);

        $this->actingAs($this->admin)
            ->post('/admin/cms-pages', ['title' => 'About Us Too', 'slug' => 'about-us', 'content' => 'x'], ['Accept' => 'application/json'])
            ->assertJsonValidationErrors('slug');
    }

    public function test_admin_can_update_and_unpublish_a_page(): void
    {
        $page = CmsPage::factory()->create(['active' => true]);

        $this->actingAs($this->admin)->put("/admin/cms-pages/{$page->id}", ['active' => false])->assertRedirect();

        $this->assertDatabaseHas('cms_pages', ['id' => $page->id, 'active' => false]);
    }

    public function test_admin_can_delete_a_page(): void
    {
        $page = CmsPage::factory()->create();

        $this->actingAs($this->admin)->delete("/admin/cms-pages/{$page->id}")->assertRedirect();

        $this->assertDatabaseMissing('cms_pages', ['id' => $page->id]);
    }
}
