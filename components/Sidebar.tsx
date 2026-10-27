"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";
import {
  HomeIcon,
  InventoryIcon,
  LogoutIcon,
  OrderIcon,
  ReportIcon,
  SettingsIcon,
  StoreIcon,
  SupplierIcon,
} from "./icons";
import { clearSession } from "@/lib/auth";

// Only Inventory is implemented; the rest are shown to match the design.
const NAV = [
  { label: "Dashboard", icon: HomeIcon, href: null },
  { label: "Inventory", icon: InventoryIcon, href: "/inventory" },
  { label: "Reports", icon: ReportIcon, href: null },
  { label: "Suppliers", icon: SupplierIcon, href: null },
  { label: "Orders", icon: OrderIcon, href: null },
  { label: "Manage Store", icon: StoreIcon, href: null },
];

const itemClass = "flex items-center gap-4 rounded-lg px-3 py-3 text-base transition-colors";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-[270px] shrink-0 flex-col border-r border-[#F0F1F3] bg-white px-6 py-6 lg:flex">
      <div className="mb-14 px-1">
        <Logo />
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {NAV.map(({ label, icon: Icon, href }) => {
          const active = href && pathname.startsWith(href);
          const cls = `${itemClass} ${active ? "text-[#1366D9]" : "text-[#5D6679] hover:bg-[#F0F1F3]"}`;
          return href ? (
            <Link key={label} href={href} className={cls}>
              <Icon className="h-6 w-6" />
              {label}
            </Link>
          ) : (
            <span key={label} className={`${cls} cursor-default`} title="Not part of the Inventory module">
              <Icon className="h-6 w-6" />
              {label}
            </span>
          );
        })}
      </nav>

      <div className="flex flex-col gap-2">
        <span className={`${itemClass} cursor-default text-[#5D6679]`}>
          <SettingsIcon className="h-6 w-6" />
          Settings
        </span>
        <button onClick={logout} className={`${itemClass} text-[#5D6679] hover:bg-[#F0F1F3]`}>
          <LogoutIcon className="h-6 w-6" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
