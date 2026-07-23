<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Driver;
use App\Models\DriverTask;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Service;
use App\Models\ServiceArea;
use App\Models\Setting;
use App\Models\TimeSlot;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database with launch data for Clean Quick
     * Laundry's Phase 1 go-live: launch service areas, catalogue pricing,
     * a week of bookable time slots, and one admin + one driver account.
     */
    public function run(): void
    {
        // Areas span multiple countries — the postcode is just an outward-code
        // prefix ServiceAreaGate matches against, so any country's postal
        // format works the same way (see App\Services\Booking\ServiceAreaGate).
        $areas = collect([
            ['name' => 'Lozells', 'country' => 'United Kingdom', 'postcode' => 'B19'],
            ['name' => 'Handsworth', 'country' => 'United Kingdom', 'postcode' => 'B21'],
            ['name' => 'Newtown', 'country' => 'United Kingdom', 'postcode' => 'B6'],
            ['name' => 'Dhaka', 'country' => 'Bangladesh', 'postcode' => '1000'],
        ])->map(fn (array $area) => ServiceArea::query()->updateOrCreate(
            ['name' => $area['name']],
            ['country' => $area['country'], 'postcode' => $area['postcode'], 'active' => true]
        ));

        $windows = ['09:00-12:00', '12:00-15:00', '15:00-18:00'];

        $areas->each(function (ServiceArea $area) use ($windows) {
            for ($day = 0; $day < 7; $day++) {
                $date = Carbon::today()->addDays($day);

                foreach ($windows as $window) {
                    TimeSlot::query()->updateOrCreate(
                        [
                            'service_area_id' => $area->id,
                            'date' => $date->toDateString(),
                            'window' => $window,
                        ],
                        ['capacity' => 10]
                    );
                }
            }
        });

        $servicesData = [
            // Washers
            ['name' => 'Medium Washer (12KG)', 'category' => 'Washers', 'unit' => 'item', 'price' => 5.00, 'tat' => '24'],
            ['name' => 'Big Washer (15KG)', 'category' => 'Washers', 'unit' => 'item', 'price' => 6.00, 'tat' => '24'],
            ['name' => 'Bigger Washer (25KG)', 'category' => 'Washers', 'unit' => 'item', 'price' => 11.00, 'tat' => '24'],

            // Dryers
            ['name' => 'Medium Dryer (12KG • 10 min)', 'category' => 'Dryers', 'unit' => 'item', 'price' => 1.00, 'tat' => '24'],
            ['name' => 'Big Dryer (15KG • first 15 min)', 'category' => 'Dryers', 'unit' => 'item', 'price' => 2.00, 'tat' => '24'],
            ['name' => 'Bigger Dryer (25KG • per hr)', 'category' => 'Dryers', 'unit' => 'item', 'price' => 9.00, 'tat' => '24'],

            // Ironing
            ['name' => 'Shirts (Ironing)', 'category' => 'Ironing', 'unit' => 'item', 'price' => 1.50, 'tat' => '24'],
            ['name' => 'Pants (Ironing)', 'category' => 'Ironing', 'unit' => 'item', 'price' => 1.50, 'tat' => '24'],
            ['name' => 'Kurta / Thobes (Ironing)', 'category' => 'Ironing', 'unit' => 'item', 'price' => 1.50, 'tat' => '24'],
            ['name' => 'Ladies 3-Piece Suits (Ironing)', 'category' => 'Ironing', 'unit' => 'item', 'price' => 2.50, 'tat' => '24'],
            ['name' => 'Pillow Cover (Ironing)', 'category' => 'Ironing', 'unit' => 'item', 'price' => 0.50, 'tat' => '24'],
            ['name' => 'Duvet Cover (Ironing)', 'category' => 'Ironing', 'unit' => 'item', 'price' => 2.20, 'tat' => '24'],
            ['name' => 'Bed Sheet (Ironing)', 'category' => 'Ironing', 'unit' => 'item', 'price' => 1.80, 'tat' => '24'],
            ['name' => 'Tie (Ironing)', 'category' => 'Ironing', 'unit' => 'item', 'price' => 0.50, 'tat' => '24'],

            // Dry Cleaning
            ['name' => '3-Piece Suit', 'category' => 'Dry Cleaning', 'unit' => 'item', 'price' => 15.00, 'tat' => '48'],
            ['name' => '2-Piece Suit', 'category' => 'Dry Cleaning', 'unit' => 'item', 'price' => 13.00, 'tat' => '48'],
            ['name' => 'Trousers / Jeans', 'category' => 'Dry Cleaning', 'unit' => 'item', 'price' => 6.50, 'tat' => '48'],
            ['name' => 'Suit Jacket', 'category' => 'Dry Cleaning', 'unit' => 'item', 'price' => 9.00, 'tat' => '48'],
            ['name' => 'Shirts (Dry Cleaning)', 'category' => 'Dry Cleaning', 'unit' => 'item', 'price' => 4.00, 'tat' => '48'],
            ['name' => 'Jumpers / Hoodies', 'category' => 'Dry Cleaning', 'unit' => 'item', 'price' => 7.00, 'tat' => '48'],
            ['name' => 'Skirts', 'category' => 'Dry Cleaning', 'unit' => 'item', 'price' => 6.00, 'tat' => '48'],
            ['name' => 'Ties', 'category' => 'Dry Cleaning', 'unit' => 'item', 'price' => 4.00, 'tat' => '48'],
            ['name' => 'T-Shirts', 'category' => 'Dry Cleaning', 'unit' => 'item', 'price' => 6.00, 'tat' => '48'],
            ['name' => 'Tracksuit', 'category' => 'Dry Cleaning', 'unit' => 'item', 'price' => 13.00, 'tat' => '48'],
            ['name' => 'Winter Coat', 'category' => 'Dry Cleaning', 'unit' => 'item', 'price' => 12.00, 'tat' => '48'],
            ['name' => 'Short Coat', 'category' => 'Dry Cleaning', 'unit' => 'item', 'price' => 10.00, 'tat' => '48'],
            ['name' => 'Puffer Jacket', 'category' => 'Dry Cleaning', 'unit' => 'item', 'price' => 18.50, 'tat' => '48'],
            ['name' => 'Dress', 'category' => 'Dry Cleaning', 'unit' => 'item', 'price' => 11.00, 'tat' => '48'],
            ['name' => '2-Piece Asian Suit', 'category' => 'Dry Cleaning', 'unit' => 'item', 'price' => 20.00, 'tat' => '48'],
            ['name' => '3-Piece Asian Suit', 'category' => 'Dry Cleaning', 'unit' => 'item', 'price' => 25.00, 'tat' => '48'],
            ['name' => 'Saree', 'category' => 'Dry Cleaning', 'unit' => 'item', 'price' => 15.00, 'tat' => '48'],
            ['name' => '2-Piece Lehenga Suit', 'category' => 'Dry Cleaning', 'unit' => 'item', 'price' => 25.00, 'tat' => '48'],
            ['name' => '3-Piece Lehenga Suit', 'category' => 'Dry Cleaning', 'unit' => 'item', 'price' => 30.00, 'tat' => '48'],
            ['name' => 'Suede / Leather', 'category' => 'Dry Cleaning', 'unit' => 'item', 'price' => 30.00, 'tat' => '48'],
            ['name' => 'Blankets / Duvets', 'category' => 'Dry Cleaning', 'unit' => 'item', 'price' => 17.00, 'tat' => '48'],
        ];

        foreach ($servicesData as $s) {
            Service::query()->updateOrCreate(
                ['name' => $s['name']],
                [
                    'category' => $s['category'],
                    'unit' => $s['unit'],
                    'price' => $s['price'],
                    'tat' => $s['tat'],
                    'active' => true,
                ]
            );
        }

        $services = Service::query()->where('active', true)->get();

        // ── Super Admin ──────────────────────────────────────────────
        User::query()->updateOrCreate(
            ['email' => 'superadmin@cleanquicklaundry.com'],
            [
                'name' => 'Super Admin',
                'phone' => '+447000000000',
                'role' => 'super_admin',
                'language' => 'en',
                'password' => 'password',
            ]
        );

        // ── Admin ───────────────────────────────────────────────────
        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@cleanquicklaundry.com'],
            [
                'name' => 'Admin',
                'phone' => '+447000000001',
                'role' => 'admin',
                'language' => 'en',
                'password' => 'password',
            ]
        );

        // ── Driver ──────────────────────────────────────────────────
        $driverUser = User::query()->updateOrCreate(
            ['email' => 'driver@cleanquicklaundry.com'],
            [
                'name' => 'Dave Driver',
                'phone' => '+447000000002',
                'role' => 'driver',
                'language' => 'en',
                'password' => 'password',
            ]
        );

        $driver = Driver::query()->updateOrCreate(
            ['user_id' => $driverUser->id],
            [
                'vehicle_type' => 'van',
                'vehicle_number' => 'CQ21 VAN',
                'active' => true,
            ]
        );

        // ── Demo driver tasks (dashboard/history preview data) ──────
        $this->seedDemoDriverTasks($areas, $services, $driver);

        // ── Shop Staff ─────────────────────────────────────────────
        User::query()->updateOrCreate(
            ['email' => 'shop@cleanquicklaundry.com'],
            [
                'name' => 'Sam Shop',
                'phone' => '+447000000003',
                'role' => 'shop',
                'language' => 'en',
                'password' => 'password',
            ]
        );

        // ── Customer ────────────────────────────────────────────────
        User::query()->updateOrCreate(
            ['phone' => '+447700900555'],
            [
                'name' => 'Test Customer',
                'email' => 'customer@cleanquicklaundry.com',
                'role' => 'customer',
                'language' => 'en',
                'password' => null, // OTP-only account
            ]
        );

        // ── Business Client ────────────────────────────────────────
        User::query()->updateOrCreate(
            ['email' => 'business@cleanquicklaundry.com'],
            [
                'name' => 'Bravo Business',
                'phone' => '+447000000004',
                'role' => 'business_client',
                'language' => 'en',
                'password' => 'password',
            ]
        );

        // REQ-ADM-07 / NFR-04: centrally configurable currency, VAT rate, and delivery fee, GBP default.
        collect([
            'currency' => 'GBP',
            'vat_rate' => '20',
            'delivery_fee' => '2.50',
            'business_name' => 'Clean Quick Laundry',
            'business_phone' => '+441212345678',
            'opening_hours' => 'Mon-Sat 08:00-18:00',
        ])->each(fn (string $value, string $key) => Setting::query()->updateOrCreate(['key' => $key], ['value' => $value]));
    }

    /**
     * Give the seeded driver a realistic day of pickups/deliveries so the
     * driver portal (dashboard + history) isn't empty on a fresh install.
     */
    private function seedDemoDriverTasks($areas, $services, Driver $driver): void
    {
        $today = Carbon::today();

        $customer = fn (string $name, string $phone) => User::query()->updateOrCreate(
            ['phone' => $phone],
            ['name' => $name, 'role' => 'customer', 'language' => 'en', 'password' => null]
        );

        $address = fn (User $user, ServiceArea $area, string $label) => Address::query()->updateOrCreate(
            ['user_id' => $user->id, 'label' => $label],
            [
                'service_area_id' => $area->id,
                'postcode' => $area->postcode,
                'map_lat' => 52.49,
                'map_lng' => -1.90,
            ]
        );

        $slot = fn (ServiceArea $area, string $window, Carbon $date) => TimeSlot::query()
            ->where('service_area_id', $area->id)
            ->where('date', $date->toDateString())
            ->where('window', $window)
            ->first();

        $makeOrder = function (User $user, Address $addr, ?TimeSlot $timeSlot, string $status) use ($services) {
            $items = $services->random(2);
            $subtotal = $items->sum(fn (Service $s) => $s->price * 2);
            $vat = round($subtotal * 0.2, 2);
            $deliveryFee = 2.50;

            $order = Order::query()->create([
                'user_id' => $user->id,
                'address_id' => $addr->id,
                'time_slot_id' => $timeSlot?->id,
                'status' => $status,
                'subtotal' => $subtotal,
                'discount' => 0,
                'delivery_fee' => $deliveryFee,
                'vat' => $vat,
                'total' => $subtotal + $vat + $deliveryFee,
            ]);

            $items->each(fn (Service $service) => OrderItem::query()->create([
                'order_id' => $order->id,
                'service_id' => $service->id,
                'qty' => 2,
                'unit_price' => $service->price,
                'line_total' => $service->price * 2,
            ]));

            return $order;
        };

        [$areaA, $areaB, $areaC] = [$areas->get(0), $areas->get(1), $areas->get(2)];

        $priya = $customer('Priya Kaur', '+447700900101');
        $tom = $customer('Tom Bennett', '+447700900102');
        $aisha = $customer('Aisha Begum', '+447700900103');
        $marcus = $customer('Marcus Reid', '+447700900104');
        $lily = $customer('Lily Osei', '+447700900105');

        // ── Today: two pending pickups awaiting collection ──────────
        // Orders must be 'assigned' (not 'confirmed') so the driver's pickup
        // action can legally transition them to 'picked_up' via OrderStatusMachine.
        $order1 = $makeOrder($priya, $address($priya, $areaA, 'Home'), $slot($areaA, '09:00-12:00', $today), 'assigned');
        DriverTask::query()->create([
            'order_id' => $order1->id, 'driver_id' => $driver->id, 'type' => 'pickup', 'status' => 'pending',
            'scheduled_at' => $today->copy()->setTime(9, 30),
        ]);

        $order2 = $makeOrder($tom, $address($tom, $areaB, 'Home'), $slot($areaB, '09:00-12:00', $today), 'assigned');
        DriverTask::query()->create([
            'order_id' => $order2->id, 'driver_id' => $driver->id, 'type' => 'pickup', 'status' => 'pending',
            'scheduled_at' => $today->copy()->setTime(10, 0),
        ]);

        // ── Today: a delivery already en route ──────────────────────
        $order3 = $makeOrder($aisha, $address($aisha, $areaC, 'Work'), $slot($areaC, '12:00-15:00', $today), 'out_for_delivery');
        DriverTask::query()->create([
            'order_id' => $order3->id, 'driver_id' => $driver->id, 'type' => 'delivery', 'status' => 'en_route',
            'otp' => '4821', 'scheduled_at' => $today->copy()->setTime(12, 30),
        ]);

        // ── Today: one completed delivery, one failed pickup ────────
        $order4 = $makeOrder($marcus, $address($marcus, $areaA, 'Home'), $slot($areaA, '09:00-12:00', $today), 'delivered');
        DriverTask::query()->create([
            'order_id' => $order4->id, 'driver_id' => $driver->id, 'type' => 'delivery', 'status' => 'completed',
            'payment_method' => 'cash', 'cod_amount' => $order4->total,
            'scheduled_at' => $today->copy()->setTime(9, 45), 'completed_at' => $today->copy()->setTime(10, 5),
        ]);

        $order5 = $makeOrder($lily, $address($lily, $areaB, 'Home'), $slot($areaB, '12:00-15:00', $today), 'assigned');
        DriverTask::query()->create([
            'order_id' => $order5->id, 'driver_id' => $driver->id, 'type' => 'pickup', 'status' => 'failed',
            'failure_reason' => 'Customer not home, no answer after two attempts.',
            'scheduled_at' => $today->copy()->setTime(13, 0), 'completed_at' => $today->copy()->setTime(13, 15),
        ]);

        // ── Yesterday: completed history entries ────────────────────
        $yesterday = $today->copy()->subDay();
        $order6 = $makeOrder($priya, $address($priya, $areaA, 'Home'), null, 'delivered');
        DriverTask::query()->create([
            'order_id' => $order6->id, 'driver_id' => $driver->id, 'type' => 'delivery', 'status' => 'completed',
            'payment_method' => 'card', 'cod_amount' => $order6->total,
            'scheduled_at' => $yesterday->copy()->setTime(11, 0), 'completed_at' => $yesterday->copy()->setTime(11, 20),
        ]);

        $order7 = $makeOrder($tom, $address($tom, $areaB, 'Home'), null, 'picked_up');
        DriverTask::query()->create([
            'order_id' => $order7->id, 'driver_id' => $driver->id, 'type' => 'pickup', 'status' => 'completed',
            'item_count' => 6, 'weight' => 3.5,
            'scheduled_at' => $yesterday->copy()->setTime(15, 30), 'completed_at' => $yesterday->copy()->setTime(15, 45),
        ]);
    }
}
