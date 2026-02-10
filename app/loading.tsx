export default function Loading() {
  return (
    <div className="min-h-screen min-w-full flex items-center justify-center dark:bg-gray-700 bg-[#e3eaff]">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500 border-solid bg-white dark:bg-gray-800 shadow-lg mb-4"></div>
        <span className="text-lg sm:text-xl font-semibold text-indigo-600 dark:text-white">
          Loading InventoryPro...
        </span>
      </div>
    </div>
  );
}
