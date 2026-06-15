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

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        if (!$startDate || !$endDate) {
            // Default to last 7 days (including today)
            $startDate = now()->subDays(6)->toDateString();
            $endDate = now()->toDateString();
        }

        $totalUsers = User::count();
        $totalReservations = Reservation::whereBetween('date', [$startDate, $endDate])->count();
        $totalRevenue = Payment::where('status', 'paid')
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->sum('amount');
        
        // Popular fields (field with reservation count in date range)
        $popularFields = Field::leftJoin('reservations', function($join) use ($startDate, $endDate) {
                $join->on('fields.id', '=', 'reservations.field_id')
                     ->whereBetween('reservations.date', [$startDate, $endDate]);
            })
            ->select('fields.id', 'fields.name', DB::raw('count(reservations.id) as reservations_count'))
            ->groupBy('fields.id', 'fields.name')
            ->orderByDesc('reservations_count')
            ->limit(5)
            ->get();

        // Peak Hours
        $queryPeak = Reservation::whereBetween('date', [$startDate, $endDate]);
        if (config('database.default') === 'mysql') {
            $peakHours = $queryPeak->select(DB::raw('DATE_FORMAT(time, "%H:00") as hour_slot'), DB::raw('count(*) as count'))
                ->groupBy('hour_slot')
                ->orderByDesc('count')
                ->limit(5)
                ->get();
        } else {
            $peakHours = $queryPeak->select(DB::raw('strftime("%H:00", time) as hour_slot'), DB::raw('count(*) as count'))
                ->groupBy('hour_slot')
                ->orderByDesc('count')
                ->limit(5)
                ->get();
        }

        // Daily Reservation Statistics in range
        $reservationChart = Reservation::select(DB::raw('date'), DB::raw('count(*) as count'))
            ->whereBetween('date', [$startDate, $endDate])
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

        $users = User::latest()->paginate(10);
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
