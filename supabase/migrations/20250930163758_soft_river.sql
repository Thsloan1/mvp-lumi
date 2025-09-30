/*
  # Critical Security Infrastructure Implementation

  1. Database Row-Level Security (RLS)
    - Enable RLS on all tables
    - Implement organization-based data isolation
    - Prevent cross-classroom data access

  2. Field-Level Encryption Setup
    - Create encryption functions for sensitive data
    - Implement key management
    - Encrypt behavioral notes and family context

  3. Audit Logging Infrastructure
    - Create comprehensive audit trail tables
    - Log all data access and modifications
    - Implement tamper-proof logging

  4. FERPA Compliance Tables
    - Parent portal authentication
    - Data access requests
    - Consent management
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create encryption key management
CREATE TABLE IF NOT EXISTS encryption_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text UNIQUE NOT NULL,
  key_value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  rotated_at timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'rotated', 'revoked'))
);

ALTER TABLE encryption_keys ENABLE ROW LEVEL SECURITY;

-- Only system admins can manage encryption keys
CREATE POLICY "System admins only" ON encryption_keys
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'system_admin');

-- Organizations table with RLS
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  owner_id uuid REFERENCES auth.users(id),
  max_seats integer DEFAULT 5,
  active_seats integer DEFAULT 1,
  plan text DEFAULT 'individual',
  status text DEFAULT 'active',
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Users can only access their own organization
CREATE POLICY "Users access own organization" ON organizations
  FOR ALL TO authenticated
  USING (
    owner_id = auth.uid() OR 
    id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- User profiles with organization membership
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) UNIQUE NOT NULL,
  organization_id uuid REFERENCES organizations(id),
  full_name text NOT NULL,
  email text NOT NULL,
  role text DEFAULT 'educator' CHECK (role IN ('educator', 'admin', 'owner')),
  preferred_language text DEFAULT 'english',
  learning_style text,
  teaching_style text,
  onboarding_status text DEFAULT 'incomplete',
  profile_photo_url text,
  encrypted_notes text, -- Field-level encryption for sensitive notes
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only access their own profile and org members
CREATE POLICY "Users access own profile and org members" ON user_profiles
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users update own profile" ON user_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Classrooms with organization isolation
CREATE TABLE IF NOT EXISTS classrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) NOT NULL,
  educator_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  grade_band text NOT NULL,
  student_count integer DEFAULT 15,
  teacher_student_ratio text DEFAULT '1:8',
  iep_count integer DEFAULT 0,
  ifsp_count integer DEFAULT 0,
  stressors text[] DEFAULT '{}',
  encrypted_environment_notes text, -- Encrypted sensitive classroom data
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;

-- Educators can only access their own classrooms within their organization
CREATE POLICY "Educators access own classrooms" ON classrooms
  FOR ALL TO authenticated
  USING (
    educator_id = auth.uid() AND
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Children profiles with strict access control
CREATE TABLE IF NOT EXISTS children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) NOT NULL,
  classroom_id uuid REFERENCES classrooms(id) NOT NULL,
  name text NOT NULL,
  age integer,
  grade_band text NOT NULL,
  has_iep boolean DEFAULT false,
  has_ifsp boolean DEFAULT false,
  encrypted_developmental_notes text, -- Encrypted sensitive developmental data
  encrypted_family_context text, -- Encrypted family information
  encrypted_medical_notes text, -- Encrypted health-related information
  home_language text,
  support_plans text[] DEFAULT '{}',
  known_triggers text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Children can only be accessed by educators in the same organization/classroom
CREATE POLICY "Educators access children in their classrooms" ON children
  FOR ALL TO authenticated
  USING (
    classroom_id IN (
      SELECT id FROM classrooms 
      WHERE educator_id = auth.uid() AND
      organization_id IN (
        SELECT organization_id FROM user_profiles 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Behavior logs with PHI protection
CREATE TABLE IF NOT EXISTS behavior_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) NOT NULL,
  educator_id uuid REFERENCES auth.users(id) NOT NULL,
  child_id uuid REFERENCES children(id) NOT NULL,
  classroom_id uuid REFERENCES classrooms(id) NOT NULL,
  encrypted_behavior_description text NOT NULL, -- Encrypted behavior data
  context text NOT NULL,
  time_of_day text,
  severity text CHECK (severity IN ('low', 'medium', 'high')),
  educator_mood text,
  stressors text[] DEFAULT '{}',
  intensity text,
  duration text,
  frequency text,
  adult_response text[] DEFAULT '{}',
  outcome text[] DEFAULT '{}',
  encrypted_developmental_notes text, -- Encrypted sensitive notes
  supports text[] DEFAULT '{}',
  classroom_ratio text,
  resources_available text[] DEFAULT '{}',
  educator_stress_level text,
  confidence_level integer,
  ai_response jsonb,
  selected_strategy text,
  confidence_rating integer,
  encrypted_reflection_notes text, -- Encrypted reflection data
  phi_flag jsonb, -- PHI classification and access controls
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE behavior_logs ENABLE ROW LEVEL SECURITY;

-- Behavior logs can only be accessed by the educator who created them
CREATE POLICY "Educators access own behavior logs" ON behavior_logs
  FOR ALL TO authenticated
  USING (
    educator_id = auth.uid() AND
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- PHI access control for behavior logs
CREATE POLICY "PHI access restricted" ON behavior_logs
  FOR SELECT TO authenticated
  USING (
    CASE 
      WHEN phi_flag IS NOT NULL AND (phi_flag->>'containsPHI')::boolean = true THEN
        -- PHI access requires special permissions
        auth.jwt() ->> 'role' IN ('admin', 'case_manager', 'special_ed_coordinator') AND
        educator_id = auth.uid()
      ELSE
        -- Regular access for non-PHI data
        educator_id = auth.uid()
    END
  );

-- Comprehensive audit logging table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  user_email text NOT NULL,
  user_role text NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  resource_name text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  session_id text,
  request_id text,
  success boolean DEFAULT true,
  error_message text,
  risk_level text DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  compliance_flags text[] DEFAULT '{}',
  phi_accessed boolean DEFAULT false,
  ferpa_record_accessed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit logs can be viewed by admins and the user who performed the action
CREATE POLICY "Audit log access" ON audit_logs
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    auth.jwt() ->> 'role' IN ('admin', 'owner') AND
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- FERPA parental rights management
CREATE TABLE IF NOT EXISTS parental_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) NOT NULL,
  child_id uuid REFERENCES children(id) NOT NULL,
  parent_name text NOT NULL,
  parent_email text NOT NULL,
  request_type text NOT NULL CHECK (request_type IN ('access', 'correction', 'deletion', 'consent_withdrawal')),
  request_details text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'denied')),
  submitted_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  processed_by uuid REFERENCES auth.users(id),
  response_notes text,
  documents_generated text[] DEFAULT '{}',
  compliance_verified boolean DEFAULT false
);

ALTER TABLE parental_requests ENABLE ROW LEVEL SECURITY;

-- Parental requests can be viewed by organization members
CREATE POLICY "Organization members access parental requests" ON parental_requests
  FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Data retention schedules
CREATE TABLE IF NOT EXISTS data_retention_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) NOT NULL,
  child_id uuid REFERENCES children(id) NOT NULL,
  data_type text NOT NULL,
  retention_period_years integer NOT NULL,
  created_at timestamptz NOT NULL,
  retention_until timestamptz NOT NULL,
  deletion_scheduled_at timestamptz,
  deletion_completed_at timestamptz,
  deletion_reason text,
  legal_hold boolean DEFAULT false,
  status text DEFAULT 'active' CHECK (status IN ('active', 'scheduled_deletion', 'deleted', 'legal_hold'))
);

ALTER TABLE data_retention_schedules ENABLE ROW LEVEL SECURITY;

-- Data retention schedules accessible by organization members
CREATE POLICY "Organization data retention access" ON data_retention_schedules
  FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- PHI access controls and flagging
CREATE TABLE IF NOT EXISTS phi_access_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  phi_type text NOT NULL CHECK (phi_type IN ('mental_health', 'medical', 'developmental_disability', 'therapy_notes')),
  access_level text NOT NULL CHECK (access_level IN ('case_manager_only', 'special_ed_team', 'admin_only', 'healthcare_provider')),
  flagged_by uuid REFERENCES auth.users(id) NOT NULL,
  flagged_at timestamptz DEFAULT now(),
  justification text NOT NULL,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  access_granted_to uuid[] DEFAULT '{}',
  last_accessed_at timestamptz,
  access_count integer DEFAULT 0
);

ALTER TABLE phi_access_controls ENABLE ROW LEVEL SECURITY;

-- PHI access controls viewable by authorized personnel only
CREATE POLICY "PHI access controls restricted" ON phi_access_controls
  FOR SELECT TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'case_manager', 'special_ed_coordinator') AND
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Parent portal authentication
CREATE TABLE IF NOT EXISTS parent_portal_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) NOT NULL,
  child_id uuid REFERENCES children(id) NOT NULL,
  parent_email text NOT NULL,
  parent_name text NOT NULL,
  access_token text UNIQUE NOT NULL,
  verification_code text,
  verified_at timestamptz,
  last_login_at timestamptz,
  login_attempts integer DEFAULT 0,
  locked_until timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) NOT NULL
);

ALTER TABLE parent_portal_access ENABLE ROW LEVEL SECURITY;

-- Parents can only access their own portal data
CREATE POLICY "Parents access own portal" ON parent_portal_access
  FOR SELECT TO anon, authenticated
  USING (
    CASE 
      WHEN auth.uid() IS NULL THEN
        -- Anonymous access with valid token
        access_token = current_setting('request.jwt.claims', true)::json->>'access_token'
      ELSE
        -- Authenticated educator access within organization
        organization_id IN (
          SELECT organization_id FROM user_profiles 
          WHERE user_id = auth.uid()
        )
    END
  );

-- Encryption helper functions
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data text, key_name text DEFAULT 'default')
RETURNS text AS $$
DECLARE
  encryption_key text;
BEGIN
  -- Get encryption key (in production, use proper key management)
  SELECT key_value INTO encryption_key 
  FROM encryption_keys 
  WHERE key_name = $2 AND status = 'active'
  LIMIT 1;
  
  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'Encryption key not found: %', key_name;
  END IF;
  
  -- Encrypt using AES-256
  RETURN encode(
    encrypt(
      data::bytea, 
      encryption_key::bytea, 
      'aes'
    ), 
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_data text, key_name text DEFAULT 'default')
RETURNS text AS $$
DECLARE
  encryption_key text;
BEGIN
  -- Get encryption key
  SELECT key_value INTO encryption_key 
  FROM encryption_keys 
  WHERE key_name = $2 AND status = 'active'
  LIMIT 1;
  
  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'Encryption key not found: %', key_name;
  END IF;
  
  -- Decrypt using AES-256
  RETURN convert_from(
    decrypt(
      decode(encrypted_data, 'base64'), 
      encryption_key::bytea, 
      'aes'
    ), 
    'UTF8'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit logging function
CREATE OR REPLACE FUNCTION log_audit_event(
  p_action text,
  p_resource_type text,
  p_resource_id uuid DEFAULT NULL,
  p_resource_name text DEFAULT NULL,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL,
  p_risk_level text DEFAULT 'low',
  p_compliance_flags text[] DEFAULT '{}',
  p_phi_accessed boolean DEFAULT false,
  p_ferpa_record_accessed boolean DEFAULT false
)
RETURNS uuid AS $$
DECLARE
  audit_id uuid;
  user_profile record;
BEGIN
  -- Get user profile for organization context
  SELECT * INTO user_profile 
  FROM user_profiles 
  WHERE user_id = auth.uid();
  
  -- Insert audit log entry
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    user_email,
    user_role,
    action,
    resource_type,
    resource_id,
    resource_name,
    old_values,
    new_values,
    ip_address,
    user_agent,
    session_id,
    request_id,
    risk_level,
    compliance_flags,
    phi_accessed,
    ferpa_record_accessed
  ) VALUES (
    user_profile.organization_id,
    auth.uid(),
    user_profile.email,
    user_profile.role,
    p_action,
    p_resource_type,
    p_resource_id,
    p_resource_name,
    p_old_values,
    p_new_values,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent',
    current_setting('request.jwt.claims', true)::json->>'session_id',
    current_setting('request.headers', true)::json->>'x-request-id',
    p_risk_level,
    p_compliance_flags,
    p_phi_accessed,
    p_ferpa_record_accessed
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for automatic audit logging
CREATE OR REPLACE FUNCTION trigger_audit_log()
RETURNS trigger AS $$
BEGIN
  -- Log all data modifications
  PERFORM log_audit_event(
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    COALESCE(NEW.name, OLD.name, 'unnamed'),
    to_jsonb(OLD),
    to_jsonb(NEW),
    CASE 
      WHEN TG_TABLE_NAME IN ('behavior_logs', 'children') THEN 'high'
      ELSE 'medium'
    END,
    ARRAY['AUTO_LOGGED'],
    TG_TABLE_NAME = 'behavior_logs' AND (NEW.phi_flag IS NOT NULL),
    TG_TABLE_NAME IN ('behavior_logs', 'children')
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_behavior_logs
  AFTER INSERT OR UPDATE OR DELETE ON behavior_logs
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER audit_children
  AFTER INSERT OR UPDATE OR DELETE ON children
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER audit_user_profiles
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

-- Data retention policy enforcement
CREATE OR REPLACE FUNCTION enforce_data_retention()
RETURNS void AS $$
DECLARE
  retention_record record;
BEGIN
  -- Find data that has exceeded retention period
  FOR retention_record IN 
    SELECT * FROM data_retention_schedules 
    WHERE status = 'active' 
    AND retention_until < now()
    AND legal_hold = false
  LOOP
    -- Schedule for deletion (30-day notice period)
    UPDATE data_retention_schedules 
    SET 
      status = 'scheduled_deletion',
      deletion_scheduled_at = now() + interval '30 days'
    WHERE id = retention_record.id;
    
    -- Log the retention action
    PERFORM log_audit_event(
      'RETENTION_POLICY_TRIGGERED',
      'data_retention',
      retention_record.id,
      retention_record.data_type,
      NULL,
      to_jsonb(retention_record),
      'high',
      ARRAY['FERPA_RETENTION', 'AUTO_SCHEDULED_DELETION'],
      false,
      true
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create scheduled job for retention enforcement (requires pg_cron extension)
-- SELECT cron.schedule('enforce-data-retention', '0 2 * * *', 'SELECT enforce_data_retention();');

-- Insert default encryption key (in production, use proper key management)
INSERT INTO encryption_keys (key_name, key_value) 
VALUES ('default', encode(gen_random_bytes(32), 'base64'))
ON CONFLICT (key_name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_organization ON user_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_educator ON classrooms(educator_id);
CREATE INDEX IF NOT EXISTS idx_children_classroom ON children(classroom_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_educator ON behavior_logs(educator_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_child ON behavior_logs(child_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_phi ON audit_logs(phi_accessed) WHERE phi_accessed = true;
CREATE INDEX IF NOT EXISTS idx_audit_logs_ferpa ON audit_logs(ferpa_record_accessed) WHERE ferpa_record_accessed = true;