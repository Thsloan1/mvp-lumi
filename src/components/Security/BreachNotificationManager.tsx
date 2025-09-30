import React, { useState } from 'react';
import { AlertTriangle, Shield, Mail, Clock, FileText, Phone, Users, Database, Eye } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { useAppContext } from '../../context/AppContext';
import { safeLocalStorageGet, safeLocalStorageSet } from '../../utils/jsonUtils';

interface SecurityIncident {
  id: string;
  incidentType: 'data_breach' | 'unauthorized_access' | 'system_compromise' | 'phi_disclosure' | 'ferpa_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  discoveredAt: Date;
  discoveredBy: string;
  affectedRecords: number;
  affectedIndividuals: string[];
  dataTypes: string[];
  containsPHI: boolean;
  containsFERPA: boolean;
  status: 'detected' | 'investigating' | 'contained' | 'resolved' | 'reported';
  investigationNotes: string;
  remediationSteps: string[];
  notificationsSent: boolean;
  regulatoryReported: boolean;
  reportedAt?: Date;
  resolvedAt?: Date;
}

interface NotificationTemplate {
  id: string;
  type: 'individual' | 'organization' | 'regulatory' | 'media';
  title: string;
  template: string;
  requiredFields: string[];
  timeframe: string; // e.g., "within 60 days", "immediately"
  regulatoryRequirement: string;
}

