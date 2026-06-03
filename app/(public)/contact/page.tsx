"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  MapPin,
  Phone,
  Envelope,
  Clock,
  ChatCircle,
  PaperPlaneTilt,
  CircleNotch,
  Sparkle,
} from "@phosphor-icons/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PhoneInput } from "@/components/ui/phone-input";
import { toast } from "sonner";
import { submitContactMessage } from "@/lib/actions/contacts";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(7, "Please enter a valid phone number"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactValues = z.infer<typeof contactSchema>;

const CONTACT_INFO = [
  {
    icon: MapPin,
    title: "Main Office",
    details: ["Avenue de la Réunification", "Douala, Cameroon"],
    color: "text-orange-500",
    bg: "bg-orange-50/50 border-orange-100",
  },
  {
    icon: Phone,
    title: "Call Direct",
    details: ["+237 233 45 67 89", "+237 233 45 67 90"],
    color: "text-blue-500",
    bg: "bg-blue-50/50 border-blue-100",
  },
  {
    icon: Envelope,
    title: "Email Support",
    details: ["hello@drivego.com", "support@drivego.com"],
    color: "text-emerald-500",
    bg: "bg-emerald-50/50 border-emerald-100",
  },
  {
    icon: Clock,
    title: "Working Hours",
    details: ["Mon - Fri: 8:00 AM - 6:00 PM", "Sat - Sun: 9:00 AM - 5:00 PM"],
    color: "text-indigo-500",
    bg: "bg-indigo-50/50 border-indigo-100",
  },
];

const LOCATIONS = [
  {
    city: "Douala",
    address: "Avenue de la Réunification, Akwa",
    phone: "+237 233 45 67 89",
    hours: "Mon-Sun: 8:00 AM - 8:00 PM",
  },
  {
    city: "Yaoundé",
    address: "Avenue Kennedy, Centre Ville",
    phone: "+237 233 45 67 91",
    hours: "Mon-Sun: 8:00 AM - 8:00 PM",
  },
  {
    city: "Limbe",
    address: "Church Street, Down Beach",
    phone: "+237 233 45 67 92",
    hours: "Mon-Sun: 9:00 AM - 6:00 PM",
  },
];

export default function ContactPage() {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: ContactValues) => {
    setIsPending(true);
    try {
      const res = await submitContactMessage(values);
      if (res.success) {
        toast.success("Message sent successfully!", {
          description: "Thank you! We will get back to you within 24 hours.",
        });
        form.reset();
      } else {
        toast.error("Failed to send message", {
          description: res.error || "Please try again later.",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gray-900 text-white py-20 sm:py-24">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_40%)]" />
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold tracking-wide uppercase">
              <Sparkle className="w-3.5 h-3.5" />
              Contact Center
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Get in Touch with Us
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 font-light leading-relaxed max-w-2xl">
              Have questions, feedback, or need roadside assistance? Reach out to our dedicated support team and we will respond as soon as possible.
            </p>
          </div>
        </div>
      </div>

      {/* Info Cards Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CONTACT_INFO.map((info) => (
            <Card key={info.title} className="border-gray-100 shadow-lg bg-white/95 backdrop-blur-sm group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center space-y-4">
                <div className={`w-12 h-12 ${info.bg} border rounded-2xl flex items-center justify-center mx-auto transition-transform duration-300 group-hover:scale-110`}>
                  <info.icon className={`w-6 h-6 ${info.color}`} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-gray-900 text-base">{info.title}</h3>
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-sm text-gray-500 font-light">
                      {detail}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Form & Side Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="grid lg:grid-cols-12 gap-12 sm:gap-16 items-start">
          {/* Form */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Send Us a Message</h2>
              <p className="text-gray-500 font-light text-base sm:text-lg">
                Fill out the secure form below and our agents will log your request and respond within 24 hours.
              </p>
            </div>

            <Card className="border-gray-100 shadow-sm bg-white">
              <CardContent className="p-6 sm:p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-gray-700 text-sm font-semibold">Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Jean-Paul Dupont"
                              className="h-11 border-gray-200 focus:ring-primary/20 focus:border-primary placeholder:text-gray-300"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-danger" />
                        </FormItem>
                      )}
                    />

                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-gray-700 text-sm font-semibold">Email Address</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="jean@example.com"
                                className="h-11 border-gray-200 focus:ring-primary/20 focus:border-primary placeholder:text-gray-300"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs text-danger" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-gray-700 text-sm font-semibold">Phone Number</FormLabel>
                            <FormControl>
                              <PhoneInput
                                international
                                defaultCountry="CM"
                                placeholder="+237 6 XX XX XX XX"
                                className="h-11"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs text-danger" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-gray-700 text-sm font-semibold">Subject</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="How can we assist you today?"
                              className="h-11 border-gray-200 focus:ring-primary/20 focus:border-primary placeholder:text-gray-300"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-danger" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-gray-700 text-sm font-semibold">Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your request in detail..."
                              className="min-h-32 border-gray-200 focus:ring-primary/20 focus:border-primary placeholder:text-gray-300 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-danger" />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isPending}
                      className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-semibold flex items-center justify-center gap-2"
                    >
                      {isPending ? (
                        <>
                          <CircleNotch className="w-5 h-5 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          Send Message
                          <PaperPlaneTilt className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Right side bar */}
          <div className="lg:col-span-5 space-y-6">
            {/* Map Integration Frame */}
            <Card className="border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-64 bg-gray-950 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.1),transparent_80%)]" />
                <div className="text-center text-gray-400 space-y-2 z-10 px-6">
                  <MapPin className="w-12 h-12 mx-auto text-orange-500 animate-bounce" />
                  <h4 className="font-bold text-white text-base">Douala Operations Base</h4>
                  <p className="text-xs text-gray-400 max-w-xs font-light">
                    Avenue de la Réunification, Akwa. Drop off and pickup spaces available 24/7.
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Questions Card */}
            <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex gap-4">
                <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                  <ChatCircle className="w-6 h-6 text-blue-500" />
                </div>
                <div className="space-y-3 flex-1">
                  <h3 className="font-bold text-gray-900 text-base">Quick Questions?</h3>
                  <p className="text-sm text-gray-500 font-light leading-relaxed">
                    Check out our frequently asked questions about security, deposits, mileage limits, and insurance criteria.
                  </p>
                  <Link href="/about" className="inline-block">
                    <Button variant="outline" size="sm" className="font-semibold text-gray-700">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Support Line Card */}
            <Card className="border-orange-100 bg-orange-50/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-bold text-gray-900 text-base">24/7 Emergency Assistance</h3>
                <p className="text-sm text-gray-600 font-light leading-relaxed">
                  Need direct roadside assistance, vehicle replacements, or modifications on your active booking? Call our hotline immediately.
                </p>
                <div className="flex items-center gap-2.5 text-orange-600 font-bold text-lg">
                  <Phone className="w-5.5 h-5.5 text-orange-500 animate-pulse" />
                  <span>+237 233 45 67 99</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Locations Section */}
      <div className="bg-white py-20 sm:py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold uppercase tracking-wider">
              Branches
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Our Offices in Cameroon
            </h2>
            <p className="text-gray-500 text-base sm:text-lg font-light">
              Drop by any of our physical office locations to inspect vehicles or handle rentals in person.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {LOCATIONS.map((location) => (
              <Card key={location.city} className="border-gray-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">{location.city} Branch</h3>
                  <div className="space-y-3 text-sm text-gray-600 font-light">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                      <span>{location.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-orange-500 shrink-0" />
                      <span className="font-medium text-gray-900">{location.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-orange-500 shrink-0" />
                      <span>{location.hours}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
