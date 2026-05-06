<?php

namespace App\Http\Requests\Personnel;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePersonnelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('personnels.modifier');
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
            'sans_cnib'            => 'boolean',
            'date_cnib'            => 'nullable|date',
            'lieu_cnib'            => 'nullable|string|max:255',
            'num_cnss'             => 'nullable|string|max:255',
            'date_cnss'            => 'nullable|date',
            'telephone'            => 'required_if:a_telephone_propre,true|nullable|string|max:20',
            'a_telephone_propre'   => 'boolean',
            'telephone_sc'         => 'required_if:a_telephone_propre,false|nullable|string|max:20',
            'lien_telephone_sc'    => 'required_if:a_telephone_propre,false|nullable|string|max:255',
            'tel_compte_wave'      => 'nullable|string|max:255',
            'est_marie'            => 'boolean',
            'nb_charge'            => 'nullable|integer|min:0',
            'niveau_etude'         => 'nullable|string|max:255',
            'classification'       => 'nullable|string|max:255',
            'localite_domicile_id' => 'required|exists:localites,id',
            'site_travail_id'      => 'required|exists:sites,id',
            'section_defaut_id'    => 'nullable|exists:sections,id',
            'preference_paiement'  => 'required|in:ESPECES,WAVE',
            'actif'                => 'boolean',
        ];
    }
}