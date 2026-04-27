<?php

namespace App\Http\Requests\Regularisation;

use Illuminate\Foundation\Http\FormRequest;

class StoreRegularisationPositiveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('regularisations.creer') ;
    }

    public function rules(): array
    {
        return [
            'personnel_id' => 'required|exists:personnels,id',
            'quantite'     => 'required|numeric|min:0.01',
            'motif'        => 'required|string|max:255',
        ];
    }
}