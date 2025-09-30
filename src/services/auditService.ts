// Comprehensive audit logging service for FERPA/HIPAA compliance
import { safeLocalStorageGet, safeLocalStorageSet } from '../utils/jsonUtils';

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  organizationId?: string;
  userId: string;
  userEmail: string;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  requestId: string;
  success: boolean;
  errorMessage?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceFlags: string[];
  phiAccessed: boolean;
  ferpaRecordAccessed: boolean;
  details?: Record<string, any>;
}

export class AuditService {
  private static readonly STORAGE_KEY = 'lumi_audit_logs';
  private static sessionId = this.generateSessionId();

  private static generateSessionId(): string {
    return 'sess_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Log any data access event
  static async logDataAccess(
    resourceType: string,
    resourceId: string,
    resourceName: string,
    action: 'read' | 'create' | 'update' | 'delete',
    details?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      action: `DATA_${action.toUpperCase()}`,
      resourceType,
      resourceId,
      resourceName,
      riskLevel: this.calculateRiskLevel(resourceType, action),
      complianceFlags: this.getComplianceFlags(resourceType),
      phiAccessed: this.isPHIResource(resourceType),
      ferpaRecordAccessed: this.isFERPAResource(resourceType),
      details
    });
  }

  // Log PHI access specifically
  static async logPHIAccess(
    resourceType: string,
    resourceId: string,
    phiType: string,
    accessGranted: boolean,
    justification?: string
  ): Promise<void> {
    await this.logEvent({
      action: accessGranted ? 'PHI_ACCESS_GRANTED' : 'PHI_ACCESS_DENIED',
      resourceType,
      resourceId,
      resourceName: `PHI: ${phiType}`,
      riskLevel: 'critical',
      complianceFlags: ['HIPAA_PHI_ACCESS', 'AUDIT_REQUIRED'],
      phiAccessed: accessGranted,
      ferpaRecordAccessed: false,
      details: {
        phiType,
        justification,
        accessGranted
      }
    });
  }

  // Log FERPA record access
  static async logFERPAAccess(
    childId: string,
    childName: string,
    action: string,
    parentRequested: boolean = false
  ): Promise<void> {
    await this.logEvent({
      action: `FERPA_${action.toUpperCase()}`,
      resourceType: 'educational_record',
      resourceId: childId,
      resourceName: `Educational Record: ${childName}`,
      riskLevel: 'high',
      complianceFlags: ['FERPA_EDUCATIONAL_RECORD', 'PARENT_RIGHTS'],
      phiAccessed: false,
      ferpaRecordAccessed: true,
      details: {
        parentRequested,
        childName
      }
    });
  }

  // Log authentication events
  static async logAuthEvent(
    action: 'login' | 'logout' | 'failed_login' | 'password_change' | 'mfa_challenge',
    success: boolean,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      action: `AUTH_${action.toUpperCase()}`,
      resourceType: 'authentication',
      riskLevel: success ? 'low' : 'medium',
      complianceFlags: ['AUTHENTICATION'],
      phiAccessed: false,
      ferpaRecordAccessed: false,
      success,
      details
    });
  }

  // Log admin actions
  static async logAdminAction(
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      action: `ADMIN_${action.toUpperCase()}`,
      resourceType,
      resourceId,
      riskLevel: 'high',
      complianceFlags: ['ADMIN_PRIVILEGE', 'ELEVATED_ACCESS'],
      phiAccessed: false,
      ferpaRecordAccessed: this.isFERPAResource(resourceType),
      details
    });
  }

  // Log data export events
  static async logDataExport(
    exportType: string,
    recordCount: number,
    includesPHI: boolean,
    includesFERPA: boolean,
    exportFormat: string
  ): Promise<void> {
    await this.logEvent({
      action: 'DATA_EXPORT',
      resourceType: exportType,
      resourceName: `${exportType} export (${recordCount} records)`,
      riskLevel: includesPHI ? 'critical' : includesFERPA ? 'high' : 'medium',
      complianceFlags: [
        'DATA_EXPORT',
        ...(includesPHI ? ['PHI_EXPORT', 'HIPAA_AUDIT_REQUIRED'] : []),
        ...(includesFERPA ? ['FERPA_EXPORT', 'EDUCATIONAL_RECORD_SHARED'] : [])
      ],
      phiAccessed: includesPHI,
      ferpaRecordAccessed: includesFERPA,
      details: {
        recordCount,
        exportFormat,
        includesPHI,
        includesFERPA
      }
    });
  }

  // Core logging function
  private static async logEvent(eventData: Partial<AuditLogEntry>): Promise<void> {
    try {
      const currentUser = this.getCurrentUser();
      
      const auditEntry: AuditLogEntry = {
        id: this.generateId(),
        timestamp: new Date(),
        organizationId: currentUser?.organizationId,
        userId: currentUser?.id || 'anonymous',
        userEmail: currentUser?.email || 'unknown',
        userRole: currentUser?.role || 'unknown',
        action: eventData.action || 'UNKNOWN_ACTION',
        resourceType: eventData.resourceType || 'unknown',
        resourceId: eventData.resourceId,
        resourceName: eventData.resourceName,
        oldValues: eventData.oldValues,
        newValues: eventData.newValues,
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
        requestId: this.generateRequestId(),
        success: eventData.success ?? true,
        errorMessage: eventData.errorMessage,
        riskLevel: eventData.riskLevel || 'low',
        complianceFlags: eventData.complianceFlags || [],
        phiAccessed: eventData.phiAccessed || false,
        ferpaRecordAccessed: eventData.ferpaRecordAccessed || false,
        details: eventData.details
      };

      // Store audit log
      await this.storeAuditLog(auditEntry);
      
      // Send to monitoring service in production
      if (process.env.NODE_ENV === 'production') {
        await this.sendToMonitoringService(auditEntry);
      }
      
      // Trigger alerts for high-risk events
      if (auditEntry.riskLevel === 'critical' || auditEntry.riskLevel === 'high') {
        await this.triggerSecurityAlert(auditEntry);
      }
      
    } catch (error) {
      console.error('Audit logging failed:', error);
      // Don't throw error to avoid breaking application flow
    }
  }

  // Store audit log locally and send to backend
  private static async storeAuditLog(entry: AuditLogEntry): Promise<void> {
    try {
      // Store locally for immediate access
      const existingLogs = safeLocalStorageGet(this.STORAGE_KEY, []);
      existingLogs.unshift(entry); // Add to beginning
      
      // Keep only last 1000 entries locally
      if (existingLogs.length > 1000) {
        existingLogs.splice(1000);
      }
      
      safeLocalStorageSet(this.STORAGE_KEY, existingLogs);
      
      // Send to backend for permanent storage
      await this.sendToBackend(entry);
      
    } catch (error) {
      console.error('Failed to store audit log:', error);
    }
  }

  // Send audit log to backend
  private static async sendToBackend(entry: AuditLogEntry): Promise<void> {
    try {
      const response = await fetch('/api/audit/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('lumi_token')}`
        },
        body: JSON.stringify(entry)
      });
      
      if (!response.ok) {
        throw new Error(`Audit logging failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send audit log to backend:', error);
      // Store in failed queue for retry
      this.queueFailedAuditLog(entry);
    }
  }

  // Queue failed audit logs for retry
  private static queueFailedAuditLog(entry: AuditLogEntry): void {
    try {
      const failedLogs = safeLocalStorageGet('lumi_failed_audit_logs', []);
      failedLogs.push(entry);
      safeLocalStorageSet('lumi_failed_audit_logs', failedLogs);
    } catch (error) {
      console.error('Failed to queue audit log:', error);
    }
  }

  // Retry failed audit logs
  static async retryFailedAuditLogs(): Promise<void> {
    try {
      const failedLogs = safeLocalStorageGet('lumi_failed_audit_logs', []);
      if (failedLogs.length === 0) return;
      
      const retryPromises = failedLogs.map(log => this.sendToBackend(log));
      await Promise.allSettled(retryPromises);
      
      // Clear failed logs after retry attempt
      localStorage.removeItem('lumi_failed_audit_logs');
    } catch (error) {
      console.error('Failed to retry audit logs:', error);
    }
  }

  // Get all audit logs
  static getAuditLogs(filters?: {
    userId?: string;
    resourceType?: string;
    action?: string;
    riskLevel?: string;
    dateRange?: { start: Date; end: Date };
  }): AuditLogEntry[] {
    try {
      let logs = safeLocalStorageGet(this.STORAGE_KEY, []);
      
      if (filters) {
        logs = logs.filter((log: AuditLogEntry) => {
          if (filters.userId && log.userId !== filters.userId) return false;
          if (filters.resourceType && log.resourceType !== filters.resourceType) return false;
          if (filters.action && log.action !== filters.action) return false;
          if (filters.riskLevel && log.riskLevel !== filters.riskLevel) return false;
          if (filters.dateRange) {
            const logDate = new Date(log.timestamp);
            if (logDate < filters.dateRange.start || logDate > filters.dateRange.end) return false;
          }
          return true;
        });
      }
      
      return logs;
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      return [];
    }
  }

  // Generate compliance report
  static generateComplianceReport(dateRange: { start: Date; end: Date }): {
    ferpaEvents: AuditLogEntry[];
    hipaaEvents: AuditLogEntry[];
    securityEvents: AuditLogEntry[];
    summary: Record<string, number>;
  } {
    const logs = this.getAuditLogs({ dateRange });
    
    const ferpaEvents = logs.filter(log => log.ferpaRecordAccessed);
    const hipaaEvents = logs.filter(log => log.phiAccessed);
    const securityEvents = logs.filter(log => 
      log.riskLevel === 'high' || log.riskLevel === 'critical' || !log.success
    );
    
    const summary = {
      totalEvents: logs.length,
      ferpaEvents: ferpaEvents.length,
      hipaaEvents: hipaaEvents.length,
      securityEvents: securityEvents.length,
      failedAccess: logs.filter(log => !log.success).length,
      adminActions: logs.filter(log => log.action.startsWith('ADMIN_')).length,
      dataExports: logs.filter(log => log.action === 'DATA_EXPORT').length
    };
    
    return {
      ferpaEvents,
      hipaaEvents,
      securityEvents,
      summary
    };
  }

  // Helper functions
  private static getCurrentUser(): any {
    try {
      const token = localStorage.getItem('lumi_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          id: payload.id,
          email: payload.email,
          role: payload.role,
          organizationId: payload.organizationId
        };
      }
    } catch (error) {
      console.error('Failed to get current user:', error);
    }
    return null;
  }

  private static async getClientIP(): Promise<string> {
    try {
      // In production, get from server or use a service
      return '192.168.1.100'; // Placeholder for demo
    } catch (error) {
      return 'unknown';
    }
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private static generateRequestId(): string {
    return 'req_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private static calculateRiskLevel(resourceType: string, action: string): 'low' | 'medium' | 'high' | 'critical' {
    if (resourceType === 'behavior_logs' && action === 'delete') return 'critical';
    if (resourceType === 'children' && action === 'delete') return 'critical';
    if (resourceType === 'phi_data') return 'critical';
    if (resourceType === 'educational_record') return 'high';
    if (action === 'delete') return 'high';
    if (action === 'update') return 'medium';
    return 'low';
  }

  private static getComplianceFlags(resourceType: string): string[] {
    const flags: string[] = [];
    
    if (this.isFERPAResource(resourceType)) {
      flags.push('FERPA_EDUCATIONAL_RECORD');
    }
    
    if (this.isPHIResource(resourceType)) {
      flags.push('HIPAA_PHI_DATA');
    }
    
    return flags;
  }

  private static isFERPAResource(resourceType: string): boolean {
    return ['behavior_logs', 'children', 'educational_record', 'child_profile'].includes(resourceType);
  }

  private static isPHIResource(resourceType: string): boolean {
    return ['phi_data', 'medical_notes', 'therapy_notes', 'health_information'].includes(resourceType);
  }

  private static async sendToMonitoringService(entry: AuditLogEntry): Promise<void> {
    try {
      // Send to external monitoring service (Sentry, LogRocket, etc.)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'audit_log', {
          event_category: 'security',
          event_label: entry.action,
          custom_parameter_1: entry.resourceType,
          custom_parameter_2: entry.riskLevel
        });
      }
    } catch (error) {
      console.error('Failed to send to monitoring service:', error);
    }
  }

  private static async triggerSecurityAlert(entry: AuditLogEntry): Promise<void> {
    try {
      // Create security alert for high-risk events
      const alert = {
        id: this.generateId(),
        alertType: this.getAlertType(entry),
        severity: entry.riskLevel,
        description: `${entry.action} on ${entry.resourceType}`,
        triggeredAt: new Date(),
        userId: entry.userId,
        userName: entry.userEmail,
        details: {
          auditLogId: entry.id,
          action: entry.action,
          resourceType: entry.resourceType,
          success: entry.success
        },
        status: 'open'
      };
      
      const existingAlerts = safeLocalStorageGet('lumi_security_alerts', []);
      existingAlerts.unshift(alert);
      safeLocalStorageSet('lumi_security_alerts', existingAlerts);
      
      // In production, send to alerting system
      console.warn('Security Alert Triggered:', alert);
      
    } catch (error) {
      console.error('Failed to trigger security alert:', error);
    }
  }

  private static getAlertType(entry: AuditLogEntry): string {
    if (!entry.success && entry.action.includes('AUTH')) {
      return 'failed_authentication';
    }
    if (entry.phiAccessed) {
      return 'phi_access';
    }
    if (entry.action === 'DATA_EXPORT') {
      return 'data_export';
    }
    if (entry.riskLevel === 'critical') {
      return 'critical_action';
    }
    return 'security_event';
  }

  // Export audit logs for compliance
  static exportAuditLogs(format: 'json' | 'csv' = 'json'): void {
    try {
      const logs = this.getAuditLogs();
      let content: string;
      let filename: string;
      let mimeType: string;
      
      if (format === 'csv') {
        const headers = [
          'Timestamp', 'User', 'Action', 'Resource Type', 'Resource ID', 
          'Success', 'Risk Level', 'PHI Accessed', 'FERPA Record', 'Compliance Flags'
        ];
        
        const csvRows = logs.map(log => [
          log.timestamp.toISOString(),
          log.userEmail,
          log.action,
          log.resourceType,
          log.resourceId || '',
          log.success.toString(),
          log.riskLevel,
          log.phiAccessed.toString(),
          log.ferpaRecordAccessed.toString(),
          log.complianceFlags.join(';')
        ]);
        
        content = [headers, ...csvRows].map(row => 
          row.map(cell => `"${cell}"`).join(',')
        ).join('\n');
        
        filename = `lumi-audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else {
        content = JSON.stringify(logs, null, 2);
        filename = `lumi-audit-logs-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      }
      
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      throw new Error('Audit log export failed');
    }
  }

  // Clear audit logs (admin only, with logging)
  static async clearAuditLogs(reason: string): Promise<void> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }
      
      // Log the clearing action first
      await this.logAdminAction('CLEAR_AUDIT_LOGS', 'audit_logs', undefined, { reason });
      
      // Clear local storage
      localStorage.removeItem(this.STORAGE_KEY);
      
      console.warn('Audit logs cleared by admin:', currentUser.email, 'Reason:', reason);
      
    } catch (error) {
      console.error('Failed to clear audit logs:', error);
      throw error;
    }
  }
}