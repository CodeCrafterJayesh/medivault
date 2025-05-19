-- Check if the medications table exists
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add some sample data if the table is empty
INSERT INTO medications (user_id, name, dosage, frequency, start_date, end_date, instructions, is_active, notifications_enabled)
SELECT 
  auth.users.id,
  'Lisinopril',
  '10mg',
  'Once daily',
  NOW() - INTERVAL '30 days',
  NOW() + INTERVAL '60 days',
  'Take in the morning with food',
  TRUE,
  TRUE
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM medications LIMIT 1)
LIMIT 1;

INSERT INTO medications (user_id, name, dosage, frequency, start_date, end_date, instructions, is_active, notifications_enabled)
SELECT 
  auth.users.id,
  'Metformin',
  '500mg',
  'Twice daily',
  NOW() - INTERVAL '45 days',
  NOW() + INTERVAL '90 days',
  'Take with meals',
  TRUE,
  TRUE
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM medications OFFSET 1 LIMIT 1)
LIMIT 1;

INSERT INTO medications (user_id, name, dosage, frequency, start_date, end_date, instructions, is_active, notifications_enabled)
SELECT 
  auth.users.id,
  'Atorvastatin',
  '20mg',
  'Once daily at bedtime',
  NOW() - INTERVAL '60 days',
  NOW() + INTERVAL '120 days',
  'Take at night',
  TRUE,
  TRUE
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM medications OFFSET 2 LIMIT 1)
LIMIT 1;
