"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  MapPin,
  Phone,
  Envelope,
  Clock,
  ChatCircle,
  PaperPlaneTilt,
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
    title: "Visit Us",
    details: [
      "Avenue de la Réunification",
      "Douala, Cameroon",
    ],
  },
  {
    icon: Phone,
    title: "Call Us",
    details: [
      "+237 233 45 67 89",
      "+237 233 45 67 90",
    ],
  },
  {
    icon: Envelope,
    title: "Email Us",
    details: [
      "hello@drivego.com",
      "support@drivego.com",
    ],
  },
  {
    icon: Clock,
    title: "Working Hours",
    details: [
      "Mon - Fri: 8:00 AM - 6:00 PM",
      "Sat - Sun: 9:00 AM - 5:00 PM",
    ],
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
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setIsPending(false);
    toast.success("Message sent!", {
      description: "We'll get back to you within 24 hours.",
    });
    form.reset();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-xl text-primary-lighter">
              Have questions? We're here to help. Reach out to us and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONTACT_INFO.map((info) => (
            <Card key={info.title} className="border-gray-100 shadow-md">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary-lighter border border-primary-light rounded-sm flex items-center justify-center mx-auto mb-4">
                  <info.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{info.title}</h3>
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-sm text-gray-500">
                    {detail}
                  </p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Form & Map */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Send Us a Message</h2>
              <p className="text-gray-500">
                Fill out the form below and our team will get back to you within 24 hours.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Jean Dupont"
                          className="h-11 border-gray-200 bg-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-danger" />
                    </FormItem>
                  )}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="jean@example.com"
                            className="h-11 border-gray-200 bg-white"
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
                      <FormItem>
                        <FormLabel className="text-gray-700">Phone Number</FormLabel>
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
                    <FormItem>
                      <FormLabel className="text-gray-700">Subject</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="How can we help you?"
                          className="h-11 border-gray-200 bg-white"
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
                    <FormItem>
                      <FormLabel className="text-gray-700">Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us more about your inquiry..."
                          className="min-h-32 border-gray-200 bg-white resize-none"
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
                  className="w-full h-11 gap-2"
                >
                  {isPending ? "Sending..." : "Send Message"}
                  {!isPending && <PaperPlaneTilt className="w-4 h-4" />}
                </Button>
              </form>
            </Form>
          </div>

          {/* Map & Additional Info */}
          <div className="space-y-6">
            {/* Map Placeholder */}
            <Card className="border-gray-100 overflow-hidden">
              <div className="h-64 bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <MapPin className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Map integration coming soon</p>
                </div>
              </div>
            </Card>

            {/* FAQ Card */}
            <Card className="border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-lighter border border-primary-light rounded-sm flex items-center justify-center shrink-0">
                    <ChatCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Quick Questions?</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Check out our FAQ section for instant answers to common questions about
                      rentals, pricing, and policies.
                    </p>
                    <Button variant="outline" size="sm">
                      View FAQ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="border-gray-100 bg-primary-lighter">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">24/7 Emergency Support</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Need immediate assistance while on the road? Our emergency hotline is available 24/7.
                </p>
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Phone className="w-5 h-5" />
                  <span>+237 233 45 67 99</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Locations Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Locations</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Visit us at any of our branches across Cameroon
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {LOCATIONS.map((location) => (
              <Card key={location.city} className="border-gray-100 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{location.city}</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{location.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-sm text-gray-600">{location.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-sm text-gray-600">{location.hours}</span>
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
