<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Field;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Reservation::with(['field', 'user']);

        if ($user->role === 'user') {
            $query->where('user_id', $user->id);
        } elseif ($user->role === 'guard') {
            // Guards see reservations for today
            $query->where('date', Carbon::today()->toDateString());
        } // Admins see all

        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }

        if ($request->has('date') && $request->date != '') {
            $query->where('date', $request->date);
        }

        $reservations = $query->latest()->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $reservations
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'field_id' => 'required|exists:fields,id',
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|date_format:H:i',
            'duration' => 'required|integer|min:1|max:4',
            'number_of_players' => 'required|integer|min:2|max:30',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $fieldId = $request->field_id;
        $date = $request->date;
        $time = $request->time;
        $duration = $request->duration;

        // Conflict detection
        $newStart = Carbon::parse($date . ' ' . $time);
        $newEnd = (clone $newStart)->addHours($duration);

        $field = Field::find($fieldId);
        if ($field->status !== 'available') {
            return response()->json([
                'success' => false,
                'message' => 'The field is currently not available for bookings due to maintenance or closure.'
            ], 400);
        }

        $existingReservations = Reservation::where('field_id', $fieldId)
            ->where('date', $date)
            ->where('status', '!=', 'cancelled')
            ->get();

        foreach ($existingReservations as $exist) {
            $existStart = Carbon::parse($exist->date->format('Y-m-d') . ' ' . $exist->time);
            $existEnd = (clone $existStart)->addHours($exist->duration);

            // Check overlap: (StartA < EndB) and (EndA > StartB)
            if ($newStart->lt($existEnd) && $newEnd->gt($existStart)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Time slot conflict detected. This field is already reserved from ' . $existStart->format('H:i') . ' to ' . $existEnd->format('H:i') . '.'
                ], 400);
            }
        }

        // Generate temporary mock QR code content: JSON with reservation particulars
        // QR format: ReservationID_FieldID_UserID_Hash
        $user = $request->user();
        $reservation = Reservation::create([
            'user_id' => $user->id,
            'field_id' => $fieldId,
            'date' => $date,
            'time' => $time,
            'duration' => $duration,
            'number_of_players' => $request->number_of_players,
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);

        // Generate actual QR payload
        $qrPayload = json_encode([
            'reservation_id' => $reservation->id,
            'field_id' => $fieldId,
            'user_id' => $user->id,
            'code' => md5($reservation->id . $fieldId . $user->id . 'NadorPlaySecretSalt')
        ]);

        $reservation->update(['qr_code' => $qrPayload]);

        // Trigger Notification
        Notification::create([
            'user_id' => $user->id,
            'title' => 'Reservation Created',
            'message' => "Your reservation for {$field->name} on {$date} at {$time} has been registered and is pending payment."
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Reservation created successfully. Please complete the payment.',
            'data' => $reservation->load('field')
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $reservation = Reservation::with(['field', 'user'])->find($id);

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Reservation not found'
            ], 404);
        }

        // Authorization check
        $user = $request->user();
        if ($user->role === 'user' && $reservation->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $reservation
        ]);
    }

    public function cancel(Request $request, $id)
    {
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Reservation not found'
            ], 404);
        }

        $user = $request->user();
        if ($user->role === 'user' && $reservation->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action'
            ], 403);
        }

        if ($reservation->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'Reservation is already cancelled'
            ], 400);
        }

        $reservation->update([
            'status' => 'cancelled',
            'payment_status' => $reservation->payment_status === 'paid' ? 'refunded' : $reservation->payment_status
        ]);

        // Notify user
        Notification::create([
            'user_id' => $reservation->user_id,
            'title' => 'Reservation Cancelled',
            'message' => "Your reservation for field #{$reservation->field_id} on {$reservation->date->format('Y-m-d')} has been cancelled."
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Reservation cancelled successfully',
            'data' => $reservation
        ]);
    }

    public function verifyQr(Request $request)
    {
        // Guards and Admins only
        $user = $request->user();
        if ($user->role !== 'guard' && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only guards or admins can scan and verify QR codes.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'qr_payload' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = json_decode($request->qr_payload, true);

        if (!$data || !isset($data['reservation_id']) || !isset($data['field_id']) || !isset($data['user_id']) || !isset($data['code'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid QR Code structure.'
            ], 400);
        }

        // Validate hash code to prevent spoofing
        $expectedHash = md5($data['reservation_id'] . $data['field_id'] . $data['user_id'] . 'NadorPlaySecretSalt');
        if ($data['code'] !== $expectedHash) {
            return response()->json([
                'success' => false,
                'message' => 'QR Code verification signature failed. Access Denied.'
            ], 400);
        }

        $reservation = Reservation::with(['user', 'field'])->find($data['reservation_id']);

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Reservation record not found.'
            ], 404);
        }

        if ($reservation->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'This reservation has been cancelled.'
            ], 400);
        }

        if ($reservation->status === 'attended') {
            return response()->json([
                'success' => true,
                'message' => 'Attendance already recorded for this reservation.',
                'data' => $reservation
            ]);
        }

        // Mark attendance / verify
        $reservation->update([
            'status' => 'attended'
        ]);

        // Send confirmation in-app alert
        Notification::create([
            'user_id' => $reservation->user_id,
            'title' => 'Attendance Verified',
            'message' => "Welcome to NadorPlay! Your attendance at {$reservation->field->name} has been verified by the guard."
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Reservation verified successfully. Player attendance recorded.',
            'data' => $reservation
        ]);
    }
}
