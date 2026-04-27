<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('utilisateurs.modifier');
    }

    public function rules(): array
    {
        $userId = $this->route('user')->id;

        return [
            'name'      => 'required|string|max:255',
            'email'     => 'required|string|email|max:255|unique:users,email,' . $userId,
            'password'  => ['nullable', 'confirmed', Password::defaults()],
            'site_id'   => 'nullable|exists:sites,id',
            'roles'     => 'nullable|array',
            'roles.*'   => 'exists:roles,name',
            'site_ids'  => 'nullable|array',
            'site_ids.*'=> 'exists:sites,id',
        ];
    }
}