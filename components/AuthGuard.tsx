"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { getToken } from "@/lib/auth";
import { useIsClient } from "@/lib/useIsClient";

// Every page in this group requires a login; unauthenticated users go to /login.
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isClient = useIsClient();
  const loggedIn = isClient && Boolean(getToken());

  useEffect(() => {
    if (isClient && !loggedIn) router.replace("/login");
  }, [isClient, loggedIn, router]);

  if (!loggedIn) return null;

  return (
    <div className="flex min-h-screen bg-[#F0F1F3]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
