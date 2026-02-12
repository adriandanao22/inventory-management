"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Card } from "@/src/components/card";
import Response from "@/src/components/response";
import StockAdjustmentForm from "./StockAdjustmentForm";
import { StockAdjustment } from "@/src/types/stockAdjustments";
import {
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaArrowUp,
} from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

interface AdjustmentWithDetails extends StockAdjustment {
  products: { name: string; sku: string };
  users: { username: string };
}

export default function StockAdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<AdjustmentWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (filterType) p.set("type", filterType);
    p.set("page", page.toString());
    p.set("limit", limit.toString());
    return p;
  }, [filterType, page, limit]);

  const fetchAdjustments = useCallback(async () => {
    try {
      const res = await fetch(`/api/stock-adjustments?${params.toString()}`);
      const json = await res.json();
      if (json.c === 200) {
        setAdjustments(json.d.items ?? []);
        setTotal(json.d?.total ?? 0);
        setMessage(null);
      } else {
        setMessage(json.m || "Failed to load adjustments");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error fetching adjustments:", error);
      setMessage("Network error while fetching adjustments");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(total, page * limit);

  const getPageList = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    if (page <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
      return pages;
    }
    if (page >= totalPages - 2) {
      pages.push(
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
      return pages;
    }
    pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
    return pages;
  };

  const pageList = getPageList();

  useEffect(() => {
    fetchAdjustments();
  }, [fetchAdjustments]);

  useEffect(() => {
    setPage(1);
  }, [filterType]);

  const handleExport = async () => {
    try {
      const res = await fetch(
        `/api/stock-adjustments/export?${params.toString()}`,
      );
      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("text/csv")) {
        const json = await res.json();
        const blob = new Blob([json.d], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "stock_adjustments.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        setMessage("Stock adjustments exported successfully");
        setMessageType("success");
      } else {
        let errMsg = "Failed to export stock adjustments";
        try {
          const json = await res.json();
          errMsg = json?.m || errMsg;
        } catch (error) {
          console.error("Error parsing export error response:", error);
        }
        setMessage(errMsg);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error exporting stock adjustments:", error);
      setMessage("Failed to export stock adjustments");
      setMessageType("error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Stock Adjustments
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track incoming and outgoing stock movements
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 px-3 py-2 rounded text-white flex items-center gap-2 hover:bg-indigo-700 transition-colors w-full sm:w-auto justify-center"
          >
            <IoMdAdd />
            New Adjustment
          </button>

          <button
            className="bg-green-600 px-2 py-1 rounded text-white flex items-center gap-2"
            onClick={handleExport}
          >
            Export CSV
          </button>
        </div>
      </div>

      <Response message={message} type={messageType} className="mb-4" />

      {/* Modal for New Adjustment Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-auto backdrop-blur-sm flex items-start sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-xl w-full p-4 relative max-h-[calc(100vh-6rem)] overflow-auto">
            <StockAdjustmentForm
              onSuccess={() => {
                setShowForm(false);
                fetchAdjustments();
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Filter */}
      <Card className="flex flex-col sm:flex-row p-3 sm:justify-between gap-3">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by type:
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All</option>
            <option value="incoming">Incoming</option>
            <option value="outgoing">Outgoing</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:justify-between p-0 sm:p-0 gap-3 w-full"></div>
      </Card>

      <Card className="flex flex-col sm:flex-row items-center sm:justify-between p-3 space-y-3 sm:space-y-0 sm:space-x-5">
        <div className="text-sm text-gray-600 dark:text-gray-300 w-full sm:w-auto text-center sm:text-left">
          {total > 0 ? (
            <span>
              Showing{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {startItem}-{endItem}
              </span>{" "}
              of <span className="font-medium">{total}</span> results
            </span>
          ) : (
            <span className="text-gray-500">No adjustments</span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
          <div className="flex items-center gap-2 overflow-auto py-1">
            <button
              aria-label="Previous page"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 sm:p-1 cursor-pointer"
            >
              <FaArrowLeft />
            </button>

            {pageList.map((p, i) =>
              p === "..." ? (
                <span key={`e-${i}`} className="px-2 text-gray-500">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  aria-current={p === page ? "page" : undefined}
                  onClick={() => setPage(Number(p))}
                  className={`text-sm px-2 sm:px-3 py-1 rounded-md border ${
                    p === page
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {p}
                </button>
              ),
            )}

            <button
              aria-label="Next page"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 sm:p-1 cursor-pointer"
            >
              <FaArrowRight />
            </button>
          </div>

          <div className="ml-0 sm:ml-3 flex items-center gap-2">
            <label className="mr-2 text-gray-700 dark:text-gray-200 font-medium">
              Rows:
            </label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {[5, 10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Adjustments List */}
      <Card className="p-0 overflow-auto">
        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-gray-900 min-w-160">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2 text-center">Units</th>
                <th className="px-4 py-2">Reason</th>
                <th className="px-4 py-2">By</th>
                <th className="px-4 py-2">When</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Loading adjustments...
                  </td>
                </tr>
              ) : adjustments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No stock adjustments found
                  </td>
                </tr>
              ) : (
                adjustments.map((adj) => (
                  <tr
                    key={adj.id}
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        {adj.type === "incoming" ? (
                          <FaArrowDown className="text-green-600 dark:text-green-400" />
                        ) : (
                          <FaArrowUp className="text-red-600 dark:text-red-400" />
                        )}
                        <span
                          className={`text-sm font-medium capitalize ${
                            adj.type === "incoming"
                              ? "text-green-700 dark:text-green-400"
                              : "text-red-700 dark:text-red-400"
                          }`}
                        >
                          {adj.type}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {adj.products?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {adj.products?.sku}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-gray-900 dark:text-white">
                      {adj.type === "incoming" ? "+" : "-"}
                      {adj.units}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {adj.reason || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {adj.users?.username}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {timeAgo(adj.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
