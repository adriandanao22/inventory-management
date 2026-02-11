"use client";

import { useState } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import ReCAPTCHA from "react-google-recaptcha";
import Link from "next/link";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordMatch = password === confirmPassword;
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!captchaToken) {
      setError("Please complete the reCAPTCHA");
      return;
    }

    const form = e.currentTarget;

    const email = form.email.value;
    const username = form.username.value;
    const password = form.password.value;
    const confirmPassword = form["confirm-password"].value;

    if (
      email === "" ||
      username === "" ||
      password === "" ||
      confirmPassword === ""
    ) {
      setError("All fields are required");
      return;
    }

    if (!passwordMatch) {
      setError("Password does not match");
      return;
    }

    fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        c: 200,
        m: "Signup successful",
        d: {
          token: captchaToken,
          email,
          username,
          password,
          confirmPassword,
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.c === 200) {
          form.reset();
          setCaptchaToken(null);
          setError("");
          window.location.href = "/login";
        } else {
          setError(data.m || "Signup failed");
        }
      });
  };
  return (
    <div className="min-h-screen w-full bg-[#e3eaff] dark:bg-gray-800">
      <div className="container mx-auto flex min-h-screen items-center justify-center px-6 py-16">
        <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white/90 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Sign Up
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Enter your details to get started.
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
                  htmlFor="username"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
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
                    name="password"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    autoComplete="new-password"
                    placeholder="Enter your password"
                    onChange={(e) => setPassword(e.target.value)}
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
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirm-password"
                    name="confirm-password"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
              <p className="text-sm text-red-500">{error}</p>
              <ReCAPTCHA
                className="flex justify-center"
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                onChange={(token) => setCaptchaToken(token)}
              />
              <button
                type="submit"
                className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
              >
                Sign up
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-300"
              >
                Log in
              </Link>
            </p>
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Join InventoryPro today
            </h1>
            <p className="mt-3 text-lg text-gray-700 dark:text-gray-300">
              Create your account to track inventory, set alerts, and get
              real-time insights from day one.
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
                No Credit Card
              </span>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
                Fast Setup
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
