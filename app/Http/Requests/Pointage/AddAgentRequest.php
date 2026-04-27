<?php

namespace App\Http\Requests\Pointage;

use Illuminate\Foundation\Http\FormRequest;

class AddAgentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('pointages.modifier');
    }

    public function rules(): array
    {
        return ['personnel_id' => 'required|exists:personnels,id'];
    }
}