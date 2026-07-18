<?php

namespace Tests\Feature\Admin;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** REQ-ADM-10: view captured leads (out-of-area booking attempts). */
class AdminLeadTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
    }

    public function test_admin_can_view_captured_leads(): void
    {
        Lead::factory()->create(['postcode' => 'B99 9ZZ', 'phone' => '+447700900001']);
        Lead::factory()->create(['postcode' => 'B98 8YY', 'phone' => '+447700900002']);

        $response = $this->actingAs($this->admin)->get('/admin/leads');

        $response->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Leads/Index')
            ->has('leads.data', 2)
        );
    }

    public function test_leads_can_be_searched_by_postcode(): void
    {
        Lead::factory()->create(['postcode' => 'B99 9ZZ']);
        Lead::factory()->create(['postcode' => 'M1 1AA']);

        $response = $this->actingAs($this->admin)->get('/admin/leads?search=B99');

        $response->assertInertia(fn (Assert $page) => $page->has('leads.data', 1));
    }

    public function test_guest_cannot_view_leads(): void
    {
        $this->get('/admin/leads')->assertRedirect('/admin/login');
    }

    public function test_customer_cannot_view_leads(): void
    {
        $customer = User::factory()->customer()->create();

        $this->actingAs($customer)->get('/admin/leads')->assertForbidden();
    }
}
