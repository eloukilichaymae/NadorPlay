<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SubscriptionSession;
use App\Models\Field;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
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

    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'organization' && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Only organizations or admins can create subscriptions.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'field_id' => 'required|exists:fields,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'sessions' => 'required|array|min:1',
            'sessions.*.day_of_week' => 'required|integer|min:0|max:6',
            'sessions.*.session_time' => 'required|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $field = Field::find($request->field_id);
        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);

        // Calculate weeks to determine pricing
        $weeks = $startDate->diffInWeeks($endDate);
        if ($weeks < 1) {
            $weeks = 1;
        }

        $sessionCount = count($request->sessions);
        // Let's assume a subscription gets a 15% discount on bulk hourly rates
        $hourlyRate = $field->price;
        $totalPrice = $weeks * $sessionCount * $hourlyRate * 0.85;

        $subscription = Subscription::create([
            'organization_id' => $user->id,
            'field_id' => $field->id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'total_price' => $totalPrice,
            'status' => 'pending', // Pending payment
        ]);

        foreach ($request->sessions as $sess) {
            SubscriptionSession::create([
                'subscription_id' => $subscription->id,
                'day_of_week' => $sess['day_of_week'],
                'session_time' => $sess['session_time'],
            ]);
        }

        // Notify organization
        Notification::create([
            'user_id' => $user->id,
            'title' => 'Subscription Drafted',
            'message' => "Your academy subscription for {$field->name} has been drafted. Please pay {$totalPrice} MAD to activate."
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subscription created successfully. Payment required to activate.',
            'data' => $subscription->load('sessions')
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $subscription = Subscription::with(['field', 'organization', 'sessions'])->find($id);

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription not found'
            ], 404);
        }

        $user = $request->user();
        if ($user->role === 'organization' && $subscription->organization_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $subscription
        ]);
    }

    public function cancel(Request $request, $id)
    {
        $subscription = Subscription::find($id);

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription not found'
            ], 404);
        }

        $user = $request->user();
        if ($user->role === 'organization' && $subscription->organization_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action'
            ], 403);
        }

        $subscription->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Subscription cancelled successfully.',
            'data' => $subscription
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

        $subscription = Subscription::with(['field', 'organization'])->find($id);

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription not found'
            ], 404);
        }

        $subscription->update(['status' => 'active']);

        // Notify organization
        Notification::create([
            'user_id' => $subscription->organization_id,
            'title' => 'Subscription Activated',
            'message' => "Your academy subscription for {$subscription->field->name} has been activated by the administrator."
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subscription activated successfully.',
            'data' => $subscription
        ]);
    }
}
