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
        Schema::create('fields', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('location');
            $table->text('description')->nullable();
            $table->decimal('price', 8, 2);
            $table->string('surface'); // e.g. Natural Grass, Artificial Turf, Tartan
            $table->string('dimensions'); // e.g. 40x20m, 100x64m
            $table->string('image')->nullable();
            $table->string('status')->default('available'); // available, maintenance, closed
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fields');
    }
};
