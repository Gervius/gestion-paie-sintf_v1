<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckFirstLogin
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        // Si l'utilisateur est connecté, qu'il doit changer son pass, et qu'il n'est pas DÉJÀ sur la page de setup ou de déconnexion
        if ($user && $user->must_change_password && !$request->routeIs('profileFirstLogin*') && !$request->routeIs('logout')) {
            return redirect()->route('profileFirstLoginView');
        }

        return $next($request);
    }
}