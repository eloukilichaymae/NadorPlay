<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SubscriptionSession;
use App\Models\Reservation;
use App\Models\Field;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
    // Run the absence auto-tracking logic for subscription reservations
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
        $this->trackAbsences();

        $user = $request->user();
        $query = Subscription::with(['field', 'organization', 'sessions']);

        if ($user->role === 'organization') {
            $query->where('organization_id', $user->id);
        }

        $subscriptions = $query->latest()->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $subscriptions
        ]);
    }

    // Admin-only: create subscription + auto-generate reservations
    public function adminStore(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only administrators can create subscriptions.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'organization_name'    => 'required|string|max:255',
            'field_id'             => 'required|exists:fields,id',
            'start_date'           => 'required|date',
            'end_date'             => 'required|date|after:start_date',
            'total_price'          => 'required|numeric|min:0',
            'sessions'             => 'required|array|min:1',
            'sessions.*.day_of_week'  => 'required|integer|min:0|max:6',
            'sessions.*.session_time' => 'required|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        $conflict = self::checkSubscriptionConflict(
            $request->field_id,
            $request->start_date,
            $request->end_date,
            $request->sessions
        );

        if ($conflict) {
            return response()->json([
                'success' => false,
                'message' => $conflict
            ], 400);
        }

        $field = Field::find($request->field_id);

        $subscription = Subscription::create([
            'organization_id'   => null,
            'organization_name' => $request->organization_name,
            'field_id'          => $field->id,
            'start_date'        => $request->start_date,
            'end_date'          => $request->end_date,
            'total_price'       => $request->total_price,
            'status'            => 'active',
        ]);

        foreach ($request->sessions as $sess) {
            SubscriptionSession::create([
                'subscription_id' => $subscription->id,
                'day_of_week'     => $sess['day_of_week'],
                'session_time'    => $sess['session_time'],
            ]);
        }

        $generatedCount = $this->generateReservations($subscription);

        return response()->json([
            'success' => true,
            'message' => "Subscription created successfully for {$request->organization_name}. {$generatedCount} sessions generated.",
            'data' => [
                'subscription' => $subscription->load('sessions'),
            ]
        ], 201);
    }

    // Organization self-service: request a subscription (pending payment/approval)
    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'organization' && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Only organizations or admins can create subscriptions.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'field_id'                => 'required|exists:fields,id',
            'start_date'              => 'required|date|after_or_equal:today',
            'end_date'                => 'required|date|after:start_date',
            'sessions'                => 'required|array|min:1',
            'sessions.*.day_of_week'  => 'required|integer|min:0|max:6',
            'sessions.*.session_time' => 'required|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        $conflict = self::checkSubscriptionConflict(
            $request->field_id,
            $request->start_date,
            $request->end_date,
            $request->sessions
        );

        if ($conflict) {
            return response()->json([
                'success' => false,
                'message' => $conflict
            ], 400);
        }

        $field      = Field::find($request->field_id);
        $startDate  = Carbon::parse($request->start_date);
        $endDate    = Carbon::parse($request->end_date);

        $totalSessions = 0;
        foreach ($request->sessions as $sess) {
            $dayOfWeek   = (int) $sess['day_of_week'];
            $diff        = ($dayOfWeek - $startDate->dayOfWeek + 7) % 7;
            $sessionDate = $startDate->copy()->addDays($diff);

            while ($sessionDate->lte($endDate)) {
                $totalSessions++;
                $sessionDate->addWeek();
            }
        }
        $totalPrice = $totalSessions * $field->price * 0.85;

        $subscription = Subscription::create([
            'organization_id'   => $user->id,
            'organization_name' => $user->name,
            'field_id'          => $field->id,
            'start_date'        => $request->start_date,
            'end_date'          => $request->end_date,
            'total_price'       => $totalPrice,
            'status'            => 'pending',
        ]);

        foreach ($request->sessions as $sess) {
            SubscriptionSession::create([
                'subscription_id' => $subscription->id,
                'day_of_week'     => $sess['day_of_week'],
                'session_time'    => $sess['session_time'],
            ]);
        }

        Notification::create([
            'user_id' => $user->id,
            'title'   => 'Subscription Drafted',
            'message' => "Your subscription for {$field->name} has been drafted. Pay {$totalPrice} MAD to activate."
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subscription created. Payment required to activate.',
            'data'    => $subscription->load('sessions')
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $this->trackAbsences();

        $subscription = Subscription::with(['field', 'organization', 'sessions', 'reservations'])->find($id);

        if (!$subscription) {
            return response()->json(['success' => false, 'message' => 'Subscription not found'], 404);
        }

        $user = $request->user();
        if ($user->role === 'organization' && $subscription->organization_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access'], 403);
        }

        return response()->json([
            'success' => true,
            'data'    => $subscription
        ]);
    }

    public function cancel(Request $request, $id)
    {
        $subscription = Subscription::find($id);

        if (!$subscription) {
            return response()->json(['success' => false, 'message' => 'Subscription not found'], 404);
        }

        $user = $request->user();
        if ($user->role === 'organization' && $subscription->organization_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized action'], 403);
        }

        $subscription->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Subscription cancelled successfully.',
            'data'    => $subscription
        ]);
    }

    public function approve(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only administrators can approve subscriptions.'
            ], 403);
        }

        $subscription = Subscription::with(['field', 'organization', 'sessions'])->find($id);

        if (!$subscription) {
            return response()->json(['success' => false, 'message' => 'Subscription not found'], 404);
        }

        $subscription->update(['status' => 'active']);

        $generatedCount = $this->generateReservations($subscription);

        return response()->json([
            'success' => true,
            'message' => "Subscription activated successfully. {$generatedCount} sessions generated.",
            'data'    => $subscription
        ]);
    }

    public static function checkSubscriptionConflict($fieldId, $startDate, $endDate, $sessions)
    {
        $start = Carbon::parse($startDate);
        $end   = Carbon::parse($endDate);

        foreach ($sessions as $sess) {
            $dayOfWeek   = (int) $sess['day_of_week'];
            $sessionTime = $sess['session_time'];

            $diff        = ($dayOfWeek - $start->dayOfWeek + 7) % 7;
            $sessionDate = $start->copy()->addDays($diff);

            while ($sessionDate->lte($end)) {
                $dateStr = $sessionDate->format('Y-m-d');

                if (Reservation::hasConflict($fieldId, $dateStr, $sessionTime, 1)) {
                    return "Conflict detected on {$dateStr} at {$sessionTime} with an existing reservation or active subscription.";
                }

                $sessionDate->addWeek();
            }
        }

        return null;
    }

    private function generateReservations(Subscription $subscription): int
    {
        // Generate reservations for each session (skips dates that already have one)
        $startDate      = Carbon::parse($subscription->start_date);
        $endDate        = Carbon::parse($subscription->end_date);
        $generatedCount = 0;
        $orgName        = $subscription->organization_name ?? ($subscription->organization ? $subscription->organization->name : 'Organization');

        // Load relations if not loaded
        if (!$subscription->relationLoaded('sessions')) {
            $subscription->load('sessions');
        }
        if (!$subscription->relationLoaded('field')) {
            $subscription->load('field');
        }

        foreach ($subscription->sessions as $sess) {
            $dayOfWeek   = (int) $sess->day_of_week;
            $sessionTime = $sess->session_time;

            $diff        = ($dayOfWeek - $startDate->dayOfWeek + 7) % 7;
            $sessionDate = $startDate->copy()->addDays($diff);

            while ($sessionDate->lte($endDate)) {
                $dateStr = $sessionDate->format('Y-m-d');

                // Skip if a reservation for this subscription/date/time already exists
                $alreadyExists = Reservation::where('subscription_id', $subscription->id)
                    ->where('date', $dateStr)
                    ->where('time', $sessionTime)
                    ->exists();

                if (!$alreadyExists) {
                    $sessStart = Carbon::parse("$dateStr $sessionTime");
                    $sessEnd   = $sessStart->copy()->addHour();

                    $hasConflict = false;
                    foreach (Reservation::where('field_id', $subscription->field_id)
                        ->where('date', $dateStr)
                        ->where('status', '!=', 'cancelled')
                        ->get() as $res) {
                        $resStart = Carbon::parse($res->date->format('Y-m-d') . ' ' . $res->time);
                        $resEnd = $resStart->copy()->addHours($res->duration ?? 1);
                        if ($sessStart->lt($resEnd) && $sessEnd->gt($resStart)) {
                            $hasConflict = true;
                            break;
                        }
                    }

                    if (!$hasConflict) {
                        $reservation = Reservation::create([
                            'user_id'           => $subscription->organization_id, // can be null
                            'field_id'          => $subscription->field_id,
                            'subscription_id'   => $subscription->id,
                            'reservation_type'  => 'subscription',
                            'date'              => $dateStr,
                            'time'              => $sessionTime,
                            'duration'          => 1,
                            'number_of_players' => null,
                            'status'            => 'accepted',
                            'check_in_status'   => 'pending',
                            'payment_status'    => 'paid',
                            'qr_code'           => null,
                        ]);

                        $reservation->update(['qr_code' => json_encode([
                            'reservation_id'   => $reservation->id,
                            'reservation_type' => 'subscription',
                            'organization_name'=> $orgName,
                            'date'             => $dateStr,
                            'time'             => $sessionTime,
                            'field_name'       => $subscription->field->name,
                        ])]);

                        $generatedCount++;
                    }
                }

                $sessionDate->addWeek();
            }
        }

        if ($subscription->organization_id) {
            Notification::create([
                'user_id' => $subscription->organization_id,
                'title'   => 'Subscription Activated',
                'message' => "Your subscription for {$subscription->field->name} has been activated. {$generatedCount} sessions have been scheduled."
            ]);
        }

        return $generatedCount;
    }
}
