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
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Trust & Safety",
    description: "All our vehicles are regularly maintained and fully insured for your peace of mind.",
  },
  {
    icon: Users,
    title: "Customer First",
    description: "Your satisfaction is our priority. We're here to make your journey smooth and enjoyable.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Round-the-clock assistance whenever you need us, wherever you are in Cameroon.",
  },
  {
    icon: Star,
    title: "Quality Service",
    description: "Premium vehicles and exceptional service at competitive prices.",
  },
];

const STATS = [
  { value: "500+", label: "Happy Customers" },
  { value: "50+", label: "Premium Vehicles" },
  { value: "3", label: "Locations in Cameroon" },
  { value: "24/7", label: "Customer Support" },
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Your Trusted Car Rental Partner in Cameroon
            </h1>
            <p className="text-xl text-primary-lighter leading-relaxed">
              DriveGo is Cameroon's premier car rental service, offering a modern fleet of vehicles
              and exceptional customer service across Douala, Yaoundé, and beyond.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Founded in 2020, DriveGo was born from a simple vision: to make car rental in Cameroon
                easy, transparent, and reliable. We saw the challenges people faced when trying to rent
                vehicles — hidden fees, poor vehicle conditions, and unreliable service.
              </p>
              <p>
                We set out to change that. Today, DriveGo is proud to serve hundreds of satisfied customers
                across Cameroon, from business travelers to families on vacation, with a fleet of well-maintained
                vehicles and a commitment to exceptional service.
              </p>
              <p>
                Our team is passionate about making your journey smooth and memorable. Whether you need a car
                for a day, a week, or longer, we're here to help you drive your way, on your terms.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/cars">
                <Button size="lg" className="gap-2">
                  Browse Our Fleet
                  <Car className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative h-96 lg:h-full min-h-[400px] rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop"
              alt="DriveGo Fleet"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              These core principles guide everything we do at DriveGo
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value) => (
              <Card key={value.title} className="border-gray-100 hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-primary-lighter border border-primary-light rounded-sm flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-gray-100">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-primary-lighter border border-primary-light rounded-sm flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To provide reliable, affordable, and convenient car rental services that empower people
                to explore Cameroon with confidence and freedom. We strive to exceed expectations through
                quality vehicles, transparent pricing, and exceptional customer care.
              </p>
            </CardContent>
          </Card>
          <Card className="border-gray-100">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-primary-lighter border border-primary-light rounded-sm flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To become Cameroon's most trusted and preferred car rental service, known for innovation,
                reliability, and customer satisfaction. We envision a future where renting a car is as
                simple and seamless as booking a ride.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              The passionate people behind DriveGo, dedicated to making your journey exceptional
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TEAM.map((member) => (
              <Card key={member.name} className="border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-64">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{member.name}</h3>
                  <p className="text-sm text-primary">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 md:p-12 text-white">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-6">Why Choose DriveGo?</h2>
            <div className="space-y-4">
              {[
                "Transparent pricing with no hidden fees",
                "Well-maintained, modern vehicles",
                "Flexible rental periods from daily to monthly",
                "Multiple pickup locations across Cameroon",
                "24/7 roadside assistance",
                "Easy online booking and management",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-primary-lighter shrink-0" weight="fill" />
                  <span className="text-lg">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/register">
                <Button variant="outline" size="lg" className="bg-white text-primary hover:bg-gray-50">
                  Get Started Today
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Hit the Road?</h2>
          <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
            Browse our fleet of premium vehicles and book your next adventure in Cameroon
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cars">
              <Button size="lg" className="gap-2">
                <Car className="w-5 h-5" />
                Browse Cars
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
