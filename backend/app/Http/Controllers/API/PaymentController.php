<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Subscription;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function processPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reservation_id' => 'nullable|exists:reservations,id|required_without:subscription_id',
            'subscription_id' => 'nullable|exists:subscriptions,id|required_without:reservation_id',
            'amount' => 'required|numeric|min:1',
            'provider' => 'required|string|in:stripe,paypal,cmi',
            'card_name' => 'required_if:provider,stripe,cmi|string',
            'simulated_status' => 'nullable|string|in:success,fail', // To test success/failure flows
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $isSuccess = $request->simulated_status !== 'fail'; // Default is success
        $transactionId = 'NP-' . strtoupper(Str::random(12));

        if ($request->reservation_id) {
            $reservation = Reservation::find($request->reservation_id);
            if ($isSuccess) {
                $reservation->update([
                    'status' => 'confirmed',
                    'payment_status' => 'paid'
                ]);

                $payment = Payment::create([
                    'reservation_id' => $reservation->id,
                    'amount' => $request->amount,
                    'provider' => $request->provider,
                    'transaction_id' => $transactionId,
                    'status' => 'paid'
                ]);

                // Notify User
                Notification::create([
                    'user_id' => $reservation->user_id,
                    'title' => 'Payment Successful',
                    'message' => "Payment of {$request->amount} MAD for Reservation #{$reservation->id} was processed successfully. Transaction ID: {$transactionId}."
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment processed successfully via ' . ucfirst($request->provider),
                    'data' => [
                        'payment' => $payment,
                        'reservation' => $reservation
                    ]
                ]);
            } else {
                $reservation->update(['payment_status' => 'failed']);

                $payment = Payment::create([
                    'reservation_id' => $reservation->id,
                    'amount' => $request->amount,
                    'provider' => $request->provider,
                    'transaction_id' => $transactionId,
                    'status' => 'failed'
                ]);

                Notification::create([
                    'user_id' => $reservation->user_id,
                    'title' => 'Payment Failed',
                    'message' => "Payment transaction for Reservation #{$reservation->id} has failed. Please check details and try again."
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Payment transaction was declined.',
                    'data' => $payment
                ], 400);
            }
        }

        if ($request->subscription_id) {
            $subscription = Subscription::find($request->subscription_id);
            if ($isSuccess) {
                $subscription->update(['status' => 'active']);

                $payment = Payment::create([
                    'subscription_id' => $subscription->id,
                    'amount' => $request->amount,
                    'provider' => $request->provider,
                    'transaction_id' => $transactionId,
                    'status' => 'paid'
                ]);

                Notification::create([
                    'user_id' => $subscription->organization_id,
                    'title' => 'Academy Subscription Active',
                    'message' => "Payment of {$request->amount} MAD for Academy Subscription #{$subscription->id} was processed. Your recurring sessions are now active."
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Subscription activated. Payment processed successfully.',
                    'data' => [
                        'payment' => $payment,
                        'subscription' => $subscription
                    ]
                ]);
            } else {
                $subscription->update(['status' => 'failed']);

                $payment = Payment::create([
                    'subscription_id' => $subscription->id,
                    'amount' => $request->amount,
                    'provider' => $request->provider,
                    'transaction_id' => $transactionId,
                    'status' => 'failed'
                ]);

                Notification::create([
                    'user_id' => $subscription->organization_id,
                    'title' => 'Subscription Payment Failed',
                    'message' => "Payment for your Academy Subscription #{$subscription->id} has failed."
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Subscription payment transaction failed.',
                    'data' => $payment
                ], 400);
            }
        }
    }
}
