"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { IoMdArrowBack } from "react-icons/io";
import { Card } from "@/src/components/card";
import { Product } from "@/src/types/products";

export default function ProductViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const json = await res.json();
        if (json.c === 200) {
          setProduct(json.d);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.c === 200) {
        router.push("/dashboard/products");
      } else {
        alert(json.m || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500 dark:text-gray-400">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
        >
          <IoMdArrowBack /> Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Product Not Found
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          The product you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    );
  }

  const statusColor =
    product.status === "In Stock"
      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      : product.status === "Low Stock"
        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
        : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-1 text-indigo-600 hover:underline text-sm mb-2"
          >
            <IoMdArrowBack /> Back to Products
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {product.name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">SKU: {product.sku}</p>
        </div>
        <div className="space-x-2">
          <button className="bg-indigo-600 py-2 rounded text-white hover:bg-indigo-700 transition-colors">
            <Link
              href={`/dashboard/products/${product.id}/edit`}
              className="px-4 py-2"
            >
              Edit Product
            </Link>
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-700 px-4 py-2 rounded text-white hover:bg-red-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete Product"}
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Info */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            General Information
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Name</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {product.name}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">SKU</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {product.sku}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Category</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {product.category}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Price</p>
              <p className="font-medium text-gray-900 dark:text-white">
                ${product.price.toFixed(2)}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500 dark:text-gray-400">Description</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {product.description}
              </p>
            </div>
          </div>
        </Card>

        {/* Stock Info */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Stock Information
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Current Stock</p>
              <p className="font-medium text-lg text-gray-900 dark:text-white">
                {product.stock}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}
              >
                {product.status}
              </span>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Minimum Stock</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {product.min_stock}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Last Restocked</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {product.last_restocked ?? "N/A"}
              </p>
            </div>
          </div>
        </Card>

        {/* Supplier & Location */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Supplier & Location
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Supplier</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {product.supplier}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Location</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {product.location}
              </p>
            </div>
          </div>
        </Card>

        {/* Metadata */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Metadata
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Created</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(product.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Product ID</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {product.id}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
