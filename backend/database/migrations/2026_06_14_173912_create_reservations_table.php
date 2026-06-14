<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('field_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->time('time');
            $table->integer('duration')->default(1); // in hours
            $table->integer('number_of_players')->nullable();
            $table->string('status')->default('pending'); // pending, confirmed, cancelled
            $table->string('payment_status')->default('pending'); // pending, paid, failed, refunded
            $table->text('qr_code')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['field_id', 'date', 'time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
