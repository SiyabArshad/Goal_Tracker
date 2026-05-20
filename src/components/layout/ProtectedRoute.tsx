"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isGuest, userId, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && !isGuest) {
      router.replace("/login/");
    }
  }, [user, isGuest, loading, router]);

  if (loading) return <LoadingSpinner />;
  if (!userId) return null;

  return <>{children}</>;
}
