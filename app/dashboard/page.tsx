"use client";

import { useAuth } from "@/src/context/authContext";
import { FiPackage } from "react-icons/fi";
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import { Card } from "@/src/components/card";
import { IoWarningOutline } from "react-icons/io5";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
} from "recharts";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { ReactNode, useEffect, useState } from "react";
import { Product } from "@/src/types/products";
import { StockAdjustment } from "@/src/types/stockAdjustments";

interface DashboardData {
  metrics: {
    totalProducts: number;
    totalStockValue: number;
    lowStockCount: number;
    outOfStock: number;
  };
  lowStockItems: Product[];
  recentActivity: (StockAdjustment & {
    products: { name: string; sku: string };
    users: { username: string };
  })[];
  topProducts: {
    product_id: string;
    units: number;
    products: { name: string; stock: number };
  }[];
}

const colorMap: Record<string, string> = {
  blue: "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900",
  green: "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900",
  yellow:
    "text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900",
  red: "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

function MetricCard({
  icon,
  color,
  label,
  value,
}: {
  icon: ReactNode;
  color: string;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <div className={`text-xl ${colorMap[color]} p-2 mb-2 rounded w-fit`}>
        {icon}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </h1>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [chartData, setChartData] = useState<
    { month: string; incoming: number; outgoing: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard");
        const json = await res.json();
        if (json.c === 200) {
          setDashboardData(json.d);
        }

        // Fetch chart data from stock adjustments
        const adjRes = await fetch("/api/stock-adjustments?limit=1000");
        const adjJson = await adjRes.json();
        if (adjJson.c === 200 && adjJson.d) {
          const monthMap: Record<
            string,
            { incoming: number; outgoing: number }
          > = {};
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];

          for (const adj of adjJson.d) {
            const date = new Date(adj.created_at);
            const month = monthNames[date.getMonth()];
            if (!monthMap[month]) {
              monthMap[month] = { incoming: 0, outgoing: 0 };
            }
            monthMap[month][adj.type as "incoming" | "outgoing"] += adj.units;
          }

          const chart = monthNames
            .filter((m) => monthMap[m])
            .map((month) => ({
              month,
              incoming: monthMap[month].incoming,
              outgoing: monthMap[month].outgoing,
            }));

          setChartData(chart);
        }
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading || isLoading) return <div>Loading...</div>;

  const metrics = [
    {
      icon: <FiPackage />,
      color: "blue",
      label: "Total Products",
      value: String(dashboardData?.metrics.totalProducts ?? 0),
    },
    {
      icon: <FaArrowTrendUp />,
      color: "green",
      label: "Total Stock Value",
      value: formatCurrency(dashboardData?.metrics.totalStockValue ?? 0),
    },
    {
      icon: <IoWarningOutline />,
      color: "yellow",
      label: "Low Stock Items",
      value: String(dashboardData?.metrics.lowStockCount ?? 0),
    },
    {
      icon: <FaArrowTrendDown />,
      color: "red",
      label: "Out of Stock",
      value: String(dashboardData?.metrics.outOfStock ?? 0),
    },
  ];

  const lowStockItems = (dashboardData?.lowStockItems ?? []).slice(0, 5);
  const recentActivity = (dashboardData?.recentActivity ?? []).slice(0, 5);
  const topProducts = (dashboardData?.topProducts ?? []).slice(0, 5);

  return (
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
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* Charts & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="mb-6">
              <h2 className="font-semibold text-xl text-gray-900 dark:text-white">
                Inventory Charts
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Incoming vs Outgoing
              </p>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    color: "#000",
                  }}
                />
                <Legend />
                <Bar dataKey="incoming" name="Incoming" fill="#4f46e5" />
                <Bar dataKey="outgoing" name="Outgoing" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card>
          <h2 className="flex font-semibold text-xl mb-4 items-center text-gray-900 dark:text-white">
            <IoWarningOutline className="inline-block mr-2 text-yellow-700 dark:text-yellow-400" />
            Low Stock Items
          </h2>
          {lowStockItems.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
              No low stock items
            </p>
          ) : (
            <table className="w-full">
              <tbody>
                {lowStockItems.map((item, i) => (
                  <tr
                    key={item.id}
                    className={
                      i < lowStockItems.length - 1
                        ? "border-b border-gray-200 dark:border-gray-700"
                        : ""
                    }
                  >
                    <td className="py-2">
                      <div className="flex justify-between">
                        <h1 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {item.name}
                        </h1>
                        <p className="text-sm bg-yellow-100 dark:bg-yellow-900 px-2 rounded-full text-yellow-700 dark:text-yellow-300">
                          {item.stock} Left
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.sku}
                      </p>
                      <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <p>Min {item.min_stock}</p>
                        <span>•</span>
                        <p>{item.category}</p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {/* Recent Activity & Top Products */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h1 className="font-semibold text-xl text-gray-900 dark:text-white">
            Recent Activity
          </h1>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
              No recent activity
            </p>
          ) : (
            <ul>
              {recentActivity.map((activity) => (
                <li key={activity.id} className="flex items-center gap-4 py-2">
                  {activity.type === "incoming" ? (
                    <FaArrowDown className="inline-block text-3xl text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 p-2 rounded" />
                  ) : (
                    <FaArrowUp className="inline-block text-3xl text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 p-2 rounded" />
                  )}
                  <div>
                    <div className="flex gap-1">
                      <h1 className="font-semibold text-gray-900 dark:text-white">
                        {activity.products?.name}
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">
                        {activity.units} Units
                      </p>
                    </div>
                    <div className="flex gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <p>{activity.users?.username}</p>•
                      <p>{timeAgo(activity.created_at)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h1 className="font-semibold text-xl text-gray-900 dark:text-white">
            Top Products
          </h1>
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
              No data yet
            </p>
          ) : (
            <table className="w-full">
              <tbody>
                {topProducts.map((product, i) => (
                  <tr
                    key={`${product.product_id}-${i}`}
                    className={
                      i < topProducts.length - 1
                        ? "border-b border-gray-200 dark:border-gray-700"
                        : ""
                    }
                  >
                    <td className="py-2 flex items-center gap-4">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-md flex items-center justify-center font-semibold">
                        {i + 1}
                      </span>
                      <div className="grow text-sm">
                        <div className="flex justify-between">
                          <h1 className="font-semibold text-gray-900 dark:text-white">
                            {product.products?.name}
                          </h1>
                          <p className="text-gray-500 dark:text-gray-400">
                            {product.products?.stock} Left
                          </p>
                        </div>
                        <div className="flex justify-between text-sm">
                          <p className="text-gray-500 dark:text-gray-400">
                            {product.units} Units sold
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
