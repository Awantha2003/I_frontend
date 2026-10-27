"use client";

import { BellIcon, SearchIcon } from "./icons";
import { getUser } from "@/lib/auth";

export default function Topbar({ search, onSearch }: { search: string; onSearch: (value: string) => void }) {
  // Only rendered after the auth guard has mounted on the client, so localStorage is available
  const user = getUser();
  const initials = (user?.name ?? "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="flex items-center justify-between gap-4 bg-white px-4 py-5 sm:px-8">
      <label className="flex w-full max-w-[444px] items-center gap-3 rounded border border-[#F0F1F3] px-4 py-3 text-[#858D9D]">
        <SearchIcon className="h-6 w-6 shrink-0" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search product, supplier, order"
          aria-label="Search products by name"
          className="w-full bg-transparent text-base text-[#383E49] outline-none placeholder:text-[#858D9D]"
        />
      </label>
      <div className="flex items-center gap-6">
        <BellIcon className="h-6 w-6 text-[#5D6679]" />
        <div title={user?.name} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1366D9] text-sm font-semibold text-white">
          {initials || "U"}
        </div>
      </div>
    </header>
  );
}
