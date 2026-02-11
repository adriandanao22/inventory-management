import React, { createContext, useContext } from "react";
import { DashboardData } from "@/src/types/dashboard";

export { default as DashboardChart } from "./chart";
export { default as LowStock } from "./lowStock";
export { default as RecentActivity } from "./recentActivity";
export { default as TopProducts } from "./topProducts";

const DashboardDataContext = createContext<DashboardData | null>(null);

export function DashboardProvider({
  data,
  children,
}: {
  data: DashboardData | null;
  children: React.ReactNode;
}) {
  return (
    <DashboardDataContext.Provider value={data}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  return useContext(DashboardDataContext);
}
