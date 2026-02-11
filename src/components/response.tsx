export default function Response({
  message,
  type = "error",
  className = "",
}: {
  message?: string | null;
  type?: "error" | "success" | "info";
  className?: string;
}) {
  if (!message) return null;

  const base = "rounded-md px-4 py-2 text-sm flex items-center justify-between";
  const colors =
    type === "error"
      ? "bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300"
      : type === "success"
        ? "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
        : "bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300";

  return (
    <div role="alert" className={`${base} ${colors} ${className}`}>
      <div className="truncate">{message}</div>
    </div>
  );
}
