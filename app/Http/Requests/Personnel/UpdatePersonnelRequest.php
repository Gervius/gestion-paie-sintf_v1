<?php

namespace App\Http\Requests\Personnel;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePersonnelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('modifier_personnel') || $this->user()->can('*');
    }

    public function rules(): array
    {
        $personnelId = $this->route('personnel')->id;

        return [
            'nom'                  => 'required|string|max:255',
            'prenom'               => 'required|string|max:255',
            'surnom'               => 'nullable|string|max:255',
            'sexe'                 => 'required|in:M,F',
            'date_naissance'       => 'required|date',
            'lieu_naissance'       => 'required|string|max:255',
            'num_acte_naissance'   => 'nullable|string|max:255',
            'num_cnib'             => ['required', 'string', 'max:255', Rule::unique('personnels')->ignore($personnelId)],
            'date_cnib'            => 'nullable|date',
            'lieu_cnib'            => 'nullable|string|max:255',
            'num_cnss'             => 'nullable|string|max:255',
            'telephone'            => 'required|string|max:20',
            'tel_compte_wave'      => 'nullable|string|max:20',
            'est_marie'            => 'boolean',
            'nb_charge'            => 'integer|min:0',
            'niveau_etude'         => 'nullable|string|max:255',
            'classification'       => 'nullable|string|max:255',
            'localite_domicile_id' => 'required|exists:localites,id',
            'site_travail_id'      => 'required|exists:sites,id',
            'section_defaut_id'    => 'required|exists:sections,id',
            'preference_paiement'  => 'required|in:ESPECES,WAVE',
            'actif'                => 'boolean',
        ];
    }
}