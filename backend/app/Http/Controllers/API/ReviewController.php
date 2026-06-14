<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Field;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    public function index(Request $request, $field_id)
    {
        $reviews = Review::where('field_id', $field_id)->with('user')->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'field_id' => 'required|exists:fields,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Check if review already exists
        $exists = Review::where('user_id', $user->id)->where('field_id', $request->field_id)->first();
        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'You have already reviewed this field.'
            ], 400);
        }

        $review = Review::create([
            'user_id' => $user->id,
            'field_id' => $request->field_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        // Notify admins / owner (optional or mock in-app notice)
        $field = Field::find($request->field_id);

        return response()->json([
            'success' => true,
            'message' => 'Review submitted successfully.',
            'data' => $review->load('user')
        ], 201);
    }
}
