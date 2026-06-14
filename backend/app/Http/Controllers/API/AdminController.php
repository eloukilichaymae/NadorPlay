<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Field;
use App\Models\Reservation;
use App\Models\Payment;
use App\Models\Review;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    private function checkAdmin(Request $request)
    {
        return $request->user() && $request->user()->role === 'admin';
    }

    public function dashboardStats(Request $request)
    {
        if (!$this->checkAdmin($request)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $totalUsers = User::count();
        $totalReservations = Reservation::count();
        $totalRevenue = Payment::where('status', 'paid')->sum('amount');
        
        // Popular fields (field with reservation count)
        $popularFields = Field::leftJoin('reservations', 'fields.id', '=', 'reservations.field_id')
            ->select('fields.id', 'fields.name', DB::raw('count(reservations.id) as reservations_count'))
            ->groupBy('fields.id', 'fields.name')
            ->orderByDesc('reservations_count')
            ->limit(5)
            ->get();

        // Peak Hours
        $peakHours = Reservation::select(DB::raw('strftime("%H:00", time) as hour_slot'), DB::raw('count(*) as count'))
            ->groupBy('hour_slot')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        // If running in SQLite, strftime is correct. If MySQL, use DATE_FORMAT.
        // Let's make it compatible or fallback.
        if (config('database.default') === 'mysql') {
            $peakHours = Reservation::select(DB::raw('DATE_FORMAT(time, "%H:00") as hour_slot'), DB::raw('count(*) as count'))
                ->groupBy('hour_slot')
                ->orderByDesc('count')
                ->limit(5)
                ->get();
        }

        // Daily Reservation Statistics for the last 7 days
        $reservationChart = Reservation::select(DB::raw('date'), DB::raw('count(*) as count'))
            ->where('date', '>=', now()->subDays(7)->toDateString())
            ->groupBy('date')
            ->get();

        // Monthly Revenue Chart
        $revenueChart = Payment::where('status', 'paid')
            ->select(
                DB::raw('strftime("%Y-%m", created_at) as month_period'),
                DB::raw('sum(amount) as total')
            )
            ->groupBy('month_period')
            ->get();

        if (config('database.default') === 'mysql') {
            $revenueChart = Payment::where('status', 'paid')
                ->select(
                    DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month_period'),
                    DB::raw('sum(amount) as total')
                )
                ->groupBy('month_period')
                ->get();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'total_users' => $totalUsers,
                    'total_reservations' => $totalReservations,
                    'total_revenue' => $totalRevenue,
                ],
                'popular_fields' => $popularFields,
                'peak_hours' => $peakHours,
                'reservation_chart' => $reservationChart,
                'revenue_chart' => $revenueChart
            ]
        ]);
    }

    public function manageUsers(Request $request)
    {
        if (!$this->checkAdmin($request)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $users = User::latest()->paginate(15);
        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    public function updateUserRole(Request $request, $id)
    {
        if (!$this->checkAdmin($request)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found.'], 404);
        }

        $request->validate([
            'role' => 'required|string|in:user,admin,guard,organization'
        ]);

        $user->update(['role' => $request->role]);

        return response()->json([
            'success' => true,
            'message' => 'User role updated successfully.',
            'data' => $user
        ]);
    }

    public function deleteReview(Request $request, $id)
    {
        if (!$this->checkAdmin($request)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $review = Review::find($id);
        if (!$review) {
            return response()->json(['success' => false, 'message' => 'Review not found.'], 404);
        }

        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Review deleted successfully.'
        ]);
    }
}
