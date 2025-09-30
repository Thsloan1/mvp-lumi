import React, { useState } from 'react';
import { Eye, Download, Filter, Calendar, User, Database, Shield, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { useAppContext } from '../../context/AppContext';
import { safeLocalStorageGet, safeLocalStorageSet } from '../../utils/jsonUtils';

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  action: 'login' | 'logout' | 'data_access' | 'data_modify' | 'data_export' | 'phi_access' | 'admin_action' | 'parent_request';
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  success: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceFlags: string[];
}

interface AuditAlert {
  id: string;
  alertType: 'suspicious_access' | 'failed_login_attempts' | 'data_export_spike' | 'phi_access_violation' | 'unauthorized_admin_action';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  triggeredAt: Date;
  userId?: string;
  userName?: string;
  details: Record<string, any>;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  investigatedBy?: string;
  resolvedAt?: Date;
}

export const EnhancedAuditLogger: React.FC = () => {
  const { currentUser, toast } = useAppContext();
  const [activeTab, setActiveTab] = useState<'logs' | 'alerts' | 'compliance' | 'reports'>('logs');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => 
    safeLocalStorageGet('lumi_audit_logs', [])
  );
  const [auditAlerts, setAuditAlerts] = useState<AuditAlert[]>(() => 
    safeLocalStorageGet('lumi_audit_alerts', [])
  );
  const [filterParams, setFilterParams] = useState({
    dateRange: '7d',
    action: '',
    userId: '',
    riskLevel: ''
  });

  const actionTypes = [
    { value: '', label: 'All Actions' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
    { value: 'data_access', label: 'Data Access' },
    { value: 'data_modify', label: 'Data Modification' },
    { value: 'data_export', label: 'Data Export' },
    { value: 'phi_access', label: 'PHI Access' },
    { value: 'admin_action', label: 'Admin Action' },
    { value: 'parent_request', label: 'Parent Request' }
  ];

  const riskLevels = [
    { value: '', label: 'All Risk Levels' },
    { value: 'low', label: 'Low Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'high', label: 'High Risk' },
    { value: 'critical', label: 'Critical Risk' }
  ];

  const dateRangeOptions = [
    { value: '1d', label: 'Last 24 hours' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  // Generate sample audit logs for demonstration
  React.useEffect(() => {
    if (auditLogs.length === 0) {
      const sampleLogs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          userId: 'educator-1',
          userName: 'Sarah Johnson',
          userRole: 'educator',
          action: 'data_access',
          resource: 'child_profile',
          resourceId: 'child-1',
          details: 'Accessed Alex Martinez profile for behavior log entry',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          sessionId: 'sess_abc123',
          success: true,
          riskLevel: 'low',
          complianceFlags: ['FERPA_EDUCATIONAL_INTEREST']
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          userId: 'admin-1',
          userName: 'Dr. Michael Chen',
          userRole: 'admin',
          action: 'admin_action',
          resource: 'organization_settings',
          details: 'Modified organization data retention policies',
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          sessionId: 'sess_def456',
          success: true,
          riskLevel: 'medium',
          complianceFlags: ['ADMIN_PRIVILEGE_USED']
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          userId: 'educator-2',
          userName: 'Maria Rodriguez',
          userRole: 'educator',
          action: 'phi_access',
          resource: 'behavior_log',
          resourceId: 'behavior-1',
          details: 'Attempted access to PHI-flagged behavior log',
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
          sessionId: 'sess_ghi789',
          success: false,
          riskLevel: 'high',
          complianceFlags: ['PHI_ACCESS_DENIED', 'HIPAA_VIOLATION_PREVENTED']
        }
      ];
      
      setAuditLogs(sampleLogs);
      safeLocalStorageSet('lumi_audit_logs', sampleLogs);
    }
  }, [auditLogs.length]);

  const logAuditEvent = (action: string, resource: string, details: string, riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low') => {
    const logEntry: AuditLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      userId: currentUser?.id || 'unknown',
      userName: currentUser?.fullName || 'Unknown User',
      userRole: currentUser?.role || 'unknown',
      action: action as any,
      resource,
      details,
      ipAddress: '192.168.1.100', // Would be actual IP in production
      userAgent: navigator.userAgent,
      sessionId: 'sess_' + Math.random().toString(36).substring(2),
      success: true,
      riskLevel,
      complianceFlags: []
    };

    const updatedLogs = [logEntry, ...auditLogs];
    setAuditLogs(updatedLogs);
    safeLocalStorageSet('lumi_audit_logs', updatedLogs);
  };

  const getFilteredLogs = () => {
    return auditLogs.filter(log => {
      if (filterParams.action && log.action !== filterParams.action) return false;
      if (filterParams.userId && log.userId !== filterParams.userId) return false;
      if (filterParams.riskLevel && log.riskLevel !== filterParams.riskLevel) return false;
      
      // Date range filter
      const logDate = new Date(log.timestamp);
      const now = new Date();
      const daysAgo = parseInt(filterParams.dateRange.replace('d', '').replace('y', '')) * 
                     (filterParams.dateRange.includes('y') ? 365 : 1);
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      return logDate >= cutoffDate;
    });
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const renderLogsTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Audit Log Filters
        </h3>
        
        <div className="grid md:grid-cols-4 gap-4">
          <Select
            label="Date Range"
            value={filterParams.dateRange}
            onChange={(value) => setFilterParams(prev => ({ ...prev, dateRange: value }))}
            options={dateRangeOptions}
          />
          
          <Select
            label="Action Type"
            value={filterParams.action}
            onChange={(value) => setFilterParams(prev => ({ ...prev, action: value }))}
            options={actionTypes}
          />
          
          <Select
            label="Risk Level"
            value={filterParams.riskLevel}
            onChange={(value) => setFilterParams(prev => ({ ...prev, riskLevel: value }))}
            options={riskLevels}
          />
          
          <div className="flex items-end">
            <Button
              onClick={() => setFilterParams({ dateRange: '7d', action: '', userId: '', riskLevel: '' })}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Audit Logs */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A]">
            Audit Trail ({getFilteredLogs().length} entries)
          </h3>
          <Button
            onClick={() => {
              logAuditEvent('data_access', 'audit_logs', 'Viewed audit log interface', 'low');
              toast.info('Audit Event Logged', 'Your access to audit logs has been recorded');
            }}
            variant="outline"
            size="sm"
            icon={Eye}
          >
            Log This Access
          </Button>
        </div>
        
        <div className="space-y-3">
          {getFilteredLogs().slice(0, 20).map((log) => (
            <div key={log.id} className={`p-4 border rounded-xl ${
              log.riskLevel === 'critical' ? 'border-red-200 bg-red-50' :
              log.riskLevel === 'high' ? 'border-orange-200 bg-orange-50' :
              log.riskLevel === 'medium' ? 'border-yellow-200 bg-yellow-50' :
              'border-[#E6E2DD] bg-[#F8F6F4]'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    log.success ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <h4 className="font-medium text-[#1A1A1A]">
                      {log.action.replace('_', ' ').toUpperCase()}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {log.userName} ({log.userRole})
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium ${getRiskColor(log.riskLevel)}`}>
                    {log.riskLevel.toUpperCase()}
                  </span>
                  <p className="text-xs text-gray-500">
                    {log.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="text-sm text-gray-700 mb-2">
                <strong>Resource:</strong> {log.resource}
                {log.resourceId && ` (${log.resourceId})`}
              </div>
              
              <p className="text-sm text-gray-700 mb-2">
                {log.details}
              </p>
              
              {log.complianceFlags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {log.complianceFlags.map((flag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {flag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                Session: {log.sessionId} • IP: {log.ipAddress}
              </div>
            </div>
          ))}
        </div>
        
        {getFilteredLogs().length === 0 && (
          <div className="text-center py-8">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No audit logs match the current filters</p>
          </div>
        )}
      </Card>
    </div>
  );

  const renderAlertsTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A]">
            Security Alerts ({auditAlerts.length})
          </h3>
          <div className="text-sm text-gray-600">
            Open: {auditAlerts.filter(a => a.status === 'open').length}
          </div>
        </div>
        
        {auditAlerts.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-[#1A1A1A] mb-2">
              No Security Alerts
            </h4>
            <p className="text-gray-600">
              Security monitoring alerts will appear here when triggered.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {auditAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 border rounded-xl ${
                alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
                alert.severity === 'high' ? 'border-orange-200 bg-orange-50' :
                alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-[#1A1A1A]">
                      {alert.alertType.replace(/_/g, ' ').toUpperCase()}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {alert.userName && `User: ${alert.userName} • `}
                      {alert.triggeredAt.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      alert.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      alert.status === 'open' ? 'bg-red-100 text-red-700' :
                      alert.status === 'investigating' ? 'bg-yellow-100 text-yellow-700' :
                      alert.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {alert.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">
                  {alert.description}
                </p>
                
                {Object.keys(alert.details).length > 0 && (
                  <div className="bg-white p-3 rounded-lg border mb-3">
                    <h5 className="font-medium text-[#1A1A1A] mb-2">Alert Details:</h5>
                    <div className="text-xs text-gray-600 space-y-1">
                      {Object.entries(alert.details).map(([key, value]) => (
                        <div key={key}>
                          <strong>{key}:</strong> {value?.toString()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {alert.status === 'open' && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        const updatedAlerts = auditAlerts.map(a =>
                          a.id === alert.id
                            ? { ...a, status: 'investigating' as const, investigatedBy: currentUser?.fullName }
                            : a
                        );
                        setAuditAlerts(updatedAlerts);
                        safeLocalStorageSet('lumi_audit_alerts', updatedAlerts);
                        toast.info('Alert Status Updated', 'Alert marked as under investigation');
                      }}
                    >
                      Investigate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updatedAlerts = auditAlerts.map(a =>
                          a.id === alert.id
                            ? { ...a, status: 'resolved' as const, resolvedAt: new Date() }
                            : a
                        );
                        setAuditAlerts(updatedAlerts);
                        safeLocalStorageSet('lumi_audit_alerts', updatedAlerts);
                        toast.success('Alert Resolved', 'Security alert marked as resolved');
                      }}
                    >
                      Resolve
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  const renderComplianceTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          FERPA/HIPAA Audit Compliance
        </h3>
        
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">✓ Implemented Audit Controls</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• User authentication events logged</li>
              <li>• Data access attempts tracked</li>
              <li>• Admin actions recorded</li>
              <li>• Failed access attempts monitored</li>
            </ul>
          </div>
          
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">🚨 Critical Audit Gaps</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• PHI access not comprehensively logged</li>
              <li>• Data export activities not tracked</li>
              <li>• Parent request processing not audited</li>
              <li>• Tamper-proof log storage not implemented</li>
              <li>• Real-time breach detection missing</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">📋 FERPA Audit Requirements</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Log all educational record access (who, what, when, why)</li>
              <li>• Track all record modifications and deletions</li>
              <li>• Monitor unauthorized access attempts</li>
              <li>• Maintain audit logs for minimum 6 years</li>
              <li>• Provide audit reports to parents upon request</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">🏥 HIPAA Audit Requirements</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Log all PHI access, creation, modification, deletion</li>
              <li>• Track minimum necessary access compliance</li>
              <li>• Monitor for unauthorized PHI disclosure</li>
              <li>• Implement automated breach detection</li>
              <li>• Maintain tamper-evident audit logs</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Audit Reports & Compliance
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-[#1A1A1A] mb-3">Available Reports</h4>
            <div className="space-y-2">
              <Button
                onClick={() => {
                  const report = {
                    reportType: 'FERPA_AUDIT_TRAIL',
                    generatedAt: new Date().toISOString(),
                    generatedBy: currentUser?.fullName,
                    dateRange: filterParams.dateRange,
                    logs: getFilteredLogs().filter(log => 
                      log.complianceFlags.some(flag => flag.includes('FERPA'))
                    ),
                    summary: {
                      totalAccess: getFilteredLogs().filter(log => log.action === 'data_access').length,
                      failedAccess: getFilteredLogs().filter(log => !log.success).length,
                      adminActions: getFilteredLogs().filter(log => log.action === 'admin_action').length
                    }
                  };
                  
                  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `FERPA_Audit_Report_${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  
                  toast.success('FERPA Report Generated', 'Audit trail report downloaded');
                }}
                variant="outline"
                className="w-full justify-start"
                icon={FileText}
              >
                FERPA Audit Trail Report
              </Button>
              
              <Button
                onClick={() => {
                  const report = {
                    reportType: 'HIPAA_PHI_ACCESS',
                    generatedAt: new Date().toISOString(),
                    generatedBy: currentUser?.fullName,
                    dateRange: filterParams.dateRange,
                    logs: getFilteredLogs().filter(log => 
                      log.action === 'phi_access' || log.complianceFlags.some(flag => flag.includes('PHI'))
                    ),
                    summary: {
                      phiAccess: getFilteredLogs().filter(log => log.action === 'phi_access').length,
                      unauthorizedAttempts: getFilteredLogs().filter(log => 
                        log.action === 'phi_access' && !log.success
                      ).length
                    }
                  };
                  
                  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `HIPAA_PHI_Access_Report_${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  
                  toast.success('HIPAA Report Generated', 'PHI access report downloaded');
                }}
                variant="outline"
                className="w-full justify-start"
                icon={Shield}
              >
                HIPAA PHI Access Report
              </Button>
              
              <Button
                onClick={() => {
                  const report = {
                    reportType: 'SECURITY_INCIDENT',
                    generatedAt: new Date().toISOString(),
                    generatedBy: currentUser?.fullName,
                    dateRange: filterParams.dateRange,
                    logs: getFilteredLogs().filter(log => 
                      log.riskLevel === 'high' || log.riskLevel === 'critical' || !log.success
                    ),
                    alerts: auditAlerts,
                    summary: {
                      securityIncidents: getFilteredLogs().filter(log => 
                        log.riskLevel === 'high' || log.riskLevel === 'critical'
                      ).length,
                      failedAccess: getFilteredLogs().filter(log => !log.success).length
                    }
                  };
                  
                  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `Security_Incident_Report_${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  
                  toast.success('Security Report Generated', 'Incident report downloaded');
                }}
                variant="outline"
                className="w-full justify-start"
                icon={AlertTriangle}
              >
                Security Incident Report
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-[#1A1A1A] mb-3">Compliance Statistics</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total audit entries:</span>
                <span className="font-medium">{auditLogs.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Failed access attempts:</span>
                <span className="font-medium text-red-600">
                  {auditLogs.filter(log => !log.success).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PHI access events:</span>
                <span className="font-medium text-orange-600">
                  {auditLogs.filter(log => log.action === 'phi_access').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Admin actions:</span>
                <span className="font-medium text-blue-600">
                  {auditLogs.filter(log => log.action === 'admin_action').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Data exports:</span>
                <span className="font-medium text-purple-600">
                  {auditLogs.filter(log => log.action === 'data_export').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const tabs = [
    { id: 'logs', label: 'Audit Logs', icon: Eye },
    { id: 'alerts', label: 'Security Alerts', icon: AlertTriangle },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
            Enhanced Audit Logging & Monitoring
          </h2>
          <p className="text-gray-600">
            Comprehensive audit trail for FERPA/HIPAA compliance and security monitoring
          </p>
        </div>
        <div className="bg-yellow-100 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-yellow-700">
            Enhanced Logging Required
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E6E2DD]">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-[#C44E38] text-[#C44E38]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'logs' && renderLogsTab()}
        {activeTab === 'alerts' && renderAlertsTab()}
        {activeTab === 'compliance' && renderComplianceTab()}
        {activeTab === 'reports' && renderReportsTab()}
      </div>
    </div>
  );
};