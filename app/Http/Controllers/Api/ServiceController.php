<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceResource;
use App\Models\Service;

/**
 * REQ-CUST-04/05: browse services and per-piece prices. Public — no
 * booking should require signing up first to see the price list.
 */
class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::query()
            ->where('active', true)
            ->orderBy('name')
            ->get();

        return ServiceResource::collection($services);
    }
}
