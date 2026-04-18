<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['username' => 'admin'],
            [
                'name'     => 'Administrateur',
                'email'    => 'admin@sintf.bf',
                'password' => Hash::make('password'),
            ]
        );

        $admin->assignRole('Super Admin');
    }
}