<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'field_id',
        'subscription_id',
        'reservation_type',
        'date',
        'time',
        'duration',
        'number_of_players',
        'status',
        'check_in_status',
        'payment_status',
        'qr_code',
    ];

    protected $casts = [
        'date' => 'date',
        'time' => 'string',
        'duration' => 'integer',
        'number_of_players' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function field()
    {
        return $this->belongsTo(Field::class);
    }

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
