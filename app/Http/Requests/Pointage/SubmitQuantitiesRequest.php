<?php

namespace App\Http\Requests\Pointage;

use Illuminate\Foundation\Http\FormRequest;

class SubmitQuantitiesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('pointages.soumettre');
    }

    public function rules(): array
    {
        return [
            'quantities'                  => 'required|array',
            'quantities.*.ligne_id'       => 'required|integer|exists:pointage_lignes,id',
            'quantities.*.quantite'       => 'required|numeric|min:0',
            'quantities.*.moyen_paiement' => 'required|string|in:WAVE,ESPECES', 
        ];
    }
}