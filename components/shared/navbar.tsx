"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Car, List, X, User, SignOut, Gauge, CaretDown,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";
import { toast } from "sonner";
import { signOutAction } from "@/lib/actions/auth";

const navLinks = [
  { href: "/cars", label: "Browse Cars" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

interface NavbarProps {
  initialProfile?: Profile | null;
}

export function Navbar({ initialProfile = null }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);

  useEffect(() => {
    const supabase = createClient();

    // Listen for auth changes only (no initial fetch since we have server data)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        console.log("Auth state changed:", event);
        
        // On sign out, clear profile
        if (event === "SIGNED_OUT") {
          setProfile(null);
        } 
        // On sign in or token refresh, refresh the page to get new server data
        else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          router.refresh();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    try {
      const res = await signOutAction();
      if (res?.error) {
        toast.error("Failed to sign out", { description: res.error.message });
        return;
      }
      setProfile(null);
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  const user = profile;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-primary rounded-sm flex items-center justify-center shadow-sm group-hover:bg-primary-dark transition-colors">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">
              Drive<span className="text-primary">Go</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-sm text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-primary bg-primary-lighter"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-sm hover:bg-gray-50 transition-colors">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar_url || undefined} alt={user.full_name} className="object-cover" />
                      <AvatarFallback className="bg-primary-light text-primary text-sm font-bold">
                        {user.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700">{user.full_name}</span>
                    <CaretDown className="w-4 h-4 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/bookings" className="flex items-center gap-2 cursor-pointer">
                      <Car className="w-4 h-4" />
                      My Bookings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard" className="flex items-center gap-2 cursor-pointer">
                        <Gauge className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                    onClick={handleSignOut}
                  >
                    <SignOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button variant="default" size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-sm text-gray-600 hover:bg-gray-50"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <List className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block px-4 py-2.5 rounded-sm text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-primary bg-primary-lighter"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100 mb-2">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar_url || undefined} alt={user.full_name} className="object-cover" />
                    <AvatarFallback className="bg-primary-light text-primary text-sm font-bold">
                      {user.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900 leading-none">{user.full_name}</p>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">{user.role}</p>
                  </div>
                </div>
                <Link href="/profile" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="default" className="w-full justify-start gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </Button>
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="default" className="w-full justify-start gap-2">
                      <Gauge className="w-4 h-4" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
                <Link href="/bookings" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="default" className="w-full justify-start gap-2">
                    <Car className="w-4 h-4" />
                    My Bookings
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="default"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="default" className="w-full">Sign In</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button variant="default" size="default" className="w-full">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
