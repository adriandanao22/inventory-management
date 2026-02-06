import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              &copy; 2026 InventoryPro. All rights reserved.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="#"
              className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
            >
              Privacy Policy
            </Link>
            <span className="mx-2">|</span>
            <Link
              href="#"
              className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
