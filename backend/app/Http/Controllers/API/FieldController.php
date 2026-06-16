<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Field;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class FieldController extends Controller
{
    public function index(Request $request)
    {
        $query = Field::query();

        if ($request->has('surface') && $request->surface != '') {
            $query->where('surface', $request->surface);
        }

        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search != '') {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('location', 'like', '%' . $request->search . '%');
        }

        $perPage = min((int) $request->input('per_page', 10), 100);
        $fields = $query->withAvg('reviews', 'rating')->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $fields
        ]);
    }

    public function store(Request $request)
    {
        // Check if current user is admin
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized. Admin role required.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'surface' => 'required|string|max:255',
            'dimensions' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:4096',
            'status' => 'nullable|string|in:available,maintenance,closed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('fields', 'public');
            $data['image'] = '/storage/' . $path;
        } else {
            $data['image'] = null;
        }

        $field = Field::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Field created successfully',
            'data' => $field
        ], 201);
    }

    public function show($id)
    {
        $field = Field::with(['reviews.user', 'subscriptions'])->withAvg('reviews', 'rating')->find($id);

        if (!$field) {
            return response()->json([
                'success' => false,
                'message' => 'Field not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $field
        ]);
    }

    public function update(Request $request, $id)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized. Admin role required.'], 403);
        }

        $field = Field::find($id);

        if (!$field) {
            return response()->json([
                'success' => false,
                'message' => 'Field not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'surface' => 'required|string|max:255',
            'dimensions' => 'required|string|max:255',
            'image' => 'nullable',
            'status' => 'nullable|string|in:available,maintenance,closed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($field->image && Storage::disk('public')->exists(str_replace('/storage/', '', $field->image))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $field->image));
            }
            $path = $request->file('image')->store('fields', 'public');
            $data['image'] = '/storage/' . $path;
        } else {
            // Keep the old image
            $data['image'] = $field->image;
        }

        $field->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Field updated successfully',
            'data' => $field
        ]);
    }

    public function destroy(Request $request, $id)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized. Admin role required.'], 403);
        }

        $field = Field::find($id);

        if (!$field) {
            return response()->json([
                'success' => false,
                'message' => 'Field not found'
            ], 404);
        }

        $field->delete();

        return response()->json([
            'success' => true,
            'message' => 'Field deleted successfully'
        ]);
    }

    public function availability(Request $request, $id)
    {
        $field = Field::find($id);
        if (!$field) {
            return response()->json(['success' => false, 'message' => 'Field not found'], 404);
        }

        $date = $request->query('date', now()->toDateString());
        $isToday = \Carbon\Carbon::parse($date)->isToday();
        $currentHour = now()->hour;

        $slots = [];
        for ($hour = 8; $hour <= 23; $hour++) {
            if ($isToday && $hour <= $currentHour) {
                continue;
            }
            $timeString = sprintf('%02d:00', $hour);
            $hasConflict = \App\Models\Reservation::hasConflict($id, $date, $timeString, 1);
            $slots[] = [
                'time' => $timeString,
                'available' => !$hasConflict
            ];
        }

        return response()->json([
            'success' => true,
            'date' => $date,
            'slots' => $slots
        ]);
    }
}
