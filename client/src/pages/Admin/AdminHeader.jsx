import { Button } from "@/components/ui/button";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import { LogOut, Moon, Shield, Sun } from "lucide-react";
import React, { useEffect, useState } from "react";

function AdminHeader() {
  const currentUser = useCurrentUser();
  const logoutMutation = useLogout();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const savedTheme = window.localStorage.getItem("theme");
    if (savedTheme) return savedTheme === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      window.localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      window.localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  return (
    <header className="sticky top-0 z-40 border-b border-[#8d775e]/20 bg-[#f5f1ec]/95 dark:bg-[#0a0908]/95 backdrop-blur-md">
      <div className="max-w-[1500px] mx-auto h-16 px-4 lg:px-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logoicon.png" alt="Manara Logo" className="h-8 w-auto" />
          <div className="leading-tight">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#8d775e] font-semibold">
              Admin Workspace
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-200">User Management</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1 rounded-full border border-[#8d775e]/30 px-3 py-1.5 text-xs bg-[#8d775e]/10 text-[#7a664f] dark:text-[#d8c8b5]">
            <Shield size={13} />
            {currentUser?.email}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={() => setIsDarkMode((prev) => !prev)}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          <Button
            variant="outline"
            className="rounded-xl"
            disabled={logoutMutation.isPending}
            onClick={() => logoutMutation.mutateAsync()}
          >
            <LogOut size={14} />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
