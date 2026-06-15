<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->foreignId('subscription_id')->nullable()->constrained('subscriptions')->onDelete('set null')->after('field_id');
            $table->string('reservation_type')->default('normal')->after('subscription_id'); // normal, subscription
            $table->string('check_in_status')->default('pending')->after('status');         // pending, checked_in, absent
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropForeign(['subscription_id']);
            $table->dropColumn(['subscription_id', 'reservation_type', 'check_in_status']);
        });
    }
};
