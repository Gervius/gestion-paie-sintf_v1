<?php

use App\Models\Societe;

if (!function_exists('societe')) {
    /**
     * Retourne l'instance unique de la société.
     */
    function societe(): ?Societe
    {
        return Societe::first();
    }
}