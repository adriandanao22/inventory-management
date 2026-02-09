"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/context/authContext";
import { Card } from "@/src/components/card";

export default function SettingsPage() {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [profile, setProfile] = useState({
    username: "",
    email: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [lowStockLimit, setLowStockLimit] = useState<number>(5);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    if (user) {
      setProfile({
        username: user.username || "",
        email: user.email || "",
      });
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
      setMessage({ type: "error", text: "Failed to update profile" });
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

  const handleLowStockUpdate = async (e: React.FormEvent) => {
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your account and preferences
        </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
