"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car,
  SquaresFour,
  CalendarBlank,
  Users,
  ChartBar,
  Gear,
  SignOut,
  List,
  X,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", icon: SquaresFour, label: "Dashboard" },
  { href: "/admin/fleet", icon: Car, label: "Fleet" },
  { href: "/admin/bookings", icon: CalendarBlank, label: "Bookings" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/reports", icon: ChartBar, label: "Reports" },
  { href: "/admin/settings", icon: Gear, label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 bg-gray-900 flex flex-col transition-transform duration-200",
          "lg:translate-x-0 lg:static lg:flex",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-800">
          <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
            <Car className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">
              Drive<span className="text-primary">Go</span>
            </p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors",
                pathname === href || pathname.startsWith(href + "/")
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-primary text-sm font-bold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-gray-400 truncate">admin@drivego.com</p>
            </div>
          </div>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-gray-400 hover:text-white hover:bg-gray-800 w-full transition-colors">
            <SignOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button
            className="lg:hidden p-2 rounded-sm text-gray-500 hover:bg-gray-50"
            onClick={() => setSidebarOpen(true)}
          >
            <List className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-gray-900 capitalize">
              {NAV_ITEMS.find((n) => pathname.startsWith(n.href))?.label ?? "Admin"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-primary transition-colors"
            >
              View Site
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
