"use client";

import { useState } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import ReCAPTCHA from "react-google-recaptcha";

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
        token: captchaToken,
        email,
        username,
        password,
        confirmPassword,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert(data.success);
          form.reset();
          setCaptchaToken(null);
        }
      });
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold text-white">Sign Up</h1>
          <p className="mt-2 text-sm text-slate-300">
            Create a new account. Please enter your details.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-200"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none ring-0 transition focus:border-indigo-400/60 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/40"
              autoComplete="email"
              placeholder="Enter your email"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="username"
              className="text-sm font-medium text-slate-200"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none ring-0 transition focus:border-indigo-400/60 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/40"
              autoComplete="username"
              placeholder="Enter your username"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-200"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-10 text-sm text-white placeholder:text-slate-400 outline-none ring-0 transition focus:border-indigo-400/60 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/40"
                autoComplete="current-password"
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button" // Prevent form submission
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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
              className="text-sm font-medium text-slate-200"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="confirm-password"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-10 text-sm text-white placeholder:text-slate-400 outline-none ring-0 transition focus:border-indigo-400/60 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/40"
                autoComplete="current-password"
                placeholder="Enter your password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button" // Prevent form submission
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {showPassword ? (
                  <IoMdEyeOff className="text-2xl" />
                ) : (
                  <IoMdEye className="text-2xl" />
                )}
              </button>
            </div>
          </div>
          <p className="text-red-500 text-sm">{error}</p>
          <ReCAPTCHA
            className="flex justify-center"
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            onChange={(token) => setCaptchaToken(token)}
          />
          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
          >
            Sign up
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-medium text-indigo-400 hover:underline"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
