"use client";

import { useState, useEffect } from "react";
import { Card } from "@/src/components/card";
import Response from "@/src/components/response";
import { Product } from "@/src/types/products";

interface StockAdjustmentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function StockAdjustmentForm({
  onSuccess,
  onCancel,
}: StockAdjustmentFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [form, setForm] = useState({
    product_id: "",
    type: "incoming" as "incoming" | "outgoing",
    units: "",
    reason: "",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const json = await res.json();
        if (json.c === 200) {
          setProducts(json.d.items ?? []);
          setMessage(null);
        } else {
          setMessage(json.m || "Failed to load products");
          setMessageType("error");
        }
      } catch (error) {
        setMessage(
          "Network error while fetching products" +
            (error instanceof Error ? error.message : String(error)),
        );
        setMessageType("error");
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
        setMessage("Stock adjustment created successfully.");
        setMessageType("success");
        if (onSuccess) onSuccess();
      } else {
        setMessage(json.m || "Failed to create adjustment");
        setMessageType("error");
      }
    } catch (error) {
      setMessage(
        "Failed to create adjustment: " +
          (error instanceof Error ? error.message : String(error)),
      );
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <Card className="p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        New Stock Adjustment
      </h2>
      <Response message={message} type={messageType} className="mb-4" />
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
              onChange={(e) => setForm({ ...form, product_id: e.target.value })}
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
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-indigo-600 px-4 py-2 rounded text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Adjustment"}
          </button>
        </div>
      </form>
    </Card>
  );
}
