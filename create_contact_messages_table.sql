-- ============================================
-- CONTACT MESSAGES TABLE & SECURITY POLICIES
-- ============================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on the messages table
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- 1. Policy to allow anonymous submissions (Insert)
CREATE POLICY "Anyone can create contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- 2. Policy to allow admins and staff to view/update submissions (Select, Update, Delete)
CREATE POLICY "Admins and staff can manage contact messages" ON contact_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);
