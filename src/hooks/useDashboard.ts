import { useEffect, useState } from "react";
import { DashboardData } from "../types/dashboard";

export default function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [chartData, setChartData] = useState<
    { month: string; incoming: number; outgoing: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/dashboard");
        const json = await res.json();
        if (json.c !== 200)
          throw new Error(json.m || "Failed to fetch dashboard");
        if (!mounted) return;
        setData(json.d ?? null);

        const chartRes = await fetch("/api/dashboard/chart");
        const chartJson = await chartRes.json();
        if (chartJson.c === 200) {
          setChartData(chartJson.d ?? []);
        } else {
          setChartData([]);
        }
      } catch (error) {
        if (!mounted) return;
        setError(
          error instanceof Error ? error.message : "Error loading dashboard",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
  }, []);

  const metrics = data?.metrics ?? null;

  return { data, metrics, chartData, loading, error };
}
