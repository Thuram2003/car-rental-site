-- ============================================
-- QUESTIONNAIRES SYSTEM FOR CAR RENTAL APP
-- ============================================

-- ============================================
-- DROP EXISTING TABLES (Clean Installation)
-- ============================================
-- Run this section if you need to reinstall or reset the questionnaires system
-- WARNING: This will delete all questionnaire data and responses!

-- Drop views first (dependent objects) - ONLY questionnaire views
DROP VIEW IF EXISTS questionnaire_summary CASCADE;

-- Drop tables in reverse order of dependencies - ONLY questionnaire tables
DROP TABLE IF EXISTS questionnaire_analytics CASCADE;
DROP TABLE IF EXISTS questionnaire_responses CASCADE;
DROP TABLE IF EXISTS questionnaires CASCADE;

-- Drop functions - ONLY questionnaire functions
DROP FUNCTION IF EXISTS get_questionnaire_response_rate(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_average_question_rating(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS has_pending_questionnaires(UUID) CASCADE;
DROP FUNCTION IF EXISTS set_response_completed_at() CASCADE;

-- ============================================
-- 1. QUESTIONNAIRES TABLE (Admin creates)
-- ============================================
CREATE TABLE questionnaires (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  
  -- Questionnaire Type
  type TEXT NOT NULL CHECK (type IN (
    'pre_booking',      -- Before making a booking
    'post_booking',     -- After booking completion
    'vehicle_feedback', -- Vehicle-specific feedback
    'service_quality',  -- General service experience
    'satisfaction',     -- Overall satisfaction survey
    'damage_report',    -- Post-rental damage/condition
    'improvement'       -- Suggestions for improvement
  )),
  
  -- Target Audience
  target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN (
    'all',              -- All customers
    'new_customers',    -- First-time renters
    'returning_customers', -- Multiple bookings
    'completed_rentals' -- Only after rental completion
  )),
  
  -- Status & Visibility
  is_active BOOLEAN DEFAULT true,
  is_mandatory BOOLEAN DEFAULT false, -- Must be completed before certain actions
  
  -- Questions stored as JSON array
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Example structure:
  -- [
  --   {
  --     "id": "q1",
  --     "type": "text|multiple_choice|rating|yes_no|textarea",
  --     "question": "How satisfied were you with the vehicle condition?",
  --     "options": ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"],
  --     "required": true,
  --     "min_rating": 1,
  --     "max_rating": 5
  --   }
  -- ]
  
  -- Scheduling
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. QUESTIONNAIRE_RESPONSES TABLE (Customer responses)
-- ============================================
CREATE TABLE questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  questionnaire_id UUID NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL, -- Optional: link to specific booking
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL, -- Optional: link to specific vehicle
  
  -- Response Data (JSON array matching questions)
  responses JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Example structure:
  -- [
  --   {
  --     "question_id": "q1",
  --     "answer": "Very Satisfied"
  --   },
  --   {
  --     "question_id": "q2",
  --     "answer": 5
  --   }
  -- ]
  
  -- Completion Status
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  
  -- Response Time Tracking
  time_taken_seconds INTEGER, -- How long it took to complete
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate responses (one response per user per questionnaire)
  UNIQUE(questionnaire_id, user_id, booking_id)
);

-- ============================================
-- 3. QUESTIONNAIRE_ANALYTICS TABLE (Summary stats)
-- ============================================
CREATE TABLE questionnaire_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  questionnaire_id UUID NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  
  -- Statistics
  total_responses INTEGER DEFAULT 0,
  average_completion_time_seconds INTEGER,
  completion_rate NUMERIC(5,2), -- Percentage
  
  -- Question-level analytics (JSON)
  question_stats JSONB DEFAULT '{}'::jsonb,
  -- Example:
  -- {
  --   "q1": {
  --     "total_responses": 50,
  --     "average_rating": 4.2,
  --     "response_distribution": {
  --       "Very Satisfied": 20,
  --       "Satisfied": 25,
  --       "Neutral": 5
  --     }
  --   }
  -- }
  
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================

-- Questionnaires
CREATE INDEX idx_questionnaires_type ON questionnaires(type);
CREATE INDEX idx_questionnaires_active ON questionnaires(is_active);
CREATE INDEX idx_questionnaires_target ON questionnaires(target_audience);
CREATE INDEX idx_questionnaires_dates ON questionnaires(start_date, end_date);

-- Responses
CREATE INDEX idx_responses_questionnaire ON questionnaire_responses(questionnaire_id);
CREATE INDEX idx_responses_user ON questionnaire_responses(user_id);
CREATE INDEX idx_responses_booking ON questionnaire_responses(booking_id);
CREATE INDEX idx_responses_vehicle ON questionnaire_responses(vehicle_id);
CREATE INDEX idx_responses_completed ON questionnaire_responses(is_completed);
CREATE INDEX idx_responses_created ON questionnaire_responses(created_at DESC);

-- Analytics
CREATE INDEX idx_analytics_questionnaire ON questionnaire_analytics(questionnaire_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_questionnaires_updated_at BEFORE UPDATE ON questionnaires
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questionnaire_responses_updated_at BEFORE UPDATE ON questionnaire_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questionnaire_analytics_updated_at BEFORE UPDATE ON questionnaire_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-set completed_at when is_completed changes to true
CREATE OR REPLACE FUNCTION set_response_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = true AND OLD.is_completed = false THEN
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_completed_timestamp
  BEFORE UPDATE ON questionnaire_responses
  FOR EACH ROW EXECUTE FUNCTION set_response_completed_at();

-- ============================================
-- FUNCTIONS
-- ============================================

-- Get questionnaire response rate
CREATE OR REPLACE FUNCTION get_questionnaire_response_rate(questionnaire_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_sent INTEGER;
  total_completed INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_sent
  FROM questionnaire_responses
  WHERE questionnaire_id = questionnaire_uuid;
  
  SELECT COUNT(*) INTO total_completed
  FROM questionnaire_responses
  WHERE questionnaire_id = questionnaire_uuid AND is_completed = true;
  
  IF total_sent = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((total_completed::NUMERIC / total_sent::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Get average rating for a question
CREATE OR REPLACE FUNCTION get_average_question_rating(
  questionnaire_uuid UUID,
  question_id_param TEXT
)
RETURNS NUMERIC AS $$
DECLARE
  avg_rating NUMERIC;
BEGIN
  SELECT AVG((response->>'answer')::NUMERIC)
  INTO avg_rating
  FROM questionnaire_responses,
       jsonb_array_elements(responses) AS response
  WHERE questionnaire_id = questionnaire_uuid
    AND response->>'question_id' = question_id_param
    AND is_completed = true;
  
  RETURN COALESCE(ROUND(avg_rating, 2), 0);
END;
$$ LANGUAGE plpgsql;

-- Check if user has pending questionnaires
CREATE OR REPLACE FUNCTION has_pending_questionnaires(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM questionnaires q
    LEFT JOIN questionnaire_responses qr 
      ON q.id = qr.questionnaire_id 
      AND qr.user_id = user_uuid
    WHERE q.is_active = true
      AND q.is_mandatory = true
      AND (q.start_date IS NULL OR q.start_date <= NOW())
      AND (q.end_date IS NULL OR q.end_date >= NOW())
      AND qr.id IS NULL
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_analytics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- QUESTIONNAIRES POLICIES
-- ============================================

-- All authenticated users can view active questionnaires
CREATE POLICY "Users can view active questionnaires" ON questionnaires
  FOR SELECT USING (
    is_active = true 
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

-- Admins can view all questionnaires
CREATE POLICY "Admins can view all questionnaires" ON questionnaires
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Admins can manage questionnaires
CREATE POLICY "Admins can manage questionnaires" ON questionnaires
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- ============================================
-- RESPONSES POLICIES
-- ============================================

-- Users can view their own responses
CREATE POLICY "Users can view own responses" ON questionnaire_responses
  FOR SELECT USING (user_id = auth.uid());

-- Users can create their own responses
CREATE POLICY "Users can create responses" ON questionnaire_responses
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their incomplete responses
CREATE POLICY "Users can update incomplete responses" ON questionnaire_responses
  FOR UPDATE USING (
    user_id = auth.uid() AND is_completed = false
  );

-- Admins can view all responses
CREATE POLICY "Admins can view all responses" ON questionnaire_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- ============================================
-- ANALYTICS POLICIES
-- ============================================

-- Admins can view analytics
CREATE POLICY "Admins can view analytics" ON questionnaire_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Admins can manage analytics
CREATE POLICY "Admins can manage analytics" ON questionnaire_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- ============================================
-- SEED DATA (Sample Questionnaires)
-- ============================================

-- Sample 1: Booking Experience Survey
INSERT INTO questionnaires (title, description, type, target_audience, is_active, is_mandatory, questions) VALUES
(
  'Booking Experience Survey',
  'We value your opinion! Tell us about your booking experience.',
  'pre_booking',
  'all',
  true,
  false,
  '[
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "How easy was it to find the car you wanted on our website?",
      "options": ["Very Easy", "Easy", "Neutral", "Difficult", "Very Difficult"],
      "required": true
    },
    {
      "id": "q2",
      "type": "multiple_choice",
      "question": "What is the main purpose of your rental?",
      "options": ["Business Trip", "Family Vacation", "Weekend Trip", "Airport Transfer", "Moving/Relocation", "Car Replacement (Repair)", "Other"],
      "required": true
    },
    {
      "id": "q3",
      "type": "multiple_choice",
      "question": "How did you hear about us?",
      "options": ["Google Search", "Facebook/Instagram", "Friend or Family", "Hotel Recommendation", "Travel Agency", "Repeat Customer", "Other"],
      "required": false
    },
    {
      "id": "q4",
      "type": "multiple_choice",
      "question": "What factors were most important in choosing our rental service?",
      "options": ["Price", "Vehicle Selection", "Location Convenience", "Website Reviews", "Previous Experience", "Recommendations", "Other"],
      "required": false
    },
    {
      "id": "q5",
      "type": "textarea",
      "question": "Do you have any specific preferences or concerns we should know about?",
      "required": false
    }
  ]'::jsonb
);

-- Sample 2: Post-Rental Customer Satisfaction Survey
INSERT INTO questionnaires (title, description, type, target_audience, is_active, is_mandatory, questions) VALUES
(
  'Customer Satisfaction Survey',
  'Thank you for choosing us! Your feedback helps us serve you better.',
  'post_booking',
  'completed_rentals',
  true,
  false,
  '[
    {
      "id": "q1",
      "type": "rating",
      "question": "Overall, how satisfied were you with your rental experience?",
      "min_rating": 1,
      "max_rating": 5,
      "required": true
    },
    {
      "id": "q2",
      "type": "multiple_choice",
      "question": "How would you rate the condition of the vehicle when you picked it up?",
      "options": ["Excellent - Like New", "Very Good - Minor Wear", "Good - Some Signs of Use", "Fair - Noticeable Wear", "Poor - Needs Maintenance"],
      "required": true
    },
    {
      "id": "q3",
      "type": "multiple_choice",
      "question": "How clean was the vehicle interior when you received it?",
      "options": ["Spotless", "Very Clean", "Acceptably Clean", "Needed Cleaning", "Unacceptably Dirty"],
      "required": true
    },
    {
      "id": "q4",
      "type": "multiple_choice",
      "question": "How would you describe the pickup process?",
      "options": ["Quick and Easy (Under 10 mins)", "Smooth (10-20 mins)", "Acceptable (20-30 mins)", "Slow (30-45 mins)", "Frustratingly Long (Over 45 mins)"],
      "required": true
    },
    {
      "id": "q5",
      "type": "multiple_choice",
      "question": "How would you describe the return/drop-off process?",
      "options": ["Quick and Easy", "Smooth", "Acceptable", "Slow", "Frustratingly Long"],
      "required": true
    },
    {
      "id": "q6",
      "type": "multiple_choice",
      "question": "How helpful and professional was our staff?",
      "options": ["Extremely Helpful", "Very Helpful", "Somewhat Helpful", "Not Very Helpful", "Unhelpful"],
      "required": true
    },
    {
      "id": "q7",
      "type": "multiple_choice",
      "question": "Did the vehicle meet your expectations?",
      "options": ["Exceeded Expectations", "Met Expectations", "Mostly Met Expectations", "Below Expectations", "Well Below Expectations"],
      "required": true
    },
    {
      "id": "q8",
      "type": "multiple_choice",
      "question": "How likely are you to rent from us again?",
      "options": ["Definitely Will", "Probably Will", "Might or Might Not", "Probably Won''t", "Definitely Won''t"],
      "required": true
    },
    {
      "id": "q9",
      "type": "multiple_choice",
      "question": "Would you recommend our service to friends or colleagues?",
      "options": ["Yes, Absolutely", "Yes, Probably", "Maybe", "Probably Not", "Definitely Not"],
      "required": true
    },
    {
      "id": "q10",
      "type": "textarea",
      "question": "What did you like most about your experience with us?",
      "required": false
    },
    {
      "id": "q11",
      "type": "textarea",
      "question": "What could we have done better? Any suggestions for improvement?",
      "required": false
    }
  ]'::jsonb
);

-- Sample 3: Vehicle Quality Feedback
INSERT INTO questionnaires (title, description, type, target_audience, is_active, is_mandatory, questions) VALUES
(
  'Vehicle Quality Survey',
  'Tell us about your experience with the vehicle you rented.',
  'vehicle_feedback',
  'completed_rentals',
  true,
  false,
  '[
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "How would you rate the vehicle''s overall performance during your rental?",
      "options": ["Excellent", "Very Good", "Good", "Fair", "Poor"],
      "required": true
    },
    {
      "id": "q2",
      "type": "multiple_choice",
      "question": "How comfortable was the vehicle for your journey?",
      "options": ["Very Comfortable", "Comfortable", "Acceptable", "Uncomfortable", "Very Uncomfortable"],
      "required": true
    },
    {
      "id": "q3",
      "type": "multiple_choice",
      "question": "How was the fuel efficiency of the vehicle?",
      "options": ["Better Than Expected", "As Expected", "Acceptable", "Worse Than Expected", "Much Worse Than Expected"],
      "required": false
    },
    {
      "id": "q4",
      "type": "multiple_choice",
      "question": "Did all the vehicle features work properly? (AC, radio, GPS, etc.)",
      "options": ["Everything Worked Perfectly", "Most Things Worked", "Some Issues", "Several Issues", "Many Things Didn''t Work"],
      "required": true
    },
    {
      "id": "q5",
      "type": "multiple_choice",
      "question": "Was the vehicle size/type suitable for your needs?",
      "options": ["Perfect Choice", "Good Choice", "Adequate", "Should Have Been Bigger", "Should Have Been Smaller"],
      "required": false
    },
    {
      "id": "q6",
      "type": "multiple_choice",
      "question": "Did you experience any mechanical problems during the rental?",
      "options": ["No Problems at All", "Minor Issue (Didn''t Affect Trip)", "Moderate Issue (Some Inconvenience)", "Major Issue (Significant Problems)", "Breakdown/Had to Stop"],
      "required": true
    },
    {
      "id": "q7",
      "type": "textarea",
      "question": "If you experienced any issues, please describe them:",
      "required": false
    },
    {
      "id": "q8",
      "type": "multiple_choice",
      "question": "Would you rent this same vehicle model again?",
      "options": ["Yes, Definitely", "Yes, Probably", "Not Sure", "Probably Not", "Definitely Not"],
      "required": false
    }
  ]'::jsonb
);

-- Sample 4: Pricing and Value Survey
INSERT INTO questionnaires (title, description, type, target_audience, is_active, is_mandatory, questions) VALUES
(
  'Pricing and Value Feedback',
  'Share your thoughts on our pricing and the value you received.',
  'service_quality',
  'completed_rentals',
  true,
  false,
  '[
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "How would you rate our pricing compared to other rental companies?",
      "options": ["Much More Affordable", "Somewhat More Affordable", "About the Same", "Somewhat More Expensive", "Much More Expensive"],
      "required": true
    },
    {
      "id": "q2",
      "type": "multiple_choice",
      "question": "How would you rate the value for money of your rental?",
      "options": ["Excellent Value", "Good Value", "Fair Value", "Poor Value", "Very Poor Value"],
      "required": true
    },
    {
      "id": "q3",
      "type": "multiple_choice",
      "question": "Was the pricing information clear and transparent during booking?",
      "options": ["Very Clear - No Surprises", "Mostly Clear", "Somewhat Clear", "Confusing", "Very Confusing - Hidden Fees"],
      "required": true
    },
    {
      "id": "q4",
      "type": "multiple_choice",
      "question": "Were there any unexpected charges when you returned the vehicle?",
      "options": ["No Unexpected Charges", "Small Unexpected Charge (Under 5000 FCFA)", "Moderate Charge (5000-15000 FCFA)", "Large Charge (Over 15000 FCFA)", "Disputed the Charges"],
      "required": false
    },
    {
      "id": "q5",
      "type": "multiple_choice",
      "question": "How satisfied were you with the insurance/protection options offered?",
      "options": ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
      "required": false
    },
    {
      "id": "q6",
      "type": "textarea",
      "question": "Any comments about pricing, fees, or value? What would make it better?",
      "required": false
    }
  ]'::jsonb
);

-- Sample 5: Website and Booking Process Survey
INSERT INTO questionnaires (title, description, type, target_audience, is_active, is_mandatory, questions) VALUES
(
  'Website Experience Survey',
  'Help us improve our online booking process.',
  'improvement',
  'all',
  true,
  false,
  '[
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "How easy was it to navigate our website?",
      "options": ["Very Easy", "Easy", "Neutral", "Difficult", "Very Difficult"],
      "required": true
    },
    {
      "id": "q2",
      "type": "multiple_choice",
      "question": "How easy was it to compare different vehicles?",
      "options": ["Very Easy", "Easy", "Neutral", "Difficult", "Very Difficult"],
      "required": false
    },
    {
      "id": "q3",
      "type": "multiple_choice",
      "question": "Were the vehicle photos and descriptions helpful?",
      "options": ["Very Helpful", "Helpful", "Somewhat Helpful", "Not Very Helpful", "Not Helpful at All"],
      "required": false
    },
    {
      "id": "q4",
      "type": "multiple_choice",
      "question": "How was the online payment process?",
      "options": ["Quick and Secure", "Smooth", "Acceptable", "Confusing", "Had Technical Issues"],
      "required": false
    },
    {
      "id": "q5",
      "type": "multiple_choice",
      "question": "What device did you primarily use to book?",
      "options": ["Desktop Computer", "Laptop", "Tablet", "Smartphone (iOS)", "Smartphone (Android)"],
      "required": false
    },
    {
      "id": "q6",
      "type": "multiple_choice",
      "question": "What feature would improve your booking experience most?",
      "options": ["More Vehicle Photos", "Better Filters/Search", "Customer Reviews", "Live Chat Support", "Video Tours of Vehicles", "Mobile App", "None Needed"],
      "required": false
    },
    {
      "id": "q7",
      "type": "textarea",
      "question": "Any other suggestions for improving our website or booking process?",
      "required": false
    }
  ]'::jsonb
);

-- ============================================
-- VIEWS (Optional - for reporting)
-- ============================================

-- View: Questionnaire Summary with Response Stats
CREATE OR REPLACE VIEW questionnaire_summary AS
SELECT 
  q.id,
  q.title,
  q.description,
  q.type,
  q.target_audience,
  q.is_active,
  q.is_mandatory,
  q.created_at,
  COUNT(DISTINCT qr.id) as total_responses,
  COUNT(DISTINCT CASE WHEN qr.is_completed THEN qr.id END) as completed_responses,
  ROUND(
    CASE 
      WHEN COUNT(DISTINCT qr.id) > 0 
      THEN (COUNT(DISTINCT CASE WHEN qr.is_completed THEN qr.id END)::NUMERIC / COUNT(DISTINCT qr.id)::NUMERIC) * 100
      ELSE 0
    END, 
    2
  ) as completion_rate,
  AVG(CASE WHEN qr.is_completed THEN qr.time_taken_seconds END)::INTEGER as avg_completion_time
FROM questionnaires q
LEFT JOIN questionnaire_responses qr ON qr.questionnaire_id = q.id
GROUP BY q.id;

-- ============================================
-- COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE questionnaires IS 'Survey questionnaires created by admin for customer feedback';
COMMENT ON TABLE questionnaire_responses IS 'Customer responses to questionnaires';
COMMENT ON TABLE questionnaire_analytics IS 'Aggregated statistics and analytics for questionnaires';
COMMENT ON FUNCTION get_questionnaire_response_rate(UUID) IS 'Calculates completion percentage for a questionnaire';
COMMENT ON FUNCTION get_average_question_rating(UUID, TEXT) IS 'Gets average rating for a specific question';
COMMENT ON FUNCTION has_pending_questionnaires(UUID) IS 'Checks if user has mandatory incomplete questionnaires';
