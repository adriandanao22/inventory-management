"use client";

import { useEffect, useState } from "react";
import { FiPackage } from "react-icons/fi";
import { ThemeSwitcher } from "./themeSwitcher";

export default function Navbar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <nav className="flex p-4 bg-[#e3eaff] dark:text-white dark:bg-gray-800">
      <div className="flex items-center">
        <a href="/" className="flex items-center">
          <FiPackage className="h-6 w-6 mr-2 text-indigo-500" />
          <p className="">InventoryPro</p>
        </a>
      </div>
      <ul className="flex space-x-4 left-0 ml-auto">
        <li>
          <a>
            <ThemeSwitcher />
          </a>
        </li>
        <li>
          <a href="#" className="">
            Features
          </a>
        </li>
        <li>
          <a href="#" className="">
            Benefits
          </a>
        </li>
        <li>
          <a href="#" className="">
            Pricing
          </a>
        </li>
        <li>
          <a
            href="#"
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Get Started
          </a>
        </li>
      </ul>
    </nav>
  );
}
