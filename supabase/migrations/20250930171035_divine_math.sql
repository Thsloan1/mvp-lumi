/*
  # Data Retention and Lifecycle Management

  1. New Tables
    - `data_retention_policies` - Configurable retention rules by data type
    - `data_retention_schedules` - Individual record retention tracking
    - `deletion_requests` - Parent and policy-driven deletion requests
    - `business_associate_agreements` - BAA tracking for HIPAA compliance

  2. Security
    - Enable RLS on all new tables
    - Add policies for admin and organization access
    - Implement automated retention enforcement

  3. Automation
    - Trigger functions for automatic retention scheduling
    - Deletion workflow automation
    - Compliance monitoring and alerting
*/

-- Data Retention Policies Table
CREATE TABLE IF NOT EXISTS data_retention_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  data_type text NOT NULL CHECK (data_type IN ('behavior_logs', 'child_profiles', 'family_communications', 'educator_notes', 'phi_data')),
  retention_period_years integer NOT NULL CHECK (retention_period_years > 0),
  auto_delete boolean DEFAULT false,
  legal_basis text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_reviewed_at timestamptz DEFAULT now(),
  next_review_at timestamptz DEFAULT (now() + interval '1 year'),
  UNIQUE(organization_id, data_type)
);

-- Data Retention Schedules Table
CREATE TABLE IF NOT EXISTS data_retention_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  record_type text NOT NULL,
  record_id uuid NOT NULL,
  child_id uuid,
  child_name text,
  created_at timestamptz NOT NULL,
  retention_until timestamptz NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'scheduled_deletion', 'deleted')),
  deletion_reason text,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES auth.users(id),
  policy_id uuid REFERENCES data_retention_policies(id),
  updated_at timestamptz DEFAULT now()
);

-- Deletion Requests Table
CREATE TABLE IF NOT EXISTS deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  request_type text NOT NULL CHECK (request_type IN ('parent_request', 'policy_expiration', 'admin_request', 'legal_hold_release')),
  child_id uuid,
  child_name text NOT NULL,
  parent_name text,
  parent_email text,
  requested_by uuid REFERENCES auth.users(id),
  requested_at timestamptz DEFAULT now(),
  scheduled_deletion timestamptz NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'denied', 'cancelled')),
  data_types text[] NOT NULL,
  justification text,
  processed_by uuid REFERENCES auth.users(id),
  processed_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Business Associate Agreements Table
CREATE TABLE IF NOT EXISTS business_associate_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_name text NOT NULL,
  vendor_type text NOT NULL CHECK (vendor_type IN ('cloud_provider', 'analytics', 'payment_processor', 'email_service', 'monitoring', 'other')),
  service_description text NOT NULL,
  baa_signed boolean DEFAULT false,
  baa_signed_date timestamptz,
  baa_expiration_date timestamptz,
  phi_access_level text CHECK (phi_access_level IN ('none', 'limited', 'full')),
  data_types_accessed text[],
  compliance_status text DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'compliant', 'expired', 'non_compliant')),
  last_audit_date timestamptz,
  next_audit_date timestamptz,
  risk_assessment text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comprehensive Audit Log Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  user_email text,
  user_role text,
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
  compliance_flags text[],
  phi_accessed boolean DEFAULT false,
  ferpa_record_accessed boolean DEFAULT false,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_associate_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Data Retention Policies
CREATE POLICY "Organization members can view retention policies"
  ON data_retention_policies
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can manage retention policies"
  ON data_retention_policies
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for Retention Schedules
CREATE POLICY "Organization members can view retention schedules"
  ON data_retention_schedules
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can manage retention schedules"
  ON data_retention_schedules
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for Deletion Requests
CREATE POLICY "Organization members can view deletion requests"
  ON deletion_requests
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can create deletion requests"
  ON deletion_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can manage deletion requests"
  ON deletion_requests
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for Business Associate Agreements
CREATE POLICY "Organization admins can manage BAAs"
  ON business_associate_agreements
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for Audit Logs
CREATE POLICY "Organization admins can view audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Automated Retention Scheduling Function
CREATE OR REPLACE FUNCTION schedule_data_retention()
RETURNS trigger AS $$
DECLARE
  policy_record data_retention_policies%ROWTYPE;
  retention_date timestamptz;
BEGIN
  -- Find applicable retention policy
  SELECT * INTO policy_record
  FROM data_retention_policies
  WHERE organization_id = NEW.organization_id
    AND data_type = TG_ARGV[0];
  
  IF FOUND THEN
    -- Calculate retention date
    retention_date := NEW.created_at + (policy_record.retention_period_years || ' years')::interval;
    
    -- Create retention schedule
    INSERT INTO data_retention_schedules (
      organization_id,
      record_type,
      record_id,
      child_id,
      child_name,
      created_at,
      retention_until,
      policy_id
    ) VALUES (
      NEW.organization_id,
      TG_ARGV[0],
      NEW.id,
      CASE WHEN TG_ARGV[0] = 'behavior_logs' THEN NEW.child_id ELSE NULL END,
      CASE WHEN TG_ARGV[0] = 'child_profiles' THEN NEW.name ELSE NULL END,
      NEW.created_at,
      retention_date,
      policy_record.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Automated Deletion Function
CREATE OR REPLACE FUNCTION process_scheduled_deletions()
RETURNS void AS $$
DECLARE
  schedule_record data_retention_schedules%ROWTYPE;
  policy_record data_retention_policies%ROWTYPE;
BEGIN
  -- Process all records scheduled for deletion
  FOR schedule_record IN
    SELECT * FROM data_retention_schedules
    WHERE status = 'active'
      AND retention_until <= now()
  LOOP
    -- Get the retention policy
    SELECT * INTO policy_record
    FROM data_retention_policies
    WHERE id = schedule_record.policy_id;
    
    IF policy_record.auto_delete THEN
      -- Archive first, then delete
      UPDATE data_retention_schedules
      SET status = 'archived',
          updated_at = now()
      WHERE id = schedule_record.id;
      
      -- Create deletion request
      INSERT INTO deletion_requests (
        organization_id,
        request_type,
        child_name,
        requested_by,
        scheduled_deletion,
        status,
        data_types,
        justification
      ) VALUES (
        schedule_record.organization_id,
        'policy_expiration',
        schedule_record.child_name,
        policy_record.created_by,
        now() + interval '30 days',
        'approved',
        ARRAY[schedule_record.record_type],
        'Automatic deletion per retention policy'
      );
    ELSE
      -- Mark for manual review
      UPDATE data_retention_schedules
      SET status = 'scheduled_deletion',
          updated_at = now()
      WHERE id = schedule_record.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit Trigger Function
CREATE OR REPLACE FUNCTION audit_data_changes()
RETURNS trigger AS $$
BEGIN
  -- Insert audit log entry
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    user_email,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    success,
    risk_level,
    compliance_flags,
    ferpa_record_accessed
  ) VALUES (
    COALESCE(NEW.organization_id, OLD.organization_id),
    auth.uid(),
    auth.email(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
    true,
    CASE 
      WHEN TG_OP = 'DELETE' THEN 'high'
      WHEN TG_TABLE_NAME IN ('children', 'behavior_logs') THEN 'medium'
      ELSE 'low'
    END,
    CASE 
      WHEN TG_TABLE_NAME IN ('children', 'behavior_logs') THEN ARRAY['FERPA_EDUCATIONAL_RECORD']
      ELSE ARRAY[]::text[]
    END,
    TG_TABLE_NAME IN ('children', 'behavior_logs')
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_risk_level ON audit_logs(risk_level);
CREATE INDEX IF NOT EXISTS idx_retention_schedules_retention_until ON data_retention_schedules(retention_until);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_scheduled_deletion ON deletion_requests(scheduled_deletion);

-- Schedule daily retention processing
SELECT cron.schedule(
  'process-data-retention',
  '0 2 * * *', -- Daily at 2 AM
  'SELECT process_scheduled_deletions();'
);