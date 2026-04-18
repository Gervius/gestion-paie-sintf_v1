<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class CsvImportService
{
    /**
     * Prévisualise un fichier CSV sans insérer en base.
     *
     * @return array{valid: array, errors: array}
     */
    public function preview(UploadedFile $file, string $modelClass, array $rules, array $uniqueFields): array
    {
        $rows = $this->parseCsv($file);
        $validRows = [];
        $errorRows = [];

        foreach ($rows as $index => $row) {
            $validator = Validator::make($row, $rules);
            if ($validator->fails()) {
                $errorRows[] = [
                    'row'    => $index + 1,
                    'data'   => $row,
                    'errors' => $validator->errors()->all(),
                ];
                continue;
            }

            // Vérification d'unicité sur les champs spécifiés
            $query = $modelClass::query();
            foreach ($uniqueFields as $field) {
                $query->where($field, $row[$field]);
            }
            if ($query->exists()) {
                $errorRows[] = [
                    'row'    => $index + 1,
                    'data'   => $row,
                    'errors' => ["Une entrée avec les mêmes valeurs uniques existe déjà."],
                ];
                continue;
            }

            $validRows[] = $row;
        }

        return [
            'valid'  => $validRows,
            'errors' => $errorRows,
        ];
    }

    /**
     * Importe les lignes validées.
     */
    public function import(array $validRows, string $modelClass): void
    {
        foreach ($validRows as $row) {
            $modelClass::create($row);
        }
    }

    /**
     * Parse un fichier CSV en collection associative.
     */
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