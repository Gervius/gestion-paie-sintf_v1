<?php

namespace App\Concerns;

trait HasCentimesAttributes
{
    /**
     * Récupère la valeur en francs à partir de la colonne centimes.
     * Si la colonne centimes est nulle ou absente, utilise l'ancienne colonne (fallback).
     * Retourne null si aucune valeur n'est disponible.
     */
    protected function getFrancsFromCentimes(string $centimesField, string $fallbackField): ?float
    {
        $centimesValue = array_key_exists($centimesField, $this->attributes) ? $this->attributes[$centimesField] : null;
        $fallbackValue = array_key_exists($fallbackField, $this->attributes) ? $this->attributes[$fallbackField] : null;

        // 🚨 LE BOUCLIER ANTI-BUG FANTÔME 🚨
        // Si la BDD renvoie 0 centimes, mais que l'ancien champ a une valeur valide (> 0),
        // cela signifie qu'un Bulk Update (upsert) a rempli l'ancienne colonne en by-passant le mutateur.
        if ($centimesValue === 0 && !empty($fallbackValue)) {
            return (float) $fallbackValue;
        }

        // Fonctionnement normal
        if ($centimesValue !== null) {
            return (float) $centimesValue / 100;
        }

        // Fallback classique si la colonne centimes est totalement absente
        if ($fallbackValue !== null) {
            return (float) $fallbackValue;
        }

        return null;
    }

    /**
     * Stocke la valeur en centimes à partir d'un montant en francs.
     * Met également à jour l'ancien champ pour la rétrocompatibilité.
     */
    protected function setCentimesFromFrancs($value, string $centimesField, string $fallbackField): void
    {
        $this->attributes[$centimesField] = is_numeric($value) ? (int) round($value * 100) : 0;
        // Conservation de l'ancien champ (pratique pour les migrations progressives)
        $this->attributes[$fallbackField] = $value;
    }
}