-- ============================================
-- CAR RENTAL SYSTEM - PRODUCTION SCHEMA
-- Version: 1.0
-- Database: Supabase (PostgreSQL)
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (extends Supabase Auth)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
  license_number TEXT UNIQUE,
  license_expiry_date DATE,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Cameroon',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. BRANCHES TABLE (locations)
-- ============================================
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  opening_hours JSONB, -- {"monday": "08:00-18:00", ...}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. VEHICLES TABLE (main fleet)
-- ============================================
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1990 AND year <= EXTRACT(YEAR FROM NOW()) + 2),
  category TEXT NOT NULL CHECK (category IN ('Economy', 'SUV', 'Luxury', 'Sports', 'Van')),
  color TEXT NOT NULL,
  license_plate TEXT NOT NULL UNIQUE,
  vin TEXT UNIQUE, -- Vehicle Identification Number
  
  -- Specifications
  seats INTEGER NOT NULL CHECK (seats >= 2 AND seats <= 15),
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('Petrol', 'Diesel', 'Electric', 'Hybrid')),
  transmission TEXT NOT NULL CHECK (transmission IN ('Automatic', 'Manual')),
  mileage INTEGER DEFAULT 0 CHECK (mileage >= 0),
  
  -- Pricing & Availability
  daily_rate NUMERIC(10, 2) NOT NULL CHECK (daily_rate > 0),
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Rented', 'Maintenance', 'Reserved')),
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  
  -- Media
  image_url TEXT,
  cloudinary_public_id TEXT,
  
  -- Features (stored as JSON array)
  features JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  description TEXT,
  insurance_policy_number TEXT,
  last_service_date DATE,
  next_service_due DATE,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. VEHICLE_IMAGES TABLE (multiple images)
-- ============================================
CREATE TABLE vehicle_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  cloudinary_public_id TEXT,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. BOOKINGS TABLE (reservations & rentals)
-- ============================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  
  -- Dates & Locations
  start_date DATE NOT NULL,
  end_date DATE NOT NULL CHECK (end_date >= start_date),
  pickup_branch_id UUID REFERENCES branches(id),
  dropoff_branch_id UUID REFERENCES branches(id),
  
  -- Pricing (snapshot at booking time)
  daily_rate NUMERIC(10, 2) NOT NULL,
  number_of_days INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
  subtotal NUMERIC(10, 2) NOT NULL,
  tax_amount NUMERIC(10, 2) DEFAULT 0,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL,
  
  -- Status
  booking_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (booking_status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  
  -- Additional Info
  special_requests TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  
  -- Soft delete support
  is_deleted BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. PAYMENTS TABLE (transaction records)
-- ============================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'mobile_money', 'bank_transfer')),
  payment_provider TEXT, -- 'MTN Mobile Money', 'Orange Money', etc.
  
  transaction_reference TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  
  notes TEXT,
  processed_by UUID REFERENCES profiles(id),
  processed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. REVIEWS TABLE (customer feedback)
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  
  is_verified BOOLEAN DEFAULT false, -- Only customers who completed booking
  is_published BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One review per booking
  UNIQUE(booking_id)
);

-- ============================================
-- 8. MAINTENANCE_LOGS TABLE (service history)
-- ============================================
CREATE TABLE maintenance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN 
    ('oil_change', 'tire_rotation', 'brake_service', 'inspection', 'repair', 'cleaning', 'other')),
  
  description TEXT NOT NULL,
  cost NUMERIC(10, 2) CHECK (cost >= 0),
  mileage_at_service INTEGER,
  
  performed_by TEXT, -- Mechanic/service center name
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_service_due DATE,
  
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. DAMAGE_REPORTS TABLE (incident tracking)
-- ============================================
CREATE TABLE damage_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  
  reported_by UUID NOT NULL REFERENCES profiles(id),
  damage_type TEXT NOT NULL CHECK (damage_type IN ('minor', 'moderate', 'major')),
  description TEXT NOT NULL,
  
  repair_cost NUMERIC(10, 2),
  insurance_claim_number TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  
  images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================

-- Profiles
CREATE INDEX idx_profiles_role ON profiles(role);

-- Vehicles
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_category ON vehicles(category);
CREATE INDEX idx_vehicles_branch ON vehicles(branch_id);
CREATE INDEX idx_vehicles_active ON vehicles(is_active);

