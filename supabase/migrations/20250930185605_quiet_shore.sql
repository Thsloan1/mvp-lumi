/*
  # Create Core Lumi Database Schema

  1. New Tables
    - `organizations` - Organization/school management
    - `users` - User accounts (educators, admins)
    - `classrooms` - Classroom profiles
    - `children` - Child profiles
    - `behavior_logs` - Individual behavior tracking
    - `classroom_logs` - Classroom-wide challenges
    - `invitations` - Organization invitations

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access
    - Ensure data isolation between organizations

  3. Indexes
    - Performance indexes on frequently queried columns
    - Foreign key relationships
*/

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('school', 'district', 'childcare_center', 'nonprofit', 'other')),
  owner_id uuid NOT NULL,
  max_seats integer NOT NULL DEFAULT 5,
  active_seats integer NOT NULL DEFAULT 1,
  plan text NOT NULL DEFAULT 'organization_annual',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  first_name text,
  last_name text,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('educator', 'admin')),
  preferred_language text DEFAULT 'english' CHECK (preferred_language IN ('english', 'spanish')),
  learning_style text,
  teaching_style text,
  profile_photo_url text,
  onboarding_status text DEFAULT 'incomplete' CHECK (onboarding_status IN ('incomplete', 'complete')),
  organization_id uuid REFERENCES organizations(id),
  email_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  grade_band text NOT NULL,
  student_count integer NOT NULL DEFAULT 15,
  teacher_student_ratio text DEFAULT '1:8',
  iep_count integer DEFAULT 0,
  ifsp_count integer DEFAULT 0,
  stressors text[] DEFAULT '{}',
  educator_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Children table
CREATE TABLE IF NOT EXISTS children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age integer,
  grade_band text NOT NULL,
  classroom_id uuid NOT NULL REFERENCES classrooms(id),
  developmental_notes text,
  language_ability text,
  self_regulation_skills text,
  sensory_sensitivities text[] DEFAULT '{}',
  has_iep boolean DEFAULT false,
  has_ifsp boolean DEFAULT false,
  support_plans text[] DEFAULT '{}',
  known_triggers text[] DEFAULT '{}',
  home_language text,
  family_context text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Behavior logs table
CREATE TABLE IF NOT EXISTS behavior_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  educator_id uuid NOT NULL REFERENCES users(id),
  child_id uuid REFERENCES children(id),
  classroom_id uuid REFERENCES classrooms(id),
  behavior_description text NOT NULL,
  context text NOT NULL,
  time_of_day text,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  educator_mood text,
  stressors text[] DEFAULT '{}',
  intensity text,
  duration text,
  frequency text,
  adult_response text[] DEFAULT '{}',
  outcome text[] DEFAULT '{}',
  developmental_notes text,
  supports text[] DEFAULT '{}',
  classroom_ratio text,
  resources_available text[] DEFAULT '{}',
  educator_stress_level text,
  confidence_level integer CHECK (confidence_level >= 1 AND confidence_level <= 10),
  ai_response jsonb,
  selected_strategy text,
  confidence_rating integer CHECK (confidence_rating >= 1 AND confidence_rating <= 10),
  reflection_notes text,
  phi_flag jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Classroom logs table
CREATE TABLE IF NOT EXISTS classroom_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  educator_id uuid NOT NULL REFERENCES users(id),
  classroom_id uuid NOT NULL REFERENCES classrooms(id),
  challenge_description text NOT NULL,
  context text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  educator_mood text,
  stressors text[] DEFAULT '{}',
  ai_response jsonb,
  selected_strategy text,
  confidence_self_rating integer CHECK (confidence_self_rating >= 1 AND confidence_self_rating <= 10),
  confidence_strategy_rating integer CHECK (confidence_strategy_rating >= 1 AND confidence_strategy_rating <= 10),
  reflection_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  organization_name text NOT NULL,
  inviter_name text NOT NULL,
  token text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Organizations
CREATE POLICY "Organization owners can manage their organization"
  ON organizations
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Organization members can read their organization"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- RLS Policies for Users
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Organization admins can read organization users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

-- RLS Policies for Classrooms
CREATE POLICY "Educators can manage their classrooms"
  ON classrooms
  FOR ALL
  TO authenticated
  USING (educator_id = auth.uid());

CREATE POLICY "Organization admins can read organization classrooms"
  ON classrooms
  FOR SELECT
  TO authenticated
  USING (
    educator_id IN (
      SELECT id FROM users WHERE organization_id IN (
        SELECT id FROM organizations WHERE owner_id = auth.uid()
      )
    )
  );

-- RLS Policies for Children
CREATE POLICY "Educators can manage children in their classrooms"
  ON children
  FOR ALL
  TO authenticated
  USING (
    classroom_id IN (
      SELECT id FROM classrooms WHERE educator_id = auth.uid()
    )
  );

-- RLS Policies for Behavior Logs
CREATE POLICY "Educators can manage behavior logs for their children"
  ON behavior_logs
  FOR ALL
  TO authenticated
  USING (educator_id = auth.uid());

-- RLS Policies for Classroom Logs
CREATE POLICY "Educators can manage their classroom logs"
  ON classroom_logs
  FOR ALL
  TO authenticated
  USING (educator_id = auth.uid());

-- RLS Policies for Invitations
CREATE POLICY "Organization owners can manage invitations"
  ON invitations
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_educator_id ON classrooms(educator_id);
CREATE INDEX IF NOT EXISTS idx_children_classroom_id ON children(classroom_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_educator_id ON behavior_logs(educator_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_child_id ON behavior_logs(child_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_created_at ON behavior_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_classroom_logs_educator_id ON classroom_logs(educator_id);
CREATE INDEX IF NOT EXISTS idx_classroom_logs_classroom_id ON classroom_logs(classroom_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classrooms_updated_at BEFORE UPDATE ON classrooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_behavior_logs_updated_at BEFORE UPDATE ON behavior_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classroom_logs_updated_at BEFORE UPDATE ON classroom_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();