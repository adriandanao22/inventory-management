import { CiWarning } from "react-icons/ci";

export default function NotFound() {
  return (
    <div className="flex flex-col justify-center items-center h-screen w-full mx-auto">
      <div className="bg-gray-200 dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <div>
          <CiWarning className="mx-auto mb-4 h-16 w-16" />
          <h1 className="text-3xl">Page Not Found</h1>
        </div>
        <p>
          Opps! This page does not exist. Please check the URL and try again.
        </p>
      </div>
    </div>
  );
}
