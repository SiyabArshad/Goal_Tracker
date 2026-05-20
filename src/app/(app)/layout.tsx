import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppNav } from "@/components/layout/AppNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AppNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </ProtectedRoute>
  );
}
