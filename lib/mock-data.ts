export type VehicleStatus = "Available" | "Rented" | "Maintenance";
export type BookingStatus = "Reserved" | "Confirmed" | "Completed" | "Cancelled";
export type FuelType = "Petrol" | "Diesel" | "Electric" | "Hybrid";
export type TransmissionType = "Automatic" | "Manual";
export type VehicleCategory = "Economy" | "SUV" | "Luxury" | "Sports" | "Van";

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  category: VehicleCategory;
  color: string;
  dailyRate: number;
  status: VehicleStatus;
  location: string;
  seats: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  mileage: number;
  imageUrl: string;
  features: string[];
  rating: number;
  reviewCount: number;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  vehicle: Vehicle;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: BookingStatus;
  pickupLocation: string;
  dropoffLocation: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  totalBookings: number;
  totalSpent: number;
  joinedAt: string;
  status: "Active" | "Inactive";
}

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: "v1",
    make: "Toyota",
    model: "Camry",
    year: 2024,
    category: "Economy",
    color: "Pearl White",
    dailyRate: 35000,
    status: "Available",
    location: "Douala Branch",
    seats: 5,
    fuelType: "Hybrid",
    transmission: "Automatic",
    mileage: 12000,
    imageUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80",
    features: ["Bluetooth", "Backup Camera", "Lane Assist", "Apple CarPlay"],
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: "v2",
    make: "BMW",
    model: "X5",
    year: 2024,
    category: "SUV",
    color: "Midnight Black",
    dailyRate: 85000,
    status: "Available",
    location: "Airport Branch",
    seats: 7,
    fuelType: "Petrol",
    transmission: "Automatic",
    mileage: 8500,
    imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
    features: ["Panoramic Roof", "Heated Seats", "360 Camera", "Harman Kardon"],
    rating: 4.9,
    reviewCount: 89,
  },
  {
    id: "v3",
    make: "Mercedes",
    model: "C-Class",
    year: 2023,
    category: "Luxury",
    color: "Silver",
    dailyRate: 105000,
    status: "Rented",
    location: "Douala Branch",
    seats: 5,
    fuelType: "Petrol",
    transmission: "Automatic",
    mileage: 15000,
    imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    features: ["Burmester Sound", "Ambient Lighting", "Massage Seats", "Night Vision"],
    rating: 4.7,
    reviewCount: 67,
  },
  {
    id: "v4",
    make: "Tesla",
    model: "Model 3",
    year: 2024,
    category: "Economy",
    color: "Deep Blue",
    dailyRate: 55000,
    status: "Available",
    location: "Yaoundé Branch",
    seats: 5,
    fuelType: "Electric",
    transmission: "Automatic",
    mileage: 5000,
    imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80",
    features: ["Autopilot", "15\" Touchscreen", "Over-the-Air Updates", "Supercharging"],
    rating: 4.9,
    reviewCount: 203,
  },
  {
    id: "v5",
    make: "Ford",
    model: "Explorer",
    year: 2023,
    category: "SUV",
    color: "Rapid Red",
    dailyRate: 65000,
    status: "Available",
    location: "Airport Branch",
    seats: 7,
    fuelType: "Petrol",
    transmission: "Automatic",
    mileage: 22000,
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    features: ["Third Row Seating", "Tow Package", "Ford Co-Pilot360", "Wireless Charging"],
    rating: 4.5,
    reviewCount: 156,
  },
  {
    id: "v6",
    make: "Porsche",
    model: "911",
    year: 2024,
    category: "Sports",
    color: "Guards Red",
    dailyRate: 210000,
    status: "Available",
    location: "Douala Branch",
    seats: 2,
    fuelType: "Petrol",
    transmission: "Automatic",
    mileage: 3000,
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
    features: ["Sport Chrono", "PASM", "Bose Sound", "Sport Exhaust"],
    rating: 5.0,
    reviewCount: 42,
  },
  {
    id: "v7",
    make: "Honda",
    model: "CR-V",
    year: 2023,
    category: "SUV",
    color: "Sonic Gray",
    dailyRate: 50000,
    status: "Maintenance",
    location: "Yaoundé Branch",
    seats: 5,
    fuelType: "Hybrid",
    transmission: "Automatic",
    mileage: 18000,
    imageUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
    features: ["Honda Sensing", "Wireless CarPlay", "Heated Seats", "Power Tailgate"],
    rating: 4.6,
    reviewCount: 98,
  },
  {
    id: "v8",
    make: "Audi",
    model: "A4",
    year: 2024,
    category: "Luxury",
    color: "Glacier White",
    dailyRate: 92000,
    status: "Available",
    location: "Airport Branch",
    seats: 5,
    fuelType: "Petrol",
    transmission: "Automatic",
    mileage: 7200,
    imageUrl: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80",
    features: ["Virtual Cockpit", "Bang & Olufsen", "Matrix LED", "Quattro AWD"],
    rating: 4.8,
    reviewCount: 73,
  },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "b1",
    customerId: "c1",
    customerName: "Jean-Paul Mbarga",
    vehicle: MOCK_VEHICLES[0],
    startDate: "2026-04-28",
    endDate: "2026-05-02",
    totalCost: 140000,
    status: "Confirmed",
    pickupLocation: "Douala Branch",
    dropoffLocation: "Douala Branch",
    createdAt: "2026-04-20",
  },
  {
    id: "b2",
    customerId: "c2",
    customerName: "Marie Nkomo",
    vehicle: MOCK_VEHICLES[1],
    startDate: "2026-04-25",
    endDate: "2026-04-30",
    totalCost: 425000,
    status: "Reserved",
    pickupLocation: "Airport Branch",
    dropoffLocation: "Airport Branch",
    createdAt: "2026-04-18",
  },
  {
    id: "b3",
    customerId: "c3",
    customerName: "Samuel Fotso",
    vehicle: MOCK_VEHICLES[3],
    startDate: "2026-04-10",
    endDate: "2026-04-15",
    totalCost: 275000,
    status: "Completed",
    pickupLocation: "Yaoundé Branch",
    dropoffLocation: "Yaoundé Branch",
    createdAt: "2026-04-05",
  },
  {
    id: "b4",
    customerId: "c4",
    customerName: "Carine Biya",
    vehicle: MOCK_VEHICLES[2],
    startDate: "2026-04-22",
    endDate: "2026-04-24",
    totalCost: 210000,
    status: "Cancelled",
    pickupLocation: "Douala Branch",
    dropoffLocation: "Airport Branch",
    createdAt: "2026-04-15",
  },
  {
    id: "b5",
    customerId: "c5",
    customerName: "Eric Tchamba",
    vehicle: MOCK_VEHICLES[5],
    startDate: "2026-05-01",
    endDate: "2026-05-03",
    totalCost: 420000,
    status: "Reserved",
    pickupLocation: "Douala Branch",
    dropoffLocation: "Douala Branch",
    createdAt: "2026-04-22",
  },
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Jean-Paul Mbarga",
    email: "jeanpaul.mbarga@email.com",
    phone: "+237 677 123 456",
    licenseNumber: "CM-DL-2019-001234",
    totalBookings: 8,
    totalSpent: 1400000,
    joinedAt: "2024-03-15",
    status: "Active",
  },
  {
    id: "c2",
    name: "Marie Nkomo",
    email: "marie.nkomo@email.com",
    phone: "+237 699 987 654",
    licenseNumber: "CM-DL-2020-005678",
    totalBookings: 3,
    totalSpent: 690000,
    joinedAt: "2025-01-08",
    status: "Active",
  },
  {
    id: "c3",
    name: "Samuel Fotso",
    email: "samuel.fotso@email.com",
    phone: "+237 655 456 789",
    licenseNumber: "CM-DL-2018-009012",
    totalBookings: 12,
    totalSpent: 2880000,
    joinedAt: "2023-11-20",
    status: "Active",
  },
  {
    id: "c4",
    name: "Carine Biya",
    email: "carine.biya@email.com",
    phone: "+237 670 321 098",
    licenseNumber: "CM-DL-2021-003456",
    totalBookings: 1,
    totalSpent: 0,
    joinedAt: "2026-02-14",
    status: "Inactive",
  },
  {
    id: "c5",
    name: "Eric Tchamba",
    email: "eric.tchamba@email.com",
    phone: "+237 650 654 321",
    licenseNumber: "CM-DL-2017-007890",
    totalBookings: 20,
    totalSpent: 5520000,
    joinedAt: "2023-06-01",
    status: "Active",
  },
];

export const ADMIN_STATS = {
  totalRevenue: 28950000,
  revenueGrowth: 12.5,
  totalBookings: 186,
  bookingsGrowth: 8.3,
  activeRentals: 14,
  fleetUtilization: 72,
  totalVehicles: 24,
  availableVehicles: 16,
};

export const REVENUE_DATA = [
  { month: "Nov", revenue: 19200000 },
  { month: "Dec", revenue: 24600000 },
  { month: "Jan", revenue: 16800000 },
  { month: "Feb", revenue: 21000000 },
  { month: "Mar", revenue: 26400000 },
  { month: "Apr", revenue: 28950000 },
];
