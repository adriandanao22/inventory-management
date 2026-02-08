"use client";

import { useState } from "react";
import { FiPackage, FiMenu, FiX } from "react-icons/fi";
import { ThemeSwitcher } from "./themeSwitcher";
import Link from "next/link";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#benefits", label: "Benefits" },
  { href: "#pricing", label: "Pricing" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[#e3eaff] dark:text-white dark:bg-gray-800">
      <div className="flex items-center justify-between p-4">
        <Link href="/" className="flex items-center">
          <FiPackage className="h-6 w-6 mr-2 text-indigo-500" />
          <p>InventoryPro</p>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center space-x-4">
          <li>
            <ThemeSwitcher />
          </li>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="hover:text-indigo-600 transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/dashboard"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </Link>
          </li>
        </ul>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeSwitcher />
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <FiX className="h-6 w-6" />
            ) : (
              <FiMenu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <ul className="flex flex-col items-center gap-4 pb-4 md:hidden">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="hover:text-indigo-600 transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
}
