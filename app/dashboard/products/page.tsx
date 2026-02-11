"use client";

import { useRouter } from "next/navigation";
import { IoMdAdd, IoMdSearch } from "react-icons/io";
import { CiFilter } from "react-icons/ci";
import { Card } from "@/src/components/card";
import { useEffect, useState, useCallback } from "react";
import { Product } from "@/src/types/products";
import Response from "@/src/components/response";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import ProductForm from "./ProductForm";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [showForm, setShowForm] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (status) params.set("status", status);
      params.set("page", page.toString());
      params.set("limit", limit.toString());

      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();
      if (json.c === 200) {
        setProducts(json.d.items ?? []);
        setTotal(json.d?.total ?? 0);
        setMessage(null);
      } else {
        setMessage(json.m || "Failed to load products");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setMessage("Network error while fetching products");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  }, [search, category, status, page, limit]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const getPageList = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
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
    const debounce = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchProducts]);

  useEffect(() => {
    setPage(1);
  }, [search, category, status]);

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (status) params.set("status", status);
      params.set("page", page.toString());
      params.set("limit", limit.toString());

      const res = await fetch(`/api/products/export?${params.toString()}`);
      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("text/csv")) {
        const json = await res.json();
        const blob = new Blob([json.d], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "products.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        setMessage("Products exported successfully");
        setMessageType("success");
      } else {
        let errMsg = "Failed to export products";
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
      console.error("Error exporting products:", error);
      setMessage(
        "Failed to export products: " +
          (error instanceof Error ? error.message : String(error)),
      );
      setMessageType("error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Products
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your product inventory
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            className="bg-indigo-600 px-2 py-1 rounded text-white flex items-center gap-2"
            onClick={() => setShowForm(true)}
          >
            <IoMdAdd />
            Add Product
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

      {showForm && (
        <div className="fixed inset-0 z-50 h-screen mx-auto flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-xl w-full p-4 relative">
            <ProductForm
              onSuccess={() => {
                setShowForm(false);
                fetchProducts();
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <Card className="p-3">
        <div className="flex items-center gap-4 w-full">
          <div className="relative flex-1 ">
            <IoMdSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 pl-10 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Search products..."
            />
          </div>
          <div className="relative flex-1">
            <CiFilter className="absolute left-3 top-3 text-gray-400" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 pl-10 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none"
            >
              <option value="">All</option>
              <option value="Electronics">Electronics</option>
              <option value="Accessories">Accessories</option>
              <option value="Furniture">Furniture</option>
              <option value="Stationery">Stationery</option>
            </select>
          </div>
          <div className="relative flex-1">
            <CiFilter className="absolute left-3 top-3 text-gray-400" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 pl-10 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none"
            >
              <option value="">All</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Pagination Info */}
      <Card className="flex items-center justify-center p-3 space-x-5">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {total > 0 ? (
            <span>
              Showing{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {startItem} &mdash; {endItem}
              </span>{" "}
              of <span className="font-medium">{total}</span> results
            </span>
          ) : (
            <span className="text-gray-500">No adjustments</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            aria-label="Previous page"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="cursor-pointer"
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
                className={`px-3 py-1 rounded-md border ${
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
            className="cursor-pointer"
          >
            <FaArrowRight />
          </button>

          <div className="ml-3 flex items-center gap-2">
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

      {/* Product Table */}
      <Card className="p-0 overflow-hidden">
        <table className="w-full bg-white dark:bg-gray-900">
          <thead className="">
            <tr className="bg-gray-50 dark:bg-gray-900 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
              <th className="px-6 py-3 text-center">Name</th>
              <th className="px-6 py-3 text-center">SKU</th>
              <th className="px-6 py-3 text-center">Category</th>
              <th className="px-6 py-3 text-center">Stock</th>
              <th className="px-6 py-3 text-center">Price</th>
              <th className="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  onClick={() =>
                    router.push(`/dashboard/products/${product.id}`)
                  }
                  className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white text-center">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-center">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-center">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white text-center">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white text-center">
                    ${product.price}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        product.stock > product.min_stock
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : product.stock > 0
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {product.status}
                    </span>
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
