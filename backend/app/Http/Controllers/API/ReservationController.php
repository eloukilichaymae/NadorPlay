<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Field;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ReservationController extends Controller
{
    private function trackAbsences(): void
    {
        DB::statement("
            UPDATE reservations
            SET check_in_status = 'absent'
            WHERE reservation_type = 'subscription'
              AND check_in_status = 'pending'
              AND (
                date < CURDATE()
                OR (date = CURDATE() AND time < ADDTIME(CURTIME(), '-00:30:00'))
              )
        ");
    }

    public function index(Request $request)
    {
        $user  = $request->user();
        $query = Reservation::with(['field', 'user']);

        if ($user->role === 'user') {
            $query->where('user_id', $user->id);
        } elseif ($user->role === 'guard') {
            $this->trackAbsences();
            $query->where('date', Carbon::today()->toDateString());
        } elseif ($user->role === 'organization') {
            $this->trackAbsences();
            $query->where('user_id', $user->id)
                  ->where('reservation_type', 'subscription');
        }
        // admin sees all

        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }
        if ($request->has('date') && $request->date != '') {
            $query->where('date', $request->date);
        }
        if ($request->has('check_in_status') && $request->check_in_status != '') {
            $query->where('check_in_status', $request->check_in_status);
        }

        $reservations = $query->orderBy('date', 'desc')->orderBy('time', 'asc')->paginate(10);

        return response()->json([
            'success' => true,
            'data'    => $reservations
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'field_id'         => 'required|exists:fields,id',
            'date'             => 'required|date|after_or_equal:today',
            'time'             => 'required|date_format:H:i',
            'duration'         => 'required|integer|min:1|max:4',
            'number_of_players'=> 'required|integer|min:2|max:30',
            'user_id'          => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        $fieldId  = $request->field_id;
        $date     = $request->date;
        $time     = $request->time;
        $duration = $request->duration;

        $selectedDateTime = Carbon::parse($date . ' ' . $time);
        if ($selectedDateTime->isToday() && $selectedDateTime->lt(Carbon::now())) {
            return response()->json([
                'success' => false,
                'message' => 'The selected reservation time has already passed.'
            ], 400);
        }

        $field = Field::find($fieldId);
        if ($field->status !== 'available') {
            return response()->json([
                'success' => false,
                'message' => 'The field is currently not available for bookings.'
            ], 400);
        }

        $newStart = Carbon::parse($date . ' ' . $time);
        $newEnd   = (clone $newStart)->addHours($duration);

        $existingReservations = Reservation::where('field_id', $fieldId)
            ->where('date', $date)
            ->where('status', '!=', 'cancelled')
            ->get();

        foreach ($existingReservations as $exist) {
            $existStart = Carbon::parse($exist->date->format('Y-m-d') . ' ' . $exist->time);
            $existEnd   = (clone $existStart)->addHours($exist->duration);
            if ($newStart->lt($existEnd) && $newEnd->gt($existStart)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Time slot conflict. Field already reserved from ' . $existStart->format('H:i') . ' to ' . $existEnd->format('H:i') . '.'
                ], 400);
            }
        }

        $user       = $request->user();
        $targetUser = ($user->role === 'admin' && $request->filled('user_id'))
            ? \App\Models\User::find($request->user_id)
            : $user;

        $reservation = Reservation::create([
            'user_id'           => $targetUser->id,
            'field_id'          => $fieldId,
            'subscription_id'   => null,
            'reservation_type'  => 'normal',
            'date'              => $date,
            'time'              => $time,
            'duration'          => $duration,
            'number_of_players' => $request->number_of_players,
            'status'            => 'pending',
            'check_in_status'   => 'pending',
            'payment_status'    => 'unpaid',
            'qr_code'           => null,
        ]);

        Notification::create([
            'user_id' => $targetUser->id,
            'title'   => 'Reservation Created',
            'message' => "Your reservation for {$field->name} on {$date} at {$time} is pending approval."
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Reservation created successfully. Awaiting administrator approval.',
            'data'    => $reservation->load('field')
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $reservation = Reservation::with(['field', 'user'])->find($id);

        if (!$reservation) {
            return response()->json(['success' => false, 'message' => 'Reservation not found'], 404);
        }

        $user = $request->user();
        if ($user->role === 'user' && $reservation->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access'], 403);
        }

        return response()->json([
            'success' => true,
            'data'    => $reservation
        ]);
    }

    public function cancel(Request $request, $id)
    {
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json(['success' => false, 'message' => 'Reservation not found'], 404);
        }

        $user = $request->user();
        if ($user->role === 'user' && $reservation->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized action'], 403);
        }

        if ($reservation->status === 'cancelled') {
            return response()->json(['success' => false, 'message' => 'Reservation is already cancelled'], 400);
        }

        $reservation->update([
            'status'         => 'cancelled',
            'payment_status' => $reservation->payment_status === 'paid' ? 'refunded' : $reservation->payment_status
        ]);

        Notification::create([
            'user_id' => $reservation->user_id,
            'title'   => 'Reservation Cancelled',
            'message' => "Your reservation for field #{$reservation->field_id} on {$reservation->date->format('Y-m-d')} has been cancelled."
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Reservation cancelled successfully',
            'data'    => $reservation
        ]);
    }

    public function approve(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only administrators can approve reservations.'
            ], 403);
        }

        $reservation = Reservation::with(['field', 'user'])->find($id);

        if (!$reservation) {
            return response()->json(['success' => false, 'message' => 'Reservation not found'], 404);
        }

        if ($reservation->status === 'cancelled') {
            return response()->json(['success' => false, 'message' => 'Cannot approve a cancelled reservation.'], 400);
        }

        $qrPayload = json_encode([
            'Reservation ID' => $reservation->id,
            'Client Name'    => $reservation->user->name,
            'Field Name'     => $reservation->field->name,
            'Date'           => $reservation->date->format('Y-m-d'),
            'Time'           => $reservation->time,
            'Duration'       => $reservation->duration,
            'Status'         => 'confirmed'
        ]);

        $reservation->update([
            'status'         => 'confirmed',
            'payment_status' => 'paid',
            'qr_code'        => $qrPayload
        ]);

        Notification::create([
            'user_id' => $reservation->user_id,
            'title'   => 'Reservation Approved',
            'message' => 'Your reservation has been accepted.'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Reservation approved successfully.',
            'data'    => $reservation
        ]);
    }

    public function verifyQr(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'guard' && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only guards or admins can verify QR codes.'
            ], 403);
        }

        // Accept both field names for backward compatibility
        $rawPayload = $request->qr_payload ?? $request->code ?? null;

        $validator = Validator::make(['qr_payload' => $rawPayload], [
            'qr_payload' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = json_decode($rawPayload, true);

        // Resolve reservation ID from either QR format
        $reservationId = $data['reservation_id'] ?? $data['Reservation ID'] ?? null;

        if (!$reservationId) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid QR Code. Reservation ID not found.'
            ], 400);
        }

        $reservation = Reservation::with(['user', 'field'])->find($reservationId);

        if (!$reservation) {
            return response()->json(['success' => false, 'message' => 'Reservation not found.'], 404);
        }

        // --- Subscription reservation flow ---
        if ($reservation->reservation_type === 'subscription') {
            if ($reservation->status !== 'accepted') {
                return response()->json([
                    'success' => false,
                    'message' => 'This subscription session is not in accepted status.'
                ], 400);
            }

            if ($reservation->date->format('Y-m-d') !== Carbon::today()->format('Y-m-d')) {
                return response()->json([
                    'success' => false,
                    'message' => 'This session is not scheduled for today.'
                ], 400);
            }

            if ($reservation->check_in_status === 'checked_in') {
                return response()->json([
                    'success' => true,
                    'message' => 'Organization already checked in for this session.',
                    'data'    => $reservation
                ]);
            }

            // Reject check-in more than 30 minutes after session start
            $sessionStart = Carbon::parse($reservation->date->format('Y-m-d') . ' ' . $reservation->time);
            $cutoff       = $sessionStart->copy()->addMinutes(30);
            if (Carbon::now()->gt($cutoff)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Check-in window has closed. More than 30 minutes have passed since the session started.'
                ], 400);
            }

            $reservation->update(['check_in_status' => 'checked_in']);

            Notification::create([
                'user_id' => $reservation->user_id,
                'title'   => 'Session Check-In Confirmed',
                'message' => "Your training session at {$reservation->field->name} on {$reservation->date->format('Y-m-d')} has been checked in by the guard."
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Organization checked in successfully.',
                'data'    => $reservation
            ]);
        }

        // --- Regular reservation flow ---
        if ($reservation->status === 'cancelled') {
            return response()->json(['success' => false, 'message' => 'This reservation has been cancelled.'], 400);
        }

        if ($reservation->status === 'attended') {
            return response()->json([
                'success' => true,
                'message' => 'Attendance already recorded for this reservation.',
                'data'    => $reservation
            ]);
        }

        $reservation->update(['status' => 'attended']);

        Notification::create([
            'user_id' => $reservation->user_id,
            'title'   => 'Attendance Verified',
            'message' => "Welcome to NadorPlay! Your attendance at {$reservation->field->name} has been verified."
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Reservation verified. Player attendance recorded.',
            'data'    => $reservation
        ]);
    }
}
