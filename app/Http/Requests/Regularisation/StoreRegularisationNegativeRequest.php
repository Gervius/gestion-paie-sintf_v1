<?php

namespace App\Http\Requests\Regularisation;

use Illuminate\Foundation\Http\FormRequest;

class StoreRegularisationNegativeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('regularisations.creer') ;
    }

    public function rules(): array
    {
        return [
            'motif'            => 'required|string|max:255',
            'montant_trop_percu' => 'nullable|numeric|min:0.01',
        ];
    }
}