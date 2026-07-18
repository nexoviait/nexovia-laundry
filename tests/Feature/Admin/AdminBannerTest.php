<?php

namespace Tests\Feature\Admin;

use App\Models\Banner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** REQ-ADM-08: manage homepage banners. */
class AdminBannerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
        Storage::fake('public');
    }

    public function test_admin_can_view_banners(): void
    {
        Banner::factory()->create(['title' => 'Summer Sale']);

        $this->actingAs($this->admin)->get('/admin/banners')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Banners/Index')
                ->has('banners.data', 1)
            );
    }

    public function test_admin_can_create_a_banner_with_an_image(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/banners', [
            'title' => 'Summer Sale',
            'image' => UploadedFile::fake()->image('banner.jpg'),
            'link' => 'https://example.com/sale',
            'sort_order' => 1,
        ]);

        $response->assertRedirect();
        $banner = Banner::firstWhere('title', 'Summer Sale');
        $this->assertNotNull($banner);
        $this->assertTrue($banner->active);
        Storage::disk('public')->assertExists($banner->image_path);
    }

    public function test_banner_creation_requires_an_image(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/banners', ['title' => 'No Image'], ['Accept' => 'application/json'])
            ->assertJsonValidationErrors('image');
    }

    public function test_admin_can_toggle_a_banner_active_state(): void
    {
        $banner = Banner::factory()->create(['active' => true]);

        $this->actingAs($this->admin)->put("/admin/banners/{$banner->id}", ['active' => false])->assertRedirect();

        $this->assertDatabaseHas('banners', ['id' => $banner->id, 'active' => false]);
    }

    public function test_admin_can_delete_a_banner_and_its_image(): void
    {
        $path = UploadedFile::fake()->image('b.jpg')->store('banners', 'public');
        $banner = Banner::factory()->create(['image_path' => $path]);

        $this->actingAs($this->admin)->delete("/admin/banners/{$banner->id}")->assertRedirect();

        $this->assertDatabaseMissing('banners', ['id' => $banner->id]);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_guest_cannot_manage_banners(): void
    {
        $this->get('/admin/banners')->assertRedirect('/admin/login');
    }
}
