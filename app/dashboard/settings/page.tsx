"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/src/context/authContext";
import { Card } from "@/src/components/card";
import { cn } from "@/src/lib/utils";
import Image from "next/image";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [lowStockLimit, setLowStockLimit] = useState<number>(5);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [profile, setProfile] = useState({ username: "", email: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      setProfile({
        username: user.username || "",
        email: user.email || "",
      });

      if (user.avatar_url) {
        setAvatarPreview(user.avatar_url);
      }
    }
  }, [user]);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/me/settings");
        const json = await res.json();
        if (json.c === 200) {
          setLowStockLimit(json.d.low_stock_limit);
        }
      } catch {
        // keep default
      } finally {
        setIsLoadingSettings(false);
      }
    }
    fetchSettings();
  }, []);

  const handleProfileUpdate = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);

        const avatarRes = await fetch("/api/me/avatar", {
          method: "PUT",

          body: formData,
        });

        const avatarJson = await avatarRes.json();
        if (avatarJson.c !== 200) {
          setMessage({
            type: "error",
            text: avatarJson.m || "Failed to upload avatar",
          });
          setIsUpdating(false);
          return;
        }
      }

      const res = await fetch("/api/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ d: profile }),
      });
      const json = await res.json();
      if (json.c === 200) {
        setMessage({ type: "success", text: "Profile updated successfully" });
      } else {
        setMessage({
          type: "error",
          text: json.m || "Failed to update profile",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Failed to update profile: " + message?.text,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setMessage(null);

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters",
      });
      return;
    }

    setIsUpdating(true);

    try {
      const res = await fetch("/api/me/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          d: {
            currentPassword: passwords.currentPassword,
            newPassword: passwords.newPassword,
          },
        }),
      });
      const json = await res.json();
      if (json.c === 200) {
        setMessage({ type: "success", text: "Password changed successfully" });
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setMessage({
          type: "error",
          text: json.m || "Failed to change password",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to change password" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLowStockUpdate = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    try {
      const res = await fetch("/api/me/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ d: { low_stock_limit: lowStockLimit } }),
      });
      const json = await res.json();
      if (json.c === 200) {
        setMessage({ type: "success", text: "Low stock limit updated" });
      } else {
        setMessage({
          type: "error",
          text: json.m || "Failed to update low stock limit",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update low stock limit" });
    } finally {
      setIsUpdating(false);
    }
  };

  const inputClass =
    "w-full border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your account and preferences
          </p>
        </div>

        <button
          className="bg-indigo-600 px-4 py-2 rounded text-white hover:bg-indigo-700 transition-colors"
          onClick={() => logout()}
        >
          Log Out
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`px-4 py-3 rounded-md text-sm ${
            message.type === "success"
              ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
              : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Information */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
          Profile Information
        </h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar Preview */}
            <div className="flex flex-col items-center gap-2">
              <label className={cn(labelClass, "mb-0")}>Profile Picture</label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative w-28 h-28 rounded-full overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                {avatarPreview ? (
                  <Image
                    height={250}
                    width={250}
                    src={avatarPreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 mb-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                      />
                    </svg>
                    <span className="text-xs">Upload</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
                    />
                  </svg>
                </div>
              </button>
              <input
                ref={fileInputRef}
                id="profile"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setAvatarPreview(url);
                    setAvatarFile(file);
                  }
                }}
              />
              {avatarPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Text Fields */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
              <div>
                <label htmlFor="username" className={labelClass}>
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={profile.username}
                  onChange={(e) =>
                    setProfile({ ...profile, username: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="bg-indigo-600 px-4 py-2 rounded text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Card>

      {/* Notifications */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
          Notifications
        </h2>
        <form onSubmit={handleLowStockUpdate} className="space-y-4">
          <div className="max-w-xs">
            <label htmlFor="lowStockLimit" className={labelClass}>
              Low Stock Alert Threshold
            </label>
            <input
              id="lowStockLimit"
              type="number"
              min={0}
              value={isLoadingSettings ? "" : lowStockLimit}
              disabled={isLoadingSettings}
              onChange={(e) => setLowStockLimit(parseInt(e.target.value) || 0)}
              className={inputClass}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              You will receive a notification when any product&apos;s stock
              falls at or below this number.
            </p>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUpdating || isLoadingSettings}
              className="bg-indigo-600 px-4 py-2 rounded text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Card>

      {/* Change Password */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
          Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="currentPassword" className={labelClass}>
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                required
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    currentPassword: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="newPassword" className={labelClass}>
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                required
                minLength={6}
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className={labelClass}>
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={6}
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirmPassword: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="bg-indigo-600 px-4 py-2 rounded text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? "Updating..." : "Change Password"}
            </button>
          </div>
        </form>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 border-b border-gray-200 dark:border-gray-700 pb-2">
          Danger Zone
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              Delete Account
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Permanently delete your account and all associated data.
            </p>
          </div>
          <button
            onClick={() => alert("Account deletion is not yet implemented.")}
            className="bg-red-700 px-4 py-2 rounded text-white hover:bg-red-800 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </Card>
    </div>
  );
}
