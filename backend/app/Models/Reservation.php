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

    public static function hasConflict($fieldId, $date, $time, $duration = 1)
    {
        $newStart = \Carbon\Carbon::parse($date . ' ' . $time);
        $newEnd   = (clone $newStart)->addHours($duration);

        // 1. Check normal reservations overlap
        $normalConflict = self::where('field_id', $fieldId)
            ->where('date', $date)
            ->where('status', '!=', 'cancelled')
            ->where('reservation_type', 'normal')
            ->get()
            ->contains(function ($res) use ($newStart, $newEnd) {
                $resStart = \Carbon\Carbon::parse($res->date->format('Y-m-d') . ' ' . $res->time);
                $resEnd = $resStart->copy()->addHours($res->duration ?? 1);
                return $newStart->lt($resEnd) && $newEnd->gt($resStart);
            });

        if ($normalConflict) {
            return true;
        }

        // 2. Check subscription reservations overlap
        $subResConflict = self::where('field_id', $fieldId)
            ->where('date', $date)
            ->where('status', '!=', 'cancelled')
            ->where('reservation_type', 'subscription')
            ->get()
            ->contains(function ($res) use ($newStart, $newEnd) {
                $resStart = \Carbon\Carbon::parse($res->date->format('Y-m-d') . ' ' . $res->time);
                $resEnd = $resStart->copy()->addHours($res->duration ?? 1);
                return $newStart->lt($resEnd) && $newEnd->gt($resStart);
            });

        if ($subResConflict) {
            return true;
        }

        // 3. Check active subscriptions weekly sessions directly
        $dayOfWeek = \Carbon\Carbon::parse($date)->dayOfWeek;
        $activeSubs = \App\Models\Subscription::with('sessions')
            ->where('field_id', $fieldId)
            ->where('status', 'active')
            ->whereDate('start_date', '<=', $date)
            ->whereDate('end_date', '>=', $date)
            ->get();

        foreach ($activeSubs as $sub) {
            foreach ($sub->sessions as $sess) {
                if ((int)$sess->day_of_week === $dayOfWeek) {
                    $sessStart = \Carbon\Carbon::parse($date . ' ' . $sess->session_time);
                    $sessEnd   = $sessStart->copy()->addHour(); // sessions are always 1 hour
                    if ($newStart->lt($sessEnd) && $newEnd->gt($sessStart)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }
}
