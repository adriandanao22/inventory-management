import { Card } from "./card";
import { FiPackage } from "react-icons/fi";
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import { IoWarningOutline } from "react-icons/io5";
import { formatCurrency } from "@/src/lib/format";
import { useDashboardData } from "./dashboard";
import Response from "./response";

const colorMap: Record<string, string> = {
  blue: "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900",
  green: "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900",
  yellow:
    "text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900",
  red: "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900",
};

export function MetricCard() {
  const dashboardData = useDashboardData();

  if (!dashboardData) {
    return (
      <Card>
        <Response
          type="error"
          message="Failed to load dashboard data. Please try again later."
        />
      </Card>
    );
  }

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
  return (
    <>
      {metrics.map((m) => [
        <Card key={m.label}>
          <div
            className={`text-xl ${colorMap[m.color]} p-2 mb-2 rounded w-fit`}
          >
            {m.icon}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{m.label}</p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {m.value}
          </h1>
        </Card>,
      ])}
    </>
  );
}
