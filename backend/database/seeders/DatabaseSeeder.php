<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Field;
use App\Models\Reservation;
use App\Models\Review;
use App\Models\Subscription;
use App\Models\SubscriptionSession;
use App\Models\Payment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Default Users for Roles
        $admin = User::create([
            'name' => 'Admin NadorPlay',
            'email' => 'admin@nadorplay.ma',
            'phone' => '+212612345678',
            'role' => 'admin',
            'password' => Hash::make('password'),
        ]);

        $guard = User::create([
            'name' => 'Guard Hassan',
            'email' => 'guard@nadorplay.ma',
            'phone' => '+212623456789',
            'role' => 'guard',
            'password' => Hash::make('password'),
        ]);

        $org = User::create([
            'name' => 'Nador Football Academy',
            'email' => 'academy@nadorplay.ma',
            'phone' => '+212634567890',
            'role' => 'organization',
            'password' => Hash::make('password'),
        ]);

        $player = User::create([
            'name' => 'Chaymae Player',
            'email' => 'player@nadorplay.ma',
            'phone' => '+212645678901',
            'role' => 'user',
            'password' => Hash::make('password'),
        ]);

        // 2. Create Fields
        $field1 = Field::create([
            'name' => 'Marchica Premium Field',
            'location' => 'Marchica Corniche, Nador',
            'description' => 'A premium 11-a-side football field overlooking the Marchica lagoon. Fully illuminated with premium natural grass.',
            'price' => 300.00, // MAD per hour
            'surface' => 'Natural Grass',
            'dimensions' => '105m x 68m',
            'image' => 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
            'status' => 'available',
        ]);

        $field2 = Field::create([
            'name' => 'Al-Amal Mini Football Field',
            'location' => 'Al-Amal District, Nador',
            'description' => 'Perfect for 5-a-side or 7-a-side matches. Premium synthetic turf, enclosed fence, and goal nets.',
            'price' => 150.00, // MAD per hour
            'surface' => 'Artificial Turf',
            'dimensions' => '40m x 20m',
            'image' => 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=800&q=80',
            'status' => 'available',
        ]);

        $field3 = Field::create([
            'name' => 'Nador Municipal Stadium Arena',
            'location' => 'Nador Center',
            'description' => 'Professional stadium field with spectators seating. High-grade hybrid grass system suitable for tournaments.',
            'price' => 500.00,
            'surface' => 'Hybrid Grass',
            'dimensions' => '100m x 64m',
            'image' => 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80',
            'status' => 'available',
        ]);

        $field4 = Field::create([
            'name' => 'Sidi Ali Mini Turf',
            'location' => 'Sidi Ali, Nador',
            'description' => 'Synthetic turf field ideal for family games and friendly match meetups. Changing rooms and shower facilities available.',
            'price' => 180.00,
            'surface' => 'Artificial Turf',
            'dimensions' => '45m x 25m',
            'image' => 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&w=800&q=80',
            'status' => 'maintenance',
        ]);

        // 3. Create Reviews
        Review::create([
            'user_id' => $player->id,
            'field_id' => $field1->id,
            'rating' => 5,
            'comment' => 'Incredible pitch! Playing by the lagoon with the breeze is an amazing experience. Great lighting at night.',
        ]);

        Review::create([
            'user_id' => $player->id,
            'field_id' => $field2->id,
            'rating' => 4,
            'comment' => 'Good pitch for 5v5. Turf is in great condition, but parking is a bit hard to find.',
        ]);

        // 4. Create Reservations
        $res1 = Reservation::create([
            'user_id' => $player->id,
            'field_id' => $field1->id,
            'date' => Carbon::today()->toDateString(),
            'time' => '18:00',
            'duration' => 2,
            'number_of_players' => 14,
            'status' => 'confirmed',
            'payment_status' => 'paid',
        ]);
        
        $payload1 = json_encode([
            'reservation_id' => $res1->id,
            'field_id' => $field1->id,
            'user_id' => $player->id,
            'code' => md5($res1->id . $field1->id . $player->id . 'NadorPlaySecretSalt')
        ]);
        $res1->update(['qr_code' => $payload1]);

        Payment::create([
            'reservation_id' => $res1->id,
            'amount' => 600.00,
            'provider' => 'cmi',
            'transaction_id' => 'NP-SEEDEDPAY01',
            'status' => 'paid',
        ]);

        $res2 = Reservation::create([
            'user_id' => $player->id,
            'field_id' => $field2->id,
            'date' => Carbon::tomorrow()->toDateString(),
            'time' => '20:00',
            'duration' => 1,
            'number_of_players' => 10,
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);

        $payload2 = json_encode([
            'reservation_id' => $res2->id,
            'field_id' => $field2->id,
            'user_id' => $player->id,
            'code' => md5($res2->id . $field2->id . $player->id . 'NadorPlaySecretSalt')
        ]);
        $res2->update(['qr_code' => $payload2]);

        // 5. Academy Subscriptions
        $sub = Subscription::create([
            'organization_id' => $org->id,
            'field_id' => $field3->id,
            'start_date' => Carbon::today()->toDateString(),
            'end_date' => Carbon::today()->addMonths(3)->toDateString(),
            'total_price' => 4500.00,
            'status' => 'active',
        ]);

        SubscriptionSession::create([
            'subscription_id' => $sub->id,
            'day_of_week' => 1, // Monday
            'session_time' => '17:00:00',
        ]);

        SubscriptionSession::create([
            'subscription_id' => $sub->id,
            'day_of_week' => 3, // Wednesday
            'session_time' => '17:00:00',
        ]);

        Payment::create([
            'subscription_id' => $sub->id,
            'amount' => 4500.00,
            'provider' => 'stripe',
            'transaction_id' => 'NP-SEEDEDPAY02',
            'status' => 'paid',
        ]);
    }
}
