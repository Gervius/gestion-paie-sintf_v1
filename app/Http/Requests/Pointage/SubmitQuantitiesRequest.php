<?php

namespace App\Http\Requests\Pointage;

use Illuminate\Foundation\Http\FormRequest;

class SubmitQuantitiesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('cloturer_pointage') || $this->user()->can('*');
    }

    public function rules(): array
    {
        return [
            'quantities'               => 'required|array',
            'quantities.*.ligne_id'    => 'required|integer|exists:pointage_lignes,id',
            'quantities.*.quantite'    => 'required|numeric|min:0',
        ];
    }
}