<?php

namespace App\Services;

use App\Models\Personnel;
use App\Models\Localite;
use App\Models\Site;
use App\Models\Section;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;

class PersonnelImportService
{
    public function __construct(protected MatriculeGenerator $matriculeGenerator) {}

    /**
     * Prévisualise un import de personnel.
     */
    public function preview(UploadedFile $file): array
    {
        $rows = $this->parseCsv($file);
        $validRows = [];
        $errorRows = [];
        $batchId = 'BATCH-' . now()->format('Ymd-His');

        foreach ($rows as $index => $row) {
            $validator = Validator::make($row, $this->rules());
            if ($validator->fails()) {
                $errorRows[] = [
                    'row'    => $index + 1,
                    'data'   => $row,
                    'errors' => $validator->errors()->all(),
                ];
                continue;
            }

            // Vérification CNIB unique
            if (Personnel::where('num_cnib', $row['num_cnib'])->exists()) {
                $errorRows[] = [
                    'row'    => $index + 1,
                    'data'   => $row,
                    'errors' => ['La CNIB existe déjà.'],
                ];
                continue;
            }

            // Résolution des référentiels
            $localite = Localite::where('code_localite', $row['code_localite'])->first();
            $site = Site::where('code_site', $row['code_site'])->first();
            $section = Section::where('code_section', $row['code_section'])->first();

            if (!$localite || !$site || !$section) {
                $errorRows[] = [
                    'row'    => $index + 1,
                    'data'   => $row,
                    'errors' => ['Référentiel introuvable (localité, site ou section).'],
                ];
                continue;
            }

            $row['localite_domicile_id'] = $localite->id;
            $row['site_travail_id']      = $site->id;
            $row['section_defaut_id']    = $section->id;
            $row['import_batch']         = $batchId;

            unset($row['code_localite'], $row['code_site'], $row['code_section']);

            $validRows[] = $row;
        }

        return [
            'valid'  => $validRows,
            'errors' => $errorRows,
            'batch'  => $batchId,
        ];
    }

    /**
     * Importe les lignes validées.
     */
    public function import(array $validRows): void
    {
        foreach ($validRows as $row) {
            $site = Site::find($row['site_travail_id']);
            $row['matricule'] = $this->matriculeGenerator->generate($site->code_site);
            Personnel::create($row);
        }
    }

    private function rules(): array
    {
        return [
            'nom'             => 'required|string|max:255',
            'prenom'          => 'required|string|max:255',
            'surnom'          => 'nullable|string|max:255',
            'sexe'            => 'required|in:M,F',
            'date_naissance'  => 'required|date',
            'lieu_naissance'  => 'required|string|max:255',
            'num_cnib'        => 'required|string|max:255',
            'telephone'       => 'required|string|max:20',
            'code_localite'   => 'required|string|max:255',
            'code_site'       => 'required|string|max:255',
            'code_section'    => 'required|string|max:255',
            'preference_paiement' => 'required|in:ESPECES,WAVE',
        ];
    }

    private function parseCsv(UploadedFile $file): Collection
    {
        $handle = fopen($file->getRealPath(), 'r');
        $header = fgetcsv($handle);
        $rows = collect();

        while (($data = fgetcsv($handle)) !== false) {
            if (count($header) === count($data)) {
                $rows->push(array_combine($header, $data));
            }
        }
        fclose($handle);

        return $rows;
    }
}