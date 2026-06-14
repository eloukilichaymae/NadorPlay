<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SubscriptionSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'subscription_id',
        'day_of_week',
        'session_time',
    ];

    protected $casts = [
        'day_of_week' => 'integer',
    ];

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }
}
