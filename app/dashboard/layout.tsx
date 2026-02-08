"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { FiPackage } from "react-icons/fi";
import { MdOutlineDashboard } from "react-icons/md";
import Image from "next/image";
import { useAuth } from "@/src/context/authContext";
import { ReactNode } from "react";
import { FaArrowTrendUp } from "react-icons/fa6";

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
];

const userMenuItems = [
  { label: "Profile", action: "profile" },
  { label: "Logout", action: "logout" },
];

function NavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className={`flex items-center gap-2 rounded px-2 py-1 transition-colors ${
          active
            ? "bg-indigo-200 dark:bg-indigo-700"
            : "hover:bg-indigo-100 dark:hover:bg-indigo-500"
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { logout } = useAuth();

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuAction = async (action: string) => {
    setUserMenuOpen(false);
    if (action === "logout") await logout();
    // Add other actions here (e.g., navigate to profile)
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Sidebar */}
      <aside
        className={`bg-white dark:bg-gray-800 fixed lg:static inset-y-0 left-0 w-64 transform transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 z-50`}
      >
        <div className="flex gap-2 justify-center items-center h-20 border-b border-gray-200 dark:border-gray-700">
          <Link href="/" className="flex items-center gap-2">
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
                active={pathname === link.href}
              />
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="relative min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="flex items-center justify-between lg:justify-end h-20 border-b border-gray-200 dark:border-gray-700 px-6 bg-white dark:bg-white/5">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="lg:hidden p-4"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              aria-label="User menu"
            >
              <Image
                src="/unknown-user.jpg"
                alt="User Avatar"
                width={40}
                height={40}
                className="rounded-full"
              />
            </button>
            {userMenuOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
                <ul className="space-y-1 p-2">
                  {userMenuItems.map((item) => (
                    <li
                      key={item.action}
                      onClick={() => handleMenuAction(item.action)}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded"
                    >
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 bg-gray-300 dark:bg-gray-700 flex-1">
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
