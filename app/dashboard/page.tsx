"use client";

import { useAuth } from "@/src/context/authContext";
import { DashboardData } from "@/src/types/dashboard";
import { MetricCard } from "@/src/components/metricCard";
import useDashboard from "@/src/hooks/useDashboard";
import {
  DashboardChart,
  DashboardProvider,
  LowStock,
  RecentActivity,
  TopProducts,
} from "@/src/components/dashboard";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { data, loading: dashboardLoading } = useDashboard();

  if (loading || dashboardLoading) return <div>Loading...</div>;

  const dashboardData: DashboardData | null = data ?? null;

  return (
    <DashboardProvider data={dashboardData}>
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="font-bold text-3xl text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome back, {user?.username}! Here&apos;s your inventory overview.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard />
        </div>

        {/* Charts & Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DashboardChart />
          <LowStock />
        </div>

        {/* Recent Activity & Top Products */}
        <div className="grid md:grid-cols-2 gap-6">
          <RecentActivity />
          <TopProducts />
        </div>
      </div>
    </DashboardProvider>
  );
}
