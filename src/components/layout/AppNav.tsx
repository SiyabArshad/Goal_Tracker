"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Calendar, LayoutDashboard, LogOut, Target, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
const navItems = [
  { href: "/today/", label: "Today", icon: CheckCircle },
  { href: "/dashboard/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/goals/", label: "Goals", icon: Target },
  { href: "/schedule/", label: "Schedule", icon: Calendar },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isGuest, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.push("/login/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/today/" className="text-lg font-bold text-indigo-600">
          GoalTracker
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname === href.replace(/\/$/, "");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {isGuest ? (
            <span className="hidden rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 sm:inline dark:bg-amber-900/50 dark:text-amber-200">
              Guest · local storage
            </span>
          ) : (
            <span className="hidden text-sm text-slate-500 sm:inline dark:text-slate-400">
              {user?.email}
            </span>
          )}
          <button
            onClick={handleSignOut}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={isGuest ? "Exit guest mode" : "Sign out"}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      <nav className="flex justify-around border-t border-slate-100 px-2 py-2 md:hidden dark:border-slate-800">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname === href.replace(/\/$/, "");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs ${
                active ? "text-indigo-600" : "text-slate-500"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
