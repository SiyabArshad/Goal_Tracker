"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, isGuest, loading, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (user || isGuest) && userId) {
      router.replace("/today/");
    }
  }, [user, isGuest, loading, userId, router]);

  if (loading) return <LoadingSpinner />;
  if (user || isGuest) return null;

  return <>{children}</>;
}
