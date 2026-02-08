"use client";

import { useAuth } from "@/src/context/authContext";
import { FiPackage } from "react-icons/fi";
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
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
import { FaArrowDown } from "react-icons/fa";
import { ReactNode } from "react";

const dataset = [
  { incoming: 4200, outgoing: 3000, month: "Jan" },
  { incoming: 2400, outgoing: 1398, month: "Feb" },
  { incoming: 3200, outgoing: 2000, month: "Mar" },
  { incoming: 2800, outgoing: 2780, month: "Apr" },
  { incoming: 3500, outgoing: 1890, month: "May" },
  { incoming: 4000, outgoing: 2390, month: "Jun" },
];

const metrics = [
  { icon: <FiPackage />, color: "blue", label: "Total Products", value: "123" },
  {
    icon: <FaArrowTrendUp />,
    color: "green",
    label: "Total Stock Value",
    value: "$12,345",
  },
  {
    icon: <IoWarningOutline />,
    color: "yellow",
    label: "Low Stock Items",
    value: "23",
  },
  {
    icon: <FaArrowTrendDown />,
    color: "red",
    label: "Out of Stock",
    value: "7",
  },
];

const lowStockItems = [
  { name: "Stock 1", sku: "SK-001", left: 5, min: 20, category: "Electronics" },
  { name: "Stock 2", sku: "SK-002", left: 3, min: 5, category: "Accessories" },
  { name: "Stock 3", sku: "SK-003", left: 1, min: 2, category: "Software" },
  { name: "Stock 4", sku: "SK-004", left: 2, min: 3, category: "Hardware" },
  { name: "Stock 5", sku: "SK-005", left: 4, min: 4, category: "Supplies" },
];

const topProducts = [
  { name: "Stock 1", left: 5, sales: 245, change: "+15%" },
  { name: "Stock 2", left: 3, sales: 245, change: "+15%" },
  { name: "Stock 3", left: 1, sales: 245, change: "+15%" },
  { name: "Stock 4", left: 2, sales: 245, change: "+15%" },
  { name: "Stock 5", left: 4, sales: 245, change: "+15%" },
];

const recentActivity = [
  {
    product: "Mechanical Keyboard",
    units: 50,
    user: "John Doe",
    time: "2 hours ago",
  },
  {
    product: "Mechanical Keyboard",
    units: 50,
    user: "John Doe",
    time: "2 hours ago",
  },
  {
    product: "Mechanical Keyboard",
    units: 50,
    user: "John Doe",
    time: "2 hours ago",
  },
  {
    product: "Mechanical Keyboard",
    units: 50,
    user: "John Doe",
    time: "2 hours ago",
  },
  {
    product: "Mechanical Keyboard",
    units: 50,
    user: "John Doe",
    time: "2 hours ago",
  },
];

const colorMap: Record<string, string> = {
  blue: "text-blue-700 bg-blue-300",
  green: "text-green-700 bg-green-300",
  yellow: "text-yellow-700 bg-yellow-300",
  red: "text-red-700 bg-red-300",
};

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-md">{children}</div>
  );
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
      <p className="text-sm">{label}</p>
      <h1 className="text-3xl">{value}</h1>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="font-bold text-3xl">Dashboard</h1>
        <p>
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
              <h2 className="font-semibold text-xl">Inventory Charts</h2>
              <p className="text-sm text-gray-500">Incoming vs Outgoing</p>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dataset}>
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
          <h2 className="flex font-semibold text-xl mb-4 items-center">
            <IoWarningOutline className="inline-block mr-2 text-yellow-700" />
            Low Stock Items
          </h2>
          <table className="w-full">
            <tbody>
              {lowStockItems.map((item, i) => (
                <tr
                  key={item.sku}
                  className={i < lowStockItems.length - 1 ? "border-b" : ""}
                >
                  <td className="py-2">
                    <div className="flex justify-between">
                      <h1 className="text-sm font-semibold">{item.name}</h1>
                      <p className="text-sm bg-yellow-200 px-2 rounded-full text-yellow-700">
                        {item.left} Left
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">{item.sku}</p>
                    <div className="flex gap-2 text-xs text-gray-500 mt-1">
                      <p>Min {item.min}</p>
                      <span>•</span>
                      <p>{item.category}</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Recent Activity & Top Products */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h1 className="font-semibold text-xl">Recent Activity</h1>
          <ul>
            {recentActivity.map((activity, i) => (
              <li key={i} className="flex items-center gap-4 py-2">
                <FaArrowDown className="inline-block text-3xl text-green-700 bg-green-400 p-2 rounded" />
                <div>
                  <div className="flex gap-1">
                    <h1 className="font-semibold">{activity.product}</h1>
                    <p>{activity.units} Units</p>
                  </div>
                  <div className="flex gap-1 text-xs">
                    <p>{activity.user}</p>•<p>{activity.time}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h1 className="font-semibold text-xl">Top Products</h1>
          <table className="w-full">
            <tbody>
              {topProducts.map((product, i) => (
                <tr
                  key={i}
                  className={i < topProducts.length - 1 ? "border-b" : ""}
                >
                  <td className="py-2 flex items-center gap-4">
                    <span className="px-3 py-1 bg-blue-300 text-blue-600 rounded-md flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="grow text-sm">
                      <div className="flex justify-between">
                        <h1 className="font-semibold">{product.name}</h1>
                        <p>{product.left} Left</p>
                      </div>
                      <div className="flex justify-between text-sm">
                        <p>{product.sales} Sales</p>
                        <p className="text-green-700">{product.change}</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
