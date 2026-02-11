"use client";

import { Card } from "../card";
import { IoWarningOutline } from "react-icons/io5";
import { useDashboardData } from "./index";

export default function LowStock() {
  const data = useDashboardData();
  const lowStockItems = data?.lowStockItems ?? [];

  return (
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
  );
}
