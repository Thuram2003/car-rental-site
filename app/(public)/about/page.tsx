"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Car,
  Clock,
  MapPin,
  Star,
  CheckCircle,
  Target,
  Heart,
  ArrowRight,
  Sparkle,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Trust & Safety",
    description: "All our vehicles are regularly maintained and fully insured for your peace of mind.",
    color: "text-emerald-500",
    bg: "bg-emerald-50 border-emerald-100",
  },
  {
    icon: Users,
    title: "Customer First",
    description: "Your satisfaction is our priority. We're here to make your journey smooth and enjoyable.",
    color: "text-blue-500",
    bg: "bg-blue-50 border-blue-100",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Round-the-clock assistance whenever you need us, wherever you are in Cameroon.",
    color: "text-indigo-500",
    bg: "bg-indigo-50 border-indigo-100",
  },
  {
    icon: Star,
    title: "Quality Service",
    description: "Premium vehicles and exceptional service at competitive prices.",
    color: "text-amber-500",
    bg: "bg-amber-50 border-amber-100",
  },
];

const STATS = [
  { value: "1,200+", label: "Happy Customers" },
  { value: "80+", label: "Premium Vehicles" },
  { value: "3", label: "Active Locations" },
  { value: "99.8%", label: "Satisfaction Rate" },
];

const TEAM = [
  {
    name: "Jean-Paul Mbarga",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
  {
    name: "Marie Nkomo",
    role: "Operations Manager",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  },
  {
    name: "Samuel Fotso",
    role: "Fleet Manager",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden bg-gray-900 text-white py-24 sm:py-32">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_45%)]" />
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_45%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold tracking-wide uppercase">
              <Sparkle className="w-3.5 h-3.5" />
              Discover DriveGo
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-orange-200 bg-clip-text text-transparent">
              Redefining Mobility <br />
              <span className="text-orange-500">Across Cameroon</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl font-light">
              DriveGo is Cameroon's premier car rental service, offering a modern, meticulously maintained fleet of vehicles and customer-centric service across Douala, Yaoundé, and Limbe.
            </p>
          </div>
        </div>
      </div>

      {/* Modern Stats Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <Card className="border-gray-100 shadow-xl bg-white/80 backdrop-blur-md">
          <CardContent className="p-8 sm:p-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y-2 sm:divide-y-0 sm:gap-6 divide-gray-100 lg:divide-x-2 lg:divide-gray-100">
              {STATS.map((stat, i) => (
                <div key={stat.label} className={`text-center pt-6 sm:pt-0 ${i > 0 ? 'lg:pl-6' : ''}`}>
                  <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid lg:grid-cols-12 gap-12 sm:gap-16 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold uppercase tracking-wider">
              Our Journey
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Driven by Quality, Guided by Integrity
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed font-light text-base sm:text-lg">
              <p>
                Founded in 2020, DriveGo was born from a simple vision: to make car rental in Cameroon easy, transparent, and completely reliable. We recognized the challenges people faced when trying to rent vehicles—hidden fees, poor vehicle conditions, and unpredictable customer support.
              </p>
              <p>
                We set out to change that standard. Today, DriveGo is proud to serve hundreds of satisfied customers across Cameroon, from business executives to families on vacation, with a fleet of well-maintained vehicles and a commitment to hospitality.
              </p>
              <p>
                Our professional team is passionate about making your journey smooth, safe, and memorable. Whether you need a car for a day, a week, or a multi-month project, we're here to help you drive your way, on your terms.
              </p>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link href="/cars">
                <Button size="lg" className="w-full sm:w-auto gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                  Browse Our Fleet
                  <Car className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-orange-500 to-blue-500 rounded-3xl opacity-10 blur-xl" />
            <div className="relative h-96 sm:h-[480px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=1000&fit=crop"
                alt="DriveGo Fleet"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white py-20 sm:py-28 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold uppercase tracking-wider">
              Core Principles
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Values That Define Us
            </h2>
            <p className="text-gray-500 text-base sm:text-lg font-light">
              These pillars shape our interactions, maintain our standards, and guarantee your satisfaction.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value) => (
              <Card key={value.title} className="border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-6 text-center space-y-4">
                  <div className={`w-14 h-14 ${value.bg} border rounded-2xl flex items-center justify-center mx-auto transition-transform duration-300 group-hover:scale-110`}>
                    <value.icon className={`w-7 h-7 ${value.color}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{value.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed font-light">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <Card className="border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-8 sm:p-10 space-y-5">
              <div className="w-12 h-12 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed font-light">
                To provide reliable, high-quality, and affordable mobility solutions that empower our customers to explore Cameroon and conduct business with absolute confidence and freedom. We strive to set new service benchmarks through transparency and care.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-8 sm:p-10 space-y-5">
              <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed font-light">
                To be Cameroon's most trusted, digital-first car rental platform. We envision a future where renting a premium vehicle is entirely hassle-free, secure, and completed seamlessly in just a few taps from anywhere.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white py-20 sm:py-28 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold uppercase tracking-wider">
              Leadership
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Meet Our Leadership Team
            </h2>
            <p className="text-gray-500 text-base sm:text-lg font-light">
              The specialists behind DriveGo, dedicated to providing a premium rental experience.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {TEAM.map((member) => (
              <Card key={member.name} className="border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="relative h-72 w-full overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{member.name}</h3>
                  <p className="text-sm text-orange-500 font-medium">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="relative bg-gray-950 rounded-3xl overflow-hidden shadow-2xl p-8 sm:p-12 lg:p-16 text-white border border-gray-800">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.1),transparent_40%)]" />
          <div className="relative z-10 grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Why Choose DriveGo?</h2>
              <p className="text-gray-300 font-light leading-relaxed">
                We combine convenience with state-of-the-art vehicles to provide the most transparent and premium car rental service in Cameroon.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "Transparent pricing (no hidden fees)",
                  "Well-maintained modern vehicles",
                  "Flexible rental terms (daily/weekly/monthly)",
                  "Multiple pickup spots in Cameroon",
                  "24/7 emergency roadside support",
                  "Secure & fast digital booking system",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5.5 h-5.5 text-orange-500 shrink-0" weight="fill" />
                    <span className="text-sm sm:text-base text-gray-200 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-5 flex justify-center lg:justify-end pt-6 lg:pt-0">
              <Card className="bg-white/5 border-white/10 text-white backdrop-blur-md max-w-sm w-full">
                <CardContent className="p-8 text-center space-y-6">
                  <h3 className="text-xl font-bold">Ready to Start Your Journey?</h3>
                  <p className="text-sm text-gray-400 font-light leading-relaxed">
                    Set up your account in minutes, explore our cars, and book your ride.
                  </p>
                  <div className="space-y-3">
                    <Link href="/register" className="block">
                      <Button size="lg" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                    <Link href="/cars" className="block">
                      <Button variant="outline" size="lg" className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent font-semibold">
                        Browse Cars
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
