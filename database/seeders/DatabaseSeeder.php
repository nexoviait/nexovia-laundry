<?php

namespace Database\Seeders;

use App\Models\Driver;
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
        $areas = collect([
            ['name' => 'Lozells', 'postcode' => 'B19'],
            ['name' => 'Handsworth', 'postcode' => 'B21'],
            ['name' => 'Newtown', 'postcode' => 'B6'],
        ])->map(fn (array $area) => ServiceArea::query()->updateOrCreate(
            ['name' => $area['name']],
            ['postcode' => $area['postcode'], 'active' => true]
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

        collect([
            ['name' => 'Shirt', 'unit' => 'item', 'price' => 2.50, 'tat' => '24h'],
            ['name' => 'Trousers', 'unit' => 'item', 'price' => 3.00, 'tat' => '24h'],
            ['name' => 'Bedsheet', 'unit' => 'item', 'price' => 4.00, 'tat' => '48h'],
            ['name' => 'Jacket', 'unit' => 'item', 'price' => 6.50, 'tat' => '48h'],
            ['name' => 'Dress', 'unit' => 'item', 'price' => 5.00, 'tat' => '48h'],
            ['name' => 'Duvet (wash & dry)', 'unit' => 'kg', 'price' => 8.00, 'tat' => '48h'],
        ])->each(fn (array $service) => Service::query()->updateOrCreate(
            ['name' => $service['name']],
            ['unit' => $service['unit'], 'price' => $service['price'], 'tat' => $service['tat'], 'active' => true]
        ));

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

        Driver::query()->updateOrCreate(
            ['user_id' => $driverUser->id],
            [
                'vehicle_type' => 'van',
                'vehicle_number' => 'CQ21 VAN',
                'active' => true,
            ]
        );

        // REQ-ADM-07 / NFR-04: centrally configurable VAT rate and delivery fee, GBP default.
        collect([
            'vat_rate' => '20',
            'delivery_fee' => '2.50',
        ])->each(fn (string $value, string $key) => Setting::query()->updateOrCreate(['key' => $key], ['value' => $value]));
    }
}