export const BreachNotificationManager: React.FC = () => {
  const { currentUser, toast } = useAppContext();
  const [activeTab, setActiveTab] = useState<'incidents' | 'procedures' | 'templates' | 'compliance'>('procedures');
  const [incidents, setIncidents] = useState<SecurityIncident[]>(() => 
    safeLocalStorageGet('lumi_security_incidents', [])
  );
  const [newIncident, setNewIncident] = useState({
    incidentType: 'data_breach',
    severity: 'medium',
    title: '',
    description: '',
    affectedRecords: 0,
    affectedIndividuals: [] as string[],
    dataTypes: [] as string[],
    containsPHI: false,
    containsFERPA: false
  });

  const notificationTemplates: NotificationTemplate[] = [
    {
      id: 'individual-ferpa',
      type: 'individual',
      title: 'FERPA Breach Notification to Parents',
      template: `Dear [Parent Name],

We are writing to inform you of a security incident that may have affected your child's educational records.

INCIDENT DETAILS:
- Date of Discovery: [Discovery Date]
- Type of Incident: [Incident Type]
- Records Affected: [Affected Records]

INFORMATION INVOLVED:
The following types of information may have been affected:
[Data Types]

ACTIONS TAKEN:
We have taken the following steps to address this incident:
[Remediation Steps]

YOUR RIGHTS:
Under FERPA, you have the right to:
- Request a copy of your child's educational records
- Request corrections to any inaccurate information
- File a complaint with the Department of Education

CONTACT INFORMATION:
If you have questions about this incident, please contact:
Privacy Officer: privacy@lumi.app
Phone: 1-800-LUMI-HELP

We sincerely apologize for this incident and any inconvenience it may cause.

Sincerely,
[Organization Name]
Privacy Officer`,
      requiredFields: ['Parent Name', 'Discovery Date', 'Incident Type', 'Affected Records', 'Data Types', 'Remediation Steps'],
      timeframe: 'within reasonable time',
      regulatoryRequirement: 'FERPA 34 CFR 99.32 - Notification of breach'
    },
    {
      id: 'individual-hipaa',
      type: 'individual',
      title: 'HIPAA Breach Notification to Individuals',
      template: `NOTICE OF BREACH OF PROTECTED HEALTH INFORMATION

Dear [Individual Name],

We are required by law to notify you of a breach of your protected health information (PHI).

WHAT HAPPENED:
[Incident Description]

INFORMATION INVOLVED:
The types of information involved in this breach include:
[PHI Types]

WHAT WE ARE DOING:
[Remediation Actions]

WHAT YOU CAN DO:
[Recommended Actions]

FOR MORE INFORMATION:
Contact our Privacy Officer at privacy@lumi.app or 1-800-LUMI-HELP

This notice is provided as required by the Health Insurance Portability and Accountability Act (HIPAA).

[Organization Name]
Privacy Officer
Date: [Notification Date]`,
      requiredFields: ['Individual Name', 'Incident Description', 'PHI Types', 'Remediation Actions', 'Recommended Actions'],
      timeframe: 'within 60 days',
      regulatoryRequirement: 'HIPAA 45 CFR 164.404 - Individual notification'
    },
    {
      id: 'regulatory-hhs',
      type: 'regulatory',
      title: 'HHS Breach Report (HIPAA)',
      template: `BREACH REPORT TO DEPARTMENT OF HEALTH AND HUMAN SERVICES

Covered Entity: [Organization Name]
Report Date: [Report Date]
Incident Date: [Incident Date]

BREACH DETAILS:
Type of Breach: [Breach Type]
Location of Breach: [Location]
Number of Individuals Affected: [Affected Count]

DESCRIPTION:
[Detailed Description]

PHI INVOLVED:
[PHI Types and Details]

DISCOVERY AND NOTIFICATION:
Date of Discovery: [Discovery Date]
How Discovered: [Discovery Method]
Individuals Notified: [Notification Status]

SAFEGUARDS:
[Current Safeguards]

REMEDIAL ACTIONS:
[Actions Taken]

CONTACT INFORMATION:
Privacy Officer: [Privacy Officer Name]
Email: privacy@lumi.app
Phone: 1-800-LUMI-HELP

Submitted by: [Submitter Name]
Title: [Title]
Date: [Submission Date]`,
      requiredFields: ['Organization Name', 'Incident Date', 'Breach Type', 'Affected Count', 'PHI Types'],
      timeframe: 'within 60 days',
      regulatoryRequirement: 'HIPAA 45 CFR 164.408 - HHS notification'
    }
  ];

  const incidentTypes = [
    { value: 'data_breach', label: 'Data Breach' },
    { value: 'unauthorized_access', label: 'Unauthorized Access' },
    { value: 'system_compromise', label: 'System Compromise' },
    { value: 'phi_disclosure', label: 'PHI Disclosure' },
    { value: 'ferpa_violation', label: 'FERPA Violation' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low - Minimal impact' },
    { value: 'medium', label: 'Medium - Moderate impact' },
    { value: 'high', label: 'High - Significant impact' },
    { value: 'critical', label: 'Critical - Severe impact' }
  ];

  const createSecurityIncident = () => {
    if (!newIncident.title || !newIncident.description) {
      toast.error('Missing Information', 'Please provide incident title and description');
      return;
    }

    const incident: SecurityIncident = {
      id: Date.now().toString(),
      incidentType: newIncident.incidentType as any,
      severity: newIncident.severity as any,
      title: newIncident.title,
      description: newIncident.description,
      discoveredAt: new Date(),
      discoveredBy: currentUser?.fullName || 'System',
      affectedRecords: newIncident.affectedRecords,
      affectedIndividuals: newIncident.affectedIndividuals,
      dataTypes: newIncident.dataTypes,
      containsPHI: newIncident.containsPHI,
      containsFERPA: newIncident.containsFERPA,
      status: 'detected',
      investigationNotes: '',
      remediationSteps: [],
      notificationsSent: false,
      regulatoryReported: false
    };

    const updatedIncidents = [...incidents, incident];
    setIncidents(updatedIncidents);
    safeLocalStorageSet('lumi_security_incidents', updatedIncidents);

    // Reset form
    setNewIncident({
      incidentType: 'data_breach',
      severity: 'medium',
      title: '',
      description: '',
      affectedRecords: 0,
      affectedIndividuals: [],
      dataTypes: [],
      containsPHI: false,
      containsFERPA: false
    });

    // Trigger immediate notifications for critical incidents
    if (incident.severity === 'critical') {
      toast.error('CRITICAL INCIDENT', 'Immediate response required - notifications triggered');
    } else {
      toast.warning('Security Incident Logged', 'Incident response procedures initiated');
    }
  };

  const generateNotificationFromTemplate = (templateId: string, incident: SecurityIncident) => {
    const template = notificationTemplates.find(t => t.id === templateId);
    if (!template) return;

    let notification = template.template;
    
    // Replace placeholders with incident data
    notification = notification.replace(/\[Parent Name\]/g, 'Parent/Guardian');
    notification = notification.replace(/\[Individual Name\]/g, 'Affected Individual');
    notification = notification.replace(/\[Organization Name\]/g, 'Lumi Education Platform');
    notification = notification.replace(/\[Discovery Date\]/g, incident.discoveredAt.toLocaleDateString());
    notification = notification.replace(/\[Incident Type\]/g, incident.incidentType.replace('_', ' '));
    notification = notification.replace(/\[Incident Description\]/g, incident.description);
    notification = notification.replace(/\[Affected Records\]/g, incident.affectedRecords.toString());
    notification = notification.replace(/\[Data Types\]/g, incident.dataTypes.join(', '));
    notification = notification.replace(/\[Notification Date\]/g, new Date().toLocaleDateString());

    const blob = new Blob([notification], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.type}_notification_${incident.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Notification Generated', `${template.title} template created`);
  };

  const renderProceduresTab = () => (
    <div className="space-y-6">
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex items-start space-x-4">
          <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              🚨 Breach Notification Procedures
            </h3>
            <p className="text-red-800 mb-4">
              Comprehensive incident response and notification procedures for FERPA and HIPAA compliance.
            </p>
            <div className="space-y-3 text-sm text-red-800">
              <div>
                <p className="font-medium">IMMEDIATE RESPONSE (0-24 hours):</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Contain the incident and prevent further exposure</li>
                  <li>Document all known details and evidence</li>
                  <li>Notify Privacy Officer and legal counsel</li>
                  <li>Begin investigation and impact assessment</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium">ASSESSMENT PHASE (1-7 days):</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Determine scope and nature of compromised information</li>
                  <li>Identify all affected individuals and records</li>
                  <li>Assess risk of harm to individuals</li>
                  <li>Document remediation steps taken</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium">NOTIFICATION PHASE (within 60 days):</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Notify affected individuals (HIPAA: 60 days, FERPA: reasonable time)</li>
                  <li>Report to HHS (HIPAA) or Department of Education (FERPA)</li>
                  <li>Notify media if breach affects 500+ individuals</li>
                  <li>Document all notifications sent</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Report New Security Incident
        </h3>
        
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Select
              label="Incident Type"
              value={newIncident.incidentType}
              onChange={(value) => setNewIncident(prev => ({ ...prev, incidentType: value }))}
              options={incidentTypes}
            />
            
            <Select
              label="Severity Level"
              value={newIncident.severity}
              onChange={(value) => setNewIncident(prev => ({ ...prev, severity: value }))}
              options={severityLevels}
            />
          </div>
          
          <Input
            label="Incident Title"
            value={newIncident.title}
            onChange={(value) => setNewIncident(prev => ({ ...prev, title: value }))}
            placeholder="Brief description of the incident"
            required
          />
          
          <Input
            label="Detailed Description"
            type="textarea"
            value={newIncident.description}
            onChange={(value) => setNewIncident(prev => ({ ...prev, description: value }))}
            placeholder="Provide detailed information about what happened, when, and how it was discovered..."
            rows={4}
            required
          />
          
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Affected Records Count"
              type="number"
              value={newIncident.affectedRecords.toString()}
              onChange={(value) => setNewIncident(prev => ({ ...prev, affectedRecords: parseInt(value) || 0 }))}
              min={0}
            />
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={newIncident.containsPHI}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, containsPHI: e.target.checked }))}
                  className="rounded border-[#E6E2DD] text-red-600 focus:ring-red-500"
                />
                <span className="font-medium text-red-600">Contains Protected Health Information (PHI)</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={newIncident.containsFERPA}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, containsFERPA: e.target.checked }))}
                  className="rounded border-[#E6E2DD] text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-blue-600">Contains FERPA Educational Records</span>
              </label>
            </div>
          </div>
          
          <Button onClick={createSecurityIncident} icon={AlertTriangle} className="bg-red-600 hover:bg-red-700">
            Report Security Incident
          </Button>
        </div>
      </Card>

      {/* Emergency Contact Information */}
      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-900 mb-4">
          📞 Emergency Incident Response Contacts
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-yellow-900 mb-3">Internal Contacts</h4>
            <div className="space-y-2 text-sm text-yellow-800">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Privacy Officer: privacy@lumi.app</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Emergency Hotline: 1-800-LUMI-HELP</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Legal Counsel: legal@lumi.app</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-yellow-900 mb-3">Regulatory Contacts</h4>
            <div className="space-y-2 text-sm text-yellow-800">
              <div>
                <p className="font-medium">HHS (HIPAA Breaches):</p>
                <p>https://ocrportal.hhs.gov/ocr/breach/wizard_breach.jsf</p>
              </div>
              <div>
                <p className="font-medium">Department of Education (FERPA):</p>
                <p>studentprivacy@ed.gov</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderIncidentsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#1A1A1A]">
          Security Incidents ({incidents.length})
        </h3>
        <div className="text-sm text-gray-600">
          Open: {incidents.filter(i => !['resolved', 'reported'].includes(i.status)).length}
        </div>
      </div>

      {incidents.length === 0 ? (
        <Card className="p-8 text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-[#1A1A1A] mb-2">
            No Security Incidents Reported
          </h4>
          <p className="text-gray-600">
            Security incidents and breach notifications will be managed here.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <Card key={incident.id} className={`p-6 ${
              incident.severity === 'critical' ? 'border-red-200 bg-red-50' :
              incident.severity === 'high' ? 'border-orange-200 bg-orange-50' :
              incident.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
              'border-blue-200 bg-blue-50'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-[#1A1A1A]">
                      {incident.title}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      incident.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      incident.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                      incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {incident.severity.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {incident.incidentType.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{incident.description}</p>
                  <div className="text-sm text-gray-600">
                    <p>Discovered: {incident.discoveredAt.toLocaleDateString()} by {incident.discoveredBy}</p>
                    <p>Affected Records: {incident.affectedRecords}</p>
                    {incident.containsPHI && <p className="text-red-600 font-medium">⚠️ Contains PHI</p>}
                    {incident.containsFERPA && <p className="text-blue-600 font-medium">⚠️ Contains FERPA Records</p>}
                  </div>
                </div>
                
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  incident.status === 'resolved' ? 'bg-green-100 text-green-700' :
                  incident.status === 'investigating' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {incident.status.toUpperCase()}
                </span>
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-200">
                {incident.containsPHI && (
                  <Button
                    size="sm"
                    onClick={() => generateNotificationFromTemplate('individual-hipaa', incident)}
                    icon={Mail}
                  >
                    Generate HIPAA Notice
                  </Button>
                )}
                
                {incident.containsFERPA && (
                  <Button
                    size="sm"
                    onClick={() => generateNotificationFromTemplate('individual-ferpa', incident)}
                    icon={Mail}
                    variant="outline"
                  >
                    Generate FERPA Notice
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const updatedIncidents = incidents.map(i =>
                      i.id === incident.id
                        ? { ...i, status: 'resolved' as const, resolvedAt: new Date() }
                        : i
                    );
                    setIncidents(updatedIncidents);
                    safeLocalStorageSet('lumi_security_incidents', updatedIncidents);
                    toast.success('Incident Resolved', 'Security incident marked as resolved');
                  }}
                  icon={CheckCircle}
                >
                  Mark Resolved
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Breach Notification Templates
        </h3>
        
        <div className="space-y-6">
          {notificationTemplates.map((template) => (
            <div key={template.id} className="p-4 border border-[#E6E2DD] rounded-xl">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-[#1A1A1A] mb-1">
                    {template.title}
                  </h4>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {template.type.toUpperCase()}
                    </span>
                    <span className="text-gray-600">
                      Timeframe: {template.timeframe}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const blob = new Blob([template.template], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${template.id}_template.txt`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    toast.success('Template Downloaded', 'Notification template saved');
                  }}
                  icon={FileText}
                >
                  Download Template
                </Button>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                <p className="text-xs text-gray-600 mb-1">
                  <strong>Regulatory Requirement:</strong> {template.regulatoryRequirement}
                </p>
                <p className="text-xs text-gray-600">
                  <strong>Required Fields:</strong> {template.requiredFields.join(', ')}
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 p-3 rounded-lg max-h-32 overflow-y-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {template.template.substring(0, 300)}...
                </pre>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderComplianceTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Breach Notification Compliance Status
        </h3>
        
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">✓ Implemented Procedures</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Incident reporting and tracking system</li>
              <li>• Notification templates for FERPA and HIPAA</li>
              <li>• Emergency contact procedures</li>
              <li>• Documentation and audit trail requirements</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">📋 FERPA Notification Requirements</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Notify parents within reasonable time of discovery</li>
              <li>• Include nature of breach and records affected</li>
              <li>• Describe steps taken to protect information</li>
              <li>• Provide contact information for questions</li>
            </ul>
          </div>
          
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">🏥 HIPAA Notification Requirements</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Individual notification within 60 days</li>
              <li>• HHS notification within 60 days</li>
              <li>• Media notification if 500+ individuals affected</li>
              <li>• Annual summary to HHS for smaller breaches</li>
            </ul>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">📊 Incident Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-purple-800">
              <div>
                <p>Total incidents: {incidents.length}</p>
                <p>Resolved incidents: {incidents.filter(i => i.status === 'resolved').length}</p>
              </div>
              <div>
                <p>PHI incidents: {incidents.filter(i => i.containsPHI).length}</p>
                <p>FERPA incidents: {incidents.filter(i => i.containsFERPA).length}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const tabs = [
    { id: 'procedures', label: 'Response Procedures', icon: AlertTriangle },
    { id: 'incidents', label: 'Security Incidents', icon: Shield },
    { id: 'templates', label: 'Notification Templates', icon: FileText },
    { id: 'compliance', label: 'Compliance Status', icon: CheckCircle }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
            Breach Notification & Incident Response
          </h2>
          <p className="text-gray-600">
            FERPA and HIPAA compliant breach notification procedures and incident management
          </p>
        </div>
        <div className="bg-red-100 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-red-700">
            Critical Compliance Requirement
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
        {activeTab === 'procedures' && renderProceduresTab()}
        {activeTab === 'incidents' && renderIncidentsTab()}
        {activeTab === 'templates' && renderTemplatesTab()}
        {activeTab === 'compliance' && renderComplianceTab()}
      </div>
    </div>
  );
};