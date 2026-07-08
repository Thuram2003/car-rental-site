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
  ChatCircle,
  ShieldCheck,
  Globe,
  ClipboardText,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", icon: SquaresFour, label: "Dashboard" },
  { href: "/admin/fleet", icon: Car, label: "Fleet" },
  { href: "/admin/bookings", icon: CalendarBlank, label: "Bookings" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/staff", icon: ShieldCheck, label: "Staff Team" },
  { href: "/admin/questionnaires", icon: ClipboardText, label: "Surveys" },
  { href: "/admin/reports", icon: ChartBar, label: "Reports" },
  { href: "/admin/messages", icon: ChatCircle, label: "Messages" },
  { href: "/admin/settings", icon: Gear, label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50/50 flex overflow-hidden">
      
      {/* Sidebar - Desktop & Drawer Mobile */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-slate-800/60 flex flex-col transition-transform duration-300 ease-out shadow-2xl lg:shadow-none",
          "lg:translate-x-0 lg:static lg:flex",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/40">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-extrabold text-white text-base tracking-tight leading-none">
                Drive<span className="text-orange-500">Go</span>
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Management</p>
            </div>
          </Link>
          <button
            className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 group",
                  isActive
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/15"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                )}
              >
                <Icon className={cn("w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card at bottom */}
        <div className="p-4 border-t border-slate-800/40 space-y-3">
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-8.5 h-8.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full flex items-center justify-center shrink-0">
              <span className="text-xs font-black uppercase">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold text-white truncate">Administrator</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase truncate tracking-wider mt-0.5">Control Desk</p>
            </div>
          </div>
          <button className="flex items-center gap-3.5 w-full px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all">
            <SignOut className="w-4.5 h-4.5 shrink-0" />
            <span>Exit Dashboard</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Header bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 rounded-xl text-gray-550 hover:bg-gray-50 border border-gray-150 shadow-xs"
              onClick={() => setSidebarOpen(true)}
            >
              <List className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black text-gray-900 uppercase tracking-wider leading-none">
                {NAV_ITEMS.find((n) => pathname.startsWith(n.href))?.label ?? "Control Desk"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View main website */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-orange-500 hover:border-orange-200 bg-white rounded-xl shadow-xs transition-all"
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span>Public Site</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Main body */}
        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-69px)] bg-gray-55/30">
          {children}
        </main>
      </div>
    </div>
  );
}
