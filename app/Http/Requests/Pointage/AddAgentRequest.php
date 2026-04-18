<?php

namespace App\Http\Requests\Pointage;

use Illuminate\Foundation\Http\FormRequest;

class AddAgentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('modifier_brouillon') || $this->user()->can('*');
    }

    public function rules(): array
    {
        return ['personnel_id' => 'required|exists:personnels,id'];
    }
}