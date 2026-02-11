"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IoMdArrowBack } from "react-icons/io";
import { Card } from "@/src/components/card";

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    description: "",
    stock: "",
    minStock: "",
    supplier: "",
    location: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const stock = parseInt(form.stock) || 0;
      const minStock = parseInt(form.minStock) || 0;
      let status: string;
      if (stock === 0) status = "Out of Stock";
      else if (stock <= minStock) status = "Low Stock";
      else status = "In Stock";

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          d: {
            name: form.name,
            sku: form.sku,
            category: form.category,
            price: parseFloat(form.price),
            description: form.description,
            stock,
            min_stock: minStock,
            supplier: form.supplier,
            location: form.location,
            status,
          },
        }),
      });
      const json = await res.json();
      if (json.c === 201) {
        router.push("/dashboard/products");
      } else {
        console.log("Error creating product:", json.m);
        setMessage(json.m || "Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      setMessage("Failed to create product");
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
      <div>
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-1 text-indigo-600 hover:underline text-sm mb-2"
        >
          <IoMdArrowBack /> Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          New Product
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Create a new product in your inventory
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Information */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            General Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className={labelClass}>
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Mechanical Keyboard"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="sku" className={labelClass}>
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                id="sku"
                name="sku"
                type="text"
                required
                value={form.sku}
                onChange={handleChange}
                placeholder="e.g. KB 001"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="category" className={labelClass}>
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                required
                value={form.category}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select a category</option>
                <option value="Electronics">Electronics</option>
                <option value="Accessories">Accessories</option>
                <option value="Furniture">Furniture</option>
                <option value="Stationery">Stationery</option>
              </select>
            </div>
            <div>
              <label htmlFor="price" className={labelClass}>
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                required
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className={labelClass}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the product..."
                className={inputClass}
              />
            </div>
          </div>
        </Card>

        {/* Stock Information */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Stock Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="stock" className={labelClass}>
                Initial Stock <span className="text-red-500">*</span>
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                required
                min="0"
                value={form.stock}
                onChange={handleChange}
                placeholder="0"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="minStock" className={labelClass}>
                Minimum Stock Level
              </label>
              <input
                id="minStock"
                name="minStock"
                type="number"
                min="0"
                value={form.minStock}
                onChange={handleChange}
                placeholder="0"
                className={inputClass}
              />
            </div>
          </div>
        </Card>

        {/* Supplier & Location */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Supplier & Location
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="supplier" className={labelClass}>
                Supplier
              </label>
              <input
                id="supplier"
                name="supplier"
                type="text"
                value={form.supplier}
                onChange={handleChange}
                placeholder="e.g. TechParts Inc."
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="location" className={labelClass}>
                Warehouse Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Warehouse A - Shelf 3"
                className={inputClass}
              />
            </div>
          </div>
        </Card>

        {message && (
          <div className="text-sm text-red-500 dark:text-red-400">
            <p>{message}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/dashboard/products"
            className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 px-4 py-2 rounded text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
