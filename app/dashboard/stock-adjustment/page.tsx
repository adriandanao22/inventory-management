"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/src/components/card";
import { Product } from "@/src/types/products";
import { StockAdjustment } from "@/src/types/stockAdjustments";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
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
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState("");

  const [form, setForm] = useState({
    product_id: "",
    type: "incoming" as "incoming" | "outgoing",
    units: "",
    reason: "",
  });

  const fetchAdjustments = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterType) params.set("type", filterType);

      const res = await fetch(`/api/stock-adjustments?${params.toString()}`);
      const json = await res.json();
      if (json.c === 200) {
        setAdjustments(json.d ?? []);
      }
    } catch (error) {
      console.error("Error fetching adjustments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    fetchAdjustments();
  }, [fetchAdjustments]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const json = await res.json();
        if (json.c === 200) {
          setProducts(json.d ?? []);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/stock-adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          d: {
            product_id: form.product_id,
            type: form.type,
            units: parseInt(form.units),
            reason: form.reason,
            user_id: "",
          },
        }),
      });
      const json = await res.json();
      if (json.c === 201) {
        setForm({ product_id: "", type: "incoming", units: "", reason: "" });
        setShowForm(false);
        fetchAdjustments();
      } else {
        alert(json.m || "Failed to create adjustment");
      }
    } catch (error) {
      console.error("Error creating adjustment:", error);
      alert("Failed to create adjustment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Stock Adjustments
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track incoming and outgoing stock movements
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 px-3 py-2 rounded text-white flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <IoMdAdd />
          New Adjustment
        </button>
      </div>

      {/* New Adjustment Form */}
      {showForm && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            New Stock Adjustment
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="product_id" className={labelClass}>
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  id="product_id"
                  required
                  value={form.product_id}
                  onChange={(e) =>
                    setForm({ ...form, product_id: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="">Select a product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — {p.stock} in stock
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="type" className={labelClass}>
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  required
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value as "incoming" | "outgoing",
                    })
                  }
                  className={inputClass}
                >
                  <option value="incoming">Incoming</option>
                  <option value="outgoing">Outgoing</option>
                </select>
              </div>
              <div>
                <label htmlFor="units" className={labelClass}>
                  Units <span className="text-red-500">*</span>
                </label>
                <input
                  id="units"
                  type="number"
                  required
                  min="1"
                  value={form.units}
                  onChange={(e) => setForm({ ...form, units: e.target.value })}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="reason" className={labelClass}>
                  Reason
                </label>
                <input
                  id="reason"
                  type="text"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="e.g. Restock from supplier"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 px-4 py-2 rounded text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Adjustment"}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Filter */}
      <Card className="p-3">
        <div className="flex items-center gap-4">
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
      </Card>

      {/* Adjustments List */}
      <Card className="p-0 overflow-hidden">
        <table className="w-full bg-white dark:bg-gray-900">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3 text-center">Units</th>
              <th className="px-6 py-3">Reason</th>
              <th className="px-6 py-3">By</th>
              <th className="px-6 py-3">When</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  Loading adjustments...
                </td>
              </tr>
            ) : adjustments.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
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
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {adj.products?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {adj.products?.sku}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-gray-900 dark:text-white">
                    {adj.type === "incoming" ? "+" : "-"}
                    {adj.units}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {adj.reason || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {adj.users?.username}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {timeAgo(adj.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
