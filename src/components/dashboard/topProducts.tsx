import { useDashboardData } from ".";
import { Card } from "../card";

export default function TopProducts() {
  const data = useDashboardData();

  const topProducts = data?.topProducts.slice(0, 5) ?? [];

  return (
    <Card>
      <h1 className="font-semibold text-xl text-gray-900 dark:text-white">
        Top Products
      </h1>
      {topProducts.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
          No data yet
        </p>
      ) : (
        <table className="w-full">
          <tbody>
            {topProducts.map((product, i) => (
              <tr
                key={`${product.product_id}-${i}`}
                className={
                  i < topProducts.length - 1
                    ? "border-b border-gray-200 dark:border-gray-700"
                    : ""
                }
              >
                <td className="py-2 flex items-center gap-4">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-md flex items-center justify-center font-semibold">
                    {i + 1}
                  </span>
                  <div className="grow text-sm">
                    <div className="flex justify-between">
                      <h1 className="font-semibold text-gray-900 dark:text-white">
                        {product.name}
                      </h1>
                      <p className="text-gray-500 dark:text-gray-400">
                        {product.stock} Left
                      </p>
                    </div>
                    <div className="flex justify-between text-sm">
                      <p className="text-gray-500 dark:text-gray-400">
                        {product.units} Units sold
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
