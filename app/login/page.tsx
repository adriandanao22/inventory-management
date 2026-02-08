"use client";

import { useState } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import Link from "next/link";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    const username = form.username.value;
    const password = form.password.value;

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        c: 200,
        m: "Login successful",
        d: { username, password },
      }),
    });

    const data = await res.json();
    if (data.c == 200) {
      window.location.href = "/dashboard";
    } else {
      setError(data.m || "Login failed");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#e3eaff] dark:bg-gray-800">
      <div className="container mx-auto flex min-h-screen items-center justify-center px-6 py-16">
        <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-2">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Welcome back to InventoryPro
            </h1>
            <p className="mt-3 text-lg text-gray-700 dark:text-gray-300">
              Log in to manage stock, monitor alerts, and review analytics from
              one place.
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
                Secure Access
              </span>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
                Real-time Insights
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white/90 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Log In
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Enter your credentials to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label
                  htmlFor="username"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  autoComplete="username"
                  placeholder="Enter your username"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 transition hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:text-gray-300"
                  >
                    {showPassword ? (
                      <IoMdEyeOff className="text-2xl" />
                    ) : (
                      <IoMdEye className="text-2xl" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-sm text-red-600">{error}</p>

              <button
                type="submit"
                className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
              >
                Sign in
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-300"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
