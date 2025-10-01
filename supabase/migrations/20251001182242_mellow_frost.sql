/*
  # Enable pg_cron Extension for Automated Data Retention

  1. Extensions
    - `pg_cron` - PostgreSQL job scheduler for automated tasks
  
  2. Purpose
    - Enable automated data retention policies
    - Schedule FERPA-compliant data deletion
    - Automate compliance monitoring tasks
    - Support automated backup and maintenance
  
  3. Security
    - Extension requires superuser privileges
    - Jobs run with appropriate permissions
    - Audit logging for all scheduled tasks
*/

-- Enable pg_cron extension for automated scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant necessary permissions for cron jobs
-- Note: In production, ensure proper role-based access for cron job management

-- Create a function to clean up expired data (FERPA compliance)
CREATE OR REPLACE FUNCTION cleanup_expired_educational_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log the cleanup operation
  INSERT INTO audit_logs (
    action,
    resource_type,
    details,
    created_at
  ) VALUES (
    'AUTOMATED_DATA_CLEANUP',
    'educational_records',
    'Starting automated FERPA-compliant data retention cleanup',
    NOW()
  );
  
  -- This function will be implemented to handle:
  -- 1. Identify records past retention period (7 years for educational records)
  -- 2. Create deletion requests with 30-day notice
  -- 3. Send notifications to parents/guardians
  -- 4. Archive data before deletion
  -- 5. Log all actions for compliance audit
  
  -- For now, just log that the function was called
  RAISE NOTICE 'Automated data retention cleanup function called at %', NOW();
END;
$$;

-- Create a function to generate compliance reports
CREATE OR REPLACE FUNCTION generate_compliance_reports()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log the report generation
  INSERT INTO audit_logs (
    action,
    resource_type,
    details,
    created_at
  ) VALUES (
    'AUTOMATED_COMPLIANCE_REPORT',
    'audit_reports',
    'Generating automated FERPA/HIPAA compliance reports',
    NOW()
  );
  
  -- This function will generate:
  -- 1. Monthly data access reports
  -- 2. PHI access audit trails
  -- 3. Parent rights request summaries
  -- 4. Security incident reports
  
  RAISE NOTICE 'Automated compliance report generation called at %', NOW();
END;
$$;

-- Schedule automated data retention cleanup (daily at 2 AM UTC)
-- Note: Uncomment when ready for production
-- SELECT cron.schedule(
--   'daily-data-retention-cleanup',
--   '0 2 * * *',
--   'SELECT cleanup_expired_educational_records();'
-- );

-- Schedule weekly compliance reports (Sundays at 6 AM UTC)
-- Note: Uncomment when ready for production
-- SELECT cron.schedule(
--   'weekly-compliance-reports',
--   '0 6 * * 0',
--   'SELECT generate_compliance_reports();'
-- );

-- Create audit_logs table if it doesn't exist (for cron job logging)
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  user_id uuid,
  details text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for audit log access (admin only)
CREATE POLICY "Admins can read audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id);