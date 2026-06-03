"use client";

import Link from "next/link";
import { Car, ShareNetwork, ChatCircle, InstagramLogo, Envelope, Phone, MapPin } from "@phosphor-icons/react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-primary rounded-sm flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">
                Drive<span className="text-primary">Go</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Premium car rental service with a fleet of modern vehicles. Drive your way, on your terms.
            </p>
            <div className="flex items-center gap-3">
              {[ShareNetwork, ChatCircle, InstagramLogo].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-gray-800 rounded-sm flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/cars", label: "Browse Cars" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
                { href: "/login", label: "Sign In" },
                { href: "/register", label: "Register" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Vehicle Types */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Vehicle Types</h4>
            <ul className="space-y-2.5">
              {["Economy", "SUV", "Luxury", "Sports", "Van"].map((type) => (
                <li key={type}>
                  <Link href={`/cars?category=${type}`} className="text-sm text-gray-400 hover:text-primary transition-colors">
                    {type}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">Avenue de la Réunification, Douala, Cameroon</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-gray-400">+237 233 45 67 89</span>
              </li>
              <li className="flex items-center gap-3">
                <Envelope className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-gray-400">hello@drivego.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2026 DriveGo. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/about" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
