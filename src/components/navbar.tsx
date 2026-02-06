"use client";

import { FiPackage } from "react-icons/fi";
import { ThemeSwitcher } from "./themeSwitcher";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex p-4 bg-[#e3eaff] dark:text-white dark:bg-gray-800">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <FiPackage className="h-6 w-6 mr-2 text-indigo-500" />
          <p className="">InventoryPro</p>
        </Link>
      </div>
      <ul className="flex space-x-4 left-0 ml-auto">
        <li>
          <a>
            <ThemeSwitcher />
          </a>
        </li>
        <li>
          <Link href="#features" className="">
            Features
          </Link>
        </li>
        <li>
          <Link href="#benefits" className="">
            Benefits
          </Link>
        </li>
        <li>
          <Link href="#pricing" className="">
            Pricing
          </Link>
        </li>
        <li>
          <Link
            href="/dashboard"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </Link>
        </li>
      </ul>
    </nav>
  );
}
