"use client";

import Link from "next/link";
import { Car } from "@phosphor-icons/react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Minimal header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
            <Car className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">
            Drive<span className="text-orange-500">Go</span>
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      <footer className="text-center py-4 text-xs text-gray-400">
        © 2026 DriveGo. All rights reserved.
      </footer>
    </div>
  );
}
