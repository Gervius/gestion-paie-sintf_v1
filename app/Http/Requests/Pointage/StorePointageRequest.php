<?php

namespace App\Http\Requests\Pointage;

use Illuminate\Foundation\Http\FormRequest;
use Carbon\Carbon;

class StorePointageRequest extends FormRequest
{
    public function authorize(): bool
    {
        // On retourne true ici, car la sécurité est gérée par la Policy dans le Controller
        return true; 
    }

    public function rules(): array
    {
        return [
            'site_id'       => 'required|exists:sites,id',
            'section_id'    => 'required|exists:sections,id',
            'date'          => 'required|date|before_or_equal:today',
            'type_pointage' => 'required|in:JOURNALIER,RENDEMENT',
        ];
    }

    public function getSiteId(): int { return (int) $this->input('site_id'); }
    public function getSectionId(): int { return (int) $this->input('section_id'); }
    public function getDate(): Carbon { return Carbon::parse($this->input('date')); }
    public function getTypePointage(): string { return $this->input('type_pointage'); }
}