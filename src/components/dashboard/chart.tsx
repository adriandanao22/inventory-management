import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";
import { Card } from "../card";
import { useEffect, useState } from "react";

export default function DashboardChart() {
  const [data, setData] = useState<
    { month: string; incoming: number; outgoing: number }[]
  >([]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await fetch("/api/stock-adjustments?limit=1000");
        const json = await res.json();
        if (json.c !== 200 || !json.d.items) {
          setData([]);
          return;
        }

        const monthMap: Record<string, { incoming: number; outgoing: number }> =
          {};
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

        for (const adj of json.d.items) {
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
        setData(chart);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setData([]);
      }
    };
    fetchChartData();
  }, []);

  return (
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
        <div className="h-100">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Legend />
              <Bar dataKey="incoming" name="Incoming" fill="#10b981" />
              <Bar dataKey="outgoing" name="Outgoing" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
