<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    @php
        $dbName = \Illuminate\Support\Facades\Schema::hasTable('settings')
            ? (\App\Models\Setting::where('key', 'business_name')->value('value') ?: 'Clean Quick Laundry')
            : 'Clean Quick Laundry';
        $faviconUrl = \Illuminate\Support\Facades\Schema::hasTable('settings')
            ? (\App\Models\Setting::where('key', 'business_favicon')->value('value') ?: '/favicon.ico')
            : '/favicon.ico';
    @endphp
    <title inertia>{{ $dbName }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet">
    <link rel="icon" href="{{ $faviconUrl }}">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="antialiased font-sans">
    @inertia
</body>
</html>
