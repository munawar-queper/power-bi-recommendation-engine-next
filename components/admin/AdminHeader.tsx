"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type AdminHeaderProps = {
  title?: string;
};

export default function AdminHeader({ title = "Admin Panel" }: AdminHeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const onLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/session", {
        method: "DELETE",
      });
    } finally {
      setLoggingOut(false);
      router.push("/admin/login");
      router.refresh();
    }
  };

  return (
    <header className="bg-[#F1C714] border-b border-black/10 sticky top-0 z-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="AMZ Logo" className="h-10 sm:h-12 w-auto" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/70">AMZ LMS</p>
            <h1 className="text-lg sm:text-xl font-semibold text-black">{title}</h1>
          </div>
        </div>

        <Button
          variant="outline"
          className="bg-white/90 border-black/20"
          onClick={onLogout}
          disabled={loggingOut}
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </header>
  );
}
