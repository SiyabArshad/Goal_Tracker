"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function HomePage() {
  const { user, isGuest, userId, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(user || isGuest ? "/today/" : "/login/");
    }
  }, [user, isGuest, userId, loading, router]);

  return <LoadingSpinner />;
}
