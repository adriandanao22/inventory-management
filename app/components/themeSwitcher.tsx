"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { MdOutlineComputer } from "react-icons/md";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div>
      {theme === "dark" ? (
        <FiMoon
          className="h-6 w-6 cursor-pointer"
          onClick={() => setTheme("light")}
        />
      ) : theme === "light" ? (
        <FiSun
          className="h-6 w-6 cursor-pointer"
          onClick={() => setTheme("system")}
        />
      ) : (
        <MdOutlineComputer
          className="h-6 w-6 cursor-pointer"
          onClick={() => setTheme("dark")}
        />
      )}
    </div>
  );
}
