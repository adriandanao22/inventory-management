"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { FiPackage } from "react-icons/fi";
import { MdOutlineDashboard } from "react-icons/md";
import Image from "next/image";
import { ReactNode } from "react";
import { FaArrowTrendUp } from "react-icons/fa6";
import { IoSettingsOutline } from "react-icons/io5";
import { User } from "@/src/types/user";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: <MdOutlineDashboard /> },
  {
    href: "/dashboard/products",
    label: "Products",
    icon: <FiPackage />,
  },
  {
    href: "/dashboard/stock-adjustment",
    label: "Stock Adjustments",
    icon: <FaArrowTrendUp />,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: <IoSettingsOutline />,
  },
];

function NavLink({
  href,
  label,
  icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className={`flex items-center gap-2 rounded px-2 py-1 transition-colors ${
          active
            ? "bg-indigo-100 dark:bg-indigo-600 text-indigo-700 dark:text-white"
            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        }`}
      >
        {icon}
        {label}
      </Link>
    </li>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setUser(data.c === 200 ? data.d.user : null))
      .catch((error) => console.error("Failed to fetch user:", error));
  }, []);

  console.log("Current user in DashboardLayout:", user?.avatar_url);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Sidebar */}
      <aside
        className={`bg-white dark:bg-gray-900 fixed lg:static inset-y-0 left-0 w-64 transform transition-transform border-r border-gray-200 dark:border-gray-700 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 z-50`}
      >
        <div className="flex gap-2 justify-center items-center h-20 border-b border-gray-200 dark:border-gray-700">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-gray-800 dark:text-white"
          >
            <FiPackage className="text-2xl text-indigo-500" />
            InventoryPro
          </Link>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                {...link}
                active={isActive(link.href)}
                onClick={() => setSidebarOpen(false)}
              />
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="relative min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="flex items-center justify-between lg:justify-end h-20 border-b border-gray-200 dark:border-gray-700 px-6 bg-white dark:bg-gray-900">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="lg:hidden p-4"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <div className="relative">
            <div
              aria-label="User menu"
              className="border-2 dark:border-gray-200/50 border-gray-700 rounded-full"
            >
              {user ? (
                <Image
                  src={user.avatar_url || "/unknown-user.jpg"}
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 bg-gray-100 dark:bg-gray-800 flex-1">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/25 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