-- Vehicle Images
CREATE INDEX idx_vehicle_images_vehicle ON vehicle_images(vehicle_id);
CREATE INDEX idx_vehicle_images_primary ON vehicle_images(is_primary);

-- Bookings (CRITICAL for availability checks)
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_vehicle ON bookings(vehicle_id);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_created ON bookings(created_at DESC);
CREATE INDEX idx_bookings_vehicle_dates_status ON bookings(vehicle_id, start_date, end_date, booking_status);
CREATE INDEX idx_bookings_created_status ON bookings(created_at DESC, booking_status);

-- Reviews
CREATE INDEX idx_reviews_vehicle ON reviews(vehicle_id);
CREATE INDEX idx_reviews_published ON reviews(is_published);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- Payments
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_processed_at ON payments(processed_at DESC);

-- Maintenance
CREATE INDEX idx_maintenance_vehicle ON maintenance_logs(vehicle_id);
CREATE INDEX idx_maintenance_date ON maintenance_logs(performed_at DESC);

-- Damage Reports
CREATE INDEX idx_damage_vehicle ON damage_reports(vehicle_id);
CREATE INDEX idx_damage_booking ON damage_reports(booking_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- 1. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_images_updated_at BEFORE UPDATE ON vehicle_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_logs_updated_at BEFORE UPDATE ON maintenance_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_damage_reports_updated_at BEFORE UPDATE ON damage_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. CRITICAL: Prevent overlapping bookings
CREATE OR REPLACE FUNCTION check_booking_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check for non-cancelled, non-deleted bookings
  IF NEW.booking_status NOT IN ('cancelled') AND NEW.is_deleted = false THEN
    IF EXISTS (
      SELECT 1 FROM bookings
      WHERE vehicle_id = NEW.vehicle_id
        AND booking_status IN ('confirmed', 'active')
        AND is_deleted = false
        AND id IS DISTINCT FROM NEW.id
        AND NOT (end_date < NEW.start_date OR start_date > NEW.end_date)
    ) THEN
      RAISE EXCEPTION 'Vehicle is not available for the selected dates';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_booking_overlap
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION check_booking_overlap();

-- 3. Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Calculate vehicle rating (helper function)
CREATE OR REPLACE FUNCTION get_vehicle_rating(vehicle_uuid UUID)
RETURNS TABLE(average_rating NUMERIC, review_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ROUND(AVG(rating)::numeric, 1), 0) as average_rating,
    COUNT(*)::bigint as review_count
  FROM reviews
  WHERE vehicle_id = vehicle_uuid AND is_published = true;
END;
$$ LANGUAGE plpgsql;

-- 5. Check vehicle availability (helper function)
CREATE OR REPLACE FUNCTION is_vehicle_available(
  vehicle_uuid UUID,
  check_start_date DATE,
  check_end_date DATE
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE vehicle_id = vehicle_uuid
      AND booking_status IN ('confirmed', 'active')
      AND is_deleted = false
      AND NOT (end_date < check_start_date OR start_date > check_end_date)
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE damage_reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- ============================================
-- BRANCHES POLICIES
-- ============================================

CREATE POLICY "Public can view active branches" ON branches
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage branches" ON branches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- ============================================
-- VEHICLES POLICIES
-- ============================================

CREATE POLICY "Anyone can view active vehicles" ON vehicles
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage vehicles" ON vehicles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- ============================================
-- VEHICLE_IMAGES POLICIES
-- ============================================

CREATE POLICY "Public can view vehicle images" ON vehicle_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM vehicles
      WHERE id = vehicle_id AND is_active = true
    )
  );

CREATE POLICY "Admins can manage vehicle images" ON vehicle_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- ============================================
-- BOOKINGS POLICIES
-- ============================================

CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pending bookings" ON bookings
  FOR UPDATE USING (
    user_id = auth.uid() AND booking_status = 'pending'
  );

CREATE POLICY "Admins can view all bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admins can manage all bookings" ON bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- ============================================
-- PAYMENTS POLICIES
-- ============================================

CREATE POLICY "Users can view own booking payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = booking_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admins can manage payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- ============================================
-- REVIEWS POLICIES
-- ============================================

CREATE POLICY "Anyone can view published reviews" ON reviews
  FOR SELECT USING (is_published = true);

CREATE POLICY "Users can view own reviews" ON reviews
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create reviews for completed bookings" ON reviews
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = booking_id 
        AND user_id = auth.uid() 
        AND booking_status = 'completed'
    )
  );

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all reviews" ON reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- ============================================
-- MAINTENANCE_LOGS POLICIES
-- ============================================

CREATE POLICY "Admins can view maintenance logs" ON maintenance_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admins can manage maintenance logs" ON maintenance_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- ============================================
-- DAMAGE_REPORTS POLICIES
-- ============================================

CREATE POLICY "Admins can view damage reports" ON damage_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admins can manage damage reports" ON damage_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- ============================================
-- SEED DATA (Initial branches)
-- ============================================

INSERT INTO branches (name, address, city, phone, email, opening_hours) VALUES
  (
    'Douala Branch',
    'Akwa, Rue Joffre',
    'Douala',
    '+237 233 42 56 78',
    'douala@carrental.cm',
    '{"monday": "08:00-18:00", "tuesday": "08:00-18:00", "wednesday": "08:00-18:00", "thursday": "08:00-18:00", "friday": "08:00-18:00", "saturday": "09:00-17:00", "sunday": "closed"}'::jsonb
  ),
  (
    'Airport Branch',
    'Douala International Airport',
    'Douala',
    '+237 233 40 12 34',
    'airport@carrental.cm',
    '{"monday": "06:00-22:00", "tuesday": "06:00-22:00", "wednesday": "06:00-22:00", "thursday": "06:00-22:00", "friday": "06:00-22:00", "saturday": "06:00-22:00", "sunday": "06:00-22:00"}'::jsonb
  ),
  (
    'Yaoundé Branch',
    'Bastos, Avenue Kennedy',
    'Yaoundé',
    '+237 222 21 45 67',
    'yaounde@carrental.cm',
    '{"monday": "08:00-18:00", "tuesday": "08:00-18:00", "wednesday": "08:00-18:00", "thursday": "08:00-18:00", "friday": "08:00-18:00", "saturday": "09:00-17:00", "sunday": "closed"}'::jsonb
  );

-- ============================================
-- VIEWS (Optional - for reporting)
-- ============================================

-- View: Vehicles with ratings
CREATE OR REPLACE VIEW vehicles_with_ratings AS
SELECT 
  v.*,
  COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) as average_rating,
  COUNT(r.id)::bigint as review_count
FROM vehicles v
LEFT JOIN reviews r ON r.vehicle_id = v.id AND r.is_published = true
GROUP BY v.id;

-- View: Booking summary for admin dashboard
CREATE OR REPLACE VIEW booking_summary AS
SELECT
  b.id,
  b.start_date,
  b.end_date,
  b.booking_status,
  b.payment_status,
  b.total_amount,
  b.created_at,
  p.full_name as customer_name,
  p.phone as customer_phone,
  v.make || ' ' || v.model as vehicle_name,
  v.license_plate,
  pb.name as pickup_branch,
  db.name as dropoff_branch
FROM bookings b
JOIN profiles p ON p.id = b.user_id
JOIN vehicles v ON v.id = b.vehicle_id
LEFT JOIN branches pb ON pb.id = b.pickup_branch_id
LEFT JOIN branches db ON db.id = b.dropoff_branch_id
WHERE b.is_deleted = false;

-- ============================================
-- COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE branches IS 'Physical branch locations for vehicle pickup/dropoff';
COMMENT ON TABLE vehicles IS 'Fleet inventory with specifications and pricing';
COMMENT ON TABLE vehicle_images IS 'Multiple images per vehicle for gallery display';
COMMENT ON TABLE bookings IS 'Customer reservations and active rentals';
COMMENT ON TABLE payments IS 'Payment transactions linked to bookings';
COMMENT ON TABLE reviews IS 'Customer reviews and ratings for vehicles';
COMMENT ON TABLE maintenance_logs IS 'Service and maintenance history for vehicles';
COMMENT ON TABLE damage_reports IS 'Incident and damage tracking';

COMMENT ON FUNCTION check_booking_overlap() IS 'Prevents double-booking of vehicles';
COMMENT ON FUNCTION handle_new_user() IS 'Auto-creates profile when user signs up';
COMMENT ON FUNCTION get_vehicle_rating(UUID) IS 'Calculates average rating and review count';
COMMENT ON FUNCTION is_vehicle_available(UUID, DATE, DATE) IS 'Checks if vehicle is available for date range';
