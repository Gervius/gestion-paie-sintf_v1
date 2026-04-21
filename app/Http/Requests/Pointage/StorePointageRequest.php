<?php

namespace App\Http\Requests\Pointage;

use Illuminate\Foundation\Http\FormRequest;
use Carbon\Carbon;

class StorePointageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('creer_pointage') || $this->user()->can('*');
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