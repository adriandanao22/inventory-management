import ProtectedRoute from "@/src/components/protectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>
        <h1>This is the Dashboard</h1>
      </div>
    </ProtectedRoute>
  );
}
