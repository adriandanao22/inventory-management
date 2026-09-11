"use client";

import { useState } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import Link from "next/link";

export default function ForgotPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const form = e.currentTarget;
    const email = form.email.value;
    const newPassword = form["new-password"].value;
    const confirmPassword = form["confirm-password"].value;

    if (email === "" || newPassword === "" || confirmPassword === "") {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password does not match");
      return;
    }

    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        c: 200,
        m: "Password reset requested",
        d: { email, newPassword, confirmPassword },
      }),
    });

    const data = await res.json();
    if (data.c === 200) {
      form.reset();
      setSuccess("Password updated. Redirecting to log in...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } else {
      setError(data.m || "Password reset failed");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#e3eaff] dark:bg-gray-800">
      <div className="container mx-auto flex min-h-screen items-center justify-center px-6 py-16">
        <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-2">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Reset your password
            </h1>
            <p className="mt-3 text-lg text-gray-700 dark:text-gray-300">
              Enter the email on your account and choose a new password to get
              back into InventoryPro.
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
                Secure Access
              </span>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
                Quick Recovery
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white/90 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Forgot Password
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Set a new password for your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  autoComplete="email"
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="new-password"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="new-password"
                    name="new-password"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    autoComplete="new-password"
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button" // Prevent form submission
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

              <div className="space-y-1">
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirm-password"
                    name="confirm-password"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    autoComplete="new-password"
                    placeholder="Re-enter your new password"
                  />
                  <button
                    type="button" // Prevent form submission
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

              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}

              <button
                type="submit"
                className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
              >
                Update password
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-600 dark:text-gray-400">
              Remembered it?{" "}
              <Link
                href="/login"
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-300"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
