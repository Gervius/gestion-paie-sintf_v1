<?php

namespace App\Http\Requests\Permission;

use Illuminate\Foundation\Http\FormRequest;

class StorePermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('gerer_utilisateurs') || $this->user()->can('*');
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:permissions,name',
        ];
    }
}