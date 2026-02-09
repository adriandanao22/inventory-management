"use client";

import { useRouter } from "next/navigation";
import { IoMdAdd, IoMdSearch } from "react-icons/io";
import { CiFilter } from "react-icons/ci";
import Link from "next/link";
import { Card } from "@/src/components/card";
import { useEffect, useState, useCallback } from "react";
import { Product } from "@/src/types/products";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (status) params.set("status", status);

      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();
      if (json.c === 200) {
        setProducts(json.d ?? []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [search, category, status]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchProducts]);

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
        <Link
          href="/dashboard/products/new"
          className="bg-indigo-600 px-2 py-1 rounded text-white flex items-center gap-2"
        >
          <IoMdAdd />
          Add Product
        </Link>
      </div>

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
                        product.stock > 100
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : product.stock > 50
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
