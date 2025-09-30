import React, { useState } from 'react';
import { Shield, AlertTriangle, Eye, Lock, User, FileText, Calendar } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { useAppContext } from '../../context/AppContext';
import { BehaviorLog, Child } from '../../types';
import { safeLocalStorageGet, safeLocalStorageSet } from '../../utils/jsonUtils';

interface PHIFlag {
  id: string;
  logId: string;
  childId: string;
  flaggedBy: string;
  flaggedAt: Date;
  phiType: 'mental_health' | 'medical' | 'developmental_disability' | 'therapy_notes' | 'medication' | 'other';
  justification: string;
  accessLevel: 'case_manager_only' | 'special_ed_team' | 'admin_only' | 'healthcare_provider';
  reviewedBy?: string;
  reviewedAt?: Date;
}

interface AccessRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  logId: string;
  childName: string;
  justification: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'denied';
  processedBy?: string;
  processedAt?: Date;
}

export const PHIAccessControls: React.FC = () => {
  const { currentUser, behaviorLogs, children, toast } = useAppContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'flagged' | 'access' | 'audit'>('overview');
  const [phiFlags, setPHIFlags] = useState<PHIFlag[]>(() => 
    safeLocalStorageGet('lumi_phi_flags', [])
  );
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>(() => 
    safeLocalStorageGet('lumi_phi_access_requests', [])
  );
  const [newFlag, setNewFlag] = useState({
    logId: '',
    phiType: 'mental_health',
    justification: '',
    accessLevel: 'case_manager_only'
  });

  const phiTypes = [
    { value: 'mental_health', label: 'Mental Health Information' },
    { value: 'medical', label: 'Medical Information' },
    { value: 'developmental_disability', label: 'Developmental Disability' },
    { value: 'therapy_notes', label: 'Therapy/Treatment Notes' },
    { value: 'medication', label: 'Medication Information' },
    { value: 'other', label: 'Other Health Information' }
  ];

  const accessLevels = [
    { value: 'case_manager_only', label: 'Case Manager Only' },
    { value: 'special_ed_team', label: 'Special Education Team' },
    { value: 'admin_only', label: 'Administrator Only' },
    { value: 'healthcare_provider', label: 'Healthcare Provider' }
  ];

  const handleFlagPHI = () => {
    if (!newFlag.logId || !newFlag.justification) {
      toast.error('Missing Information', 'Please select a log and provide justification');
      return;
    }

    const flag: PHIFlag = {
      id: Date.now().toString(),
      logId: newFlag.logId,
      childId: behaviorLogs.find(log => log.id === newFlag.logId)?.childId || '',
      flaggedBy: currentUser?.fullName || '',
      flaggedAt: new Date(),
      phiType: newFlag.phiType as any,
      justification: newFlag.justification,
      accessLevel: newFlag.accessLevel as any
    };

    const updatedFlags = [...phiFlags, flag];
    setPHIFlags(updatedFlags);
    safeLocalStorageSet('lumi_phi_flags', updatedFlags);

    // Reset form
    setNewFlag({
      logId: '',
      phiType: 'mental_health',
      justification: '',
      accessLevel: 'case_manager_only'
    });

    toast.success('PHI Flagged', 'Behavior log marked as containing protected health information');
  };

  const handleAccessRequest = (logId: string, justification: string) => {
    const request: AccessRequest = {
      id: Date.now().toString(),
      requesterId: currentUser?.id || '',
      requesterName: currentUser?.fullName || '',
      logId,
      childName: children.find(c => c.id === behaviorLogs.find(log => log.id === logId)?.childId)?.name || '',
      justification,
      requestedAt: new Date(),
      status: 'pending'
    };

    const updatedRequests = [...accessRequests, request];
    setAccessRequests(updatedRequests);
    safeLocalStorageSet('lumi_phi_access_requests', updatedRequests);

    toast.info('Access Requested', 'PHI access request submitted for approval');
  };

  const detectPotentialPHI = (log: BehaviorLog): boolean => {
    const description = log.behaviorDescription.toLowerCase();
    const phiKeywords = [
      'therapy', 'medication', 'medical', 'doctor', 'diagnosis', 'disability',
      'mental health', 'counseling', 'treatment', 'iep', 'ifsp', 'special needs'
    ];
    
    return phiKeywords.some(keyword => description.includes(keyword)) ||
           log.severity === 'high' && description.includes('aggressive') ||
           description.includes('self-harm') ||
           description.includes('suicidal');
  };

  const potentialPHILogs = behaviorLogs.filter(detectPotentialPHI);
  const flaggedLogs = behaviorLogs.filter(log => 
    phiFlags.some(flag => flag.logId === log.id)
  );

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600 mb-1">
            {potentialPHILogs.length}
          </div>
          <p className="text-sm text-gray-600">Potential PHI Detected</p>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600 mb-1">
            {flaggedLogs.length}
          </div>
          <p className="text-sm text-gray-600">Flagged as PHI</p>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Eye className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {accessRequests.filter(r => r.status === 'pending').length}
          </div>
          <p className="text-sm text-gray-600">Pending Access Requests</p>
        </Card>
      </div>

      {potentialPHILogs.length > 0 && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Potential PHI Detected
              </h3>
              <p className="text-red-800 mb-4">
                {potentialPHILogs.length} behavior logs contain potential Protected Health Information (PHI) 
                and may require HIPAA compliance measures.
              </p>
              <div className="space-y-2">
                {potentialPHILogs.slice(0, 3).map((log) => {
                  const child = children.find(c => c.id === log.childId);
                  return (
                    <div key={log.id} className="bg-white p-3 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-red-900">
                          {child?.name || 'Unknown Child'}
                        </p>
                        <span className="text-xs text-red-600">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-red-700">
                        {log.behaviorDescription.substring(0, 100)}...
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Flag Behavior Log as PHI
        </h3>
        
        <div className="space-y-4">
          <Select
            label="Select Behavior Log"
            value={newFlag.logId}
            onChange={(value) => setNewFlag(prev => ({ ...prev, logId: value }))}
            options={behaviorLogs.map(log => {
              const child = children.find(c => c.id === log.childId);
              return {
                value: log.id,
                label: `${child?.name || 'Unknown'} - ${log.behaviorDescription.substring(0, 50)}...`
              };
            })}
            placeholder="Select a behavior log to flag"
          />
          
          <Select
            label="PHI Type"
            value={newFlag.phiType}
            onChange={(value) => setNewFlag(prev => ({ ...prev, phiType: value }))}
            options={phiTypes}
          />
          
          <Select
            label="Access Level"
            value={newFlag.accessLevel}
            onChange={(value) => setNewFlag(prev => ({ ...prev, accessLevel: value }))}
            options={accessLevels}
          />
          
          <Input
            label="Justification"
            type="textarea"
            value={newFlag.justification}
            onChange={(value) => setNewFlag(prev => ({ ...prev, justification: value }))}
            placeholder="Explain why this log contains PHI and requires restricted access..."
            rows={3}
            required
          />
          
          <Button onClick={handleFlagPHI} icon={Lock}>
            Flag as PHI
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderFlaggedTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#1A1A1A]">
          PHI-Flagged Behavior Logs ({flaggedLogs.length})
        </h3>
      </div>

      {flaggedLogs.length === 0 ? (
        <Card className="p-8 text-center">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-[#1A1A1A] mb-2">
            No PHI-Flagged Logs
          </h4>
          <p className="text-gray-600">
            Behavior logs containing PHI will appear here with restricted access controls.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {flaggedLogs.map((log) => {
            const flag = phiFlags.find(f => f.logId === log.id);
            const child = children.find(c => c.id === log.childId);
            
            return (
              <Card key={log.id} className="p-6 border-red-200 bg-red-50">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-red-900">
                        {child?.name || 'Unknown Child'} - PHI Protected
                      </h4>
                      <span className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full">
                        {flag?.phiType.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border border-red-200 mb-3">
                      <p className="text-sm text-red-800">
                        <strong>Restricted Access:</strong> {flag?.accessLevel.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        {flag?.justification}
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-red-700">Flagged by: {flag?.flaggedBy}</p>
                        <p className="text-red-600">Date: {flag?.flaggedAt.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-red-700">Context: {log.context}</p>
                        <p className="text-red-600">Severity: {log.severity}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-red-200">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAccessRequest(log.id, 'Need to review PHI for case planning')}
                        className="text-red-600 border-red-300"
                      >
                        Request Access
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderAccessTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          PHI Access Requests
        </h3>
        
        {accessRequests.length === 0 ? (
          <div className="text-center py-8">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No PHI access requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {accessRequests.map((request) => (
              <div key={request.id} className="p-4 border border-[#E6E2DD] rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-[#1A1A1A]">
                      Access Request - {request.childName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Requested by: {request.requesterName}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    request.status === 'approved' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {request.status.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Justification:</strong> {request.justification}
                </p>
                
                <p className="text-xs text-gray-500">
                  Requested: {request.requestedAt.toLocaleDateString()}
                </p>
                
                {request.status === 'pending' && currentUser?.role === 'admin' && (
                  <div className="flex space-x-2 mt-3 pt-3 border-t border-[#E6E2DD]">
                    <Button
                      size="sm"
                      onClick={() => {
                        const updatedRequests = accessRequests.map(req =>
                          req.id === request.id
                            ? { ...req, status: 'approved' as const, processedBy: currentUser.fullName, processedAt: new Date() }
                            : req
                        );
                        setAccessRequests(updatedRequests);
                        safeLocalStorageSet('lumi_phi_access_requests', updatedRequests);
                        toast.success('Access Approved', 'PHI access granted');
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updatedRequests = accessRequests.map(req =>
                          req.id === request.id
                            ? { ...req, status: 'denied' as const, processedBy: currentUser.fullName, processedAt: new Date() }
                            : req
                        );
                        setAccessRequests(updatedRequests);
                        safeLocalStorageSet('lumi_phi_access_requests', updatedRequests);
                        toast.warning('Access Denied', 'PHI access request denied');
                      }}
                    >
                      Deny
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

  const renderAuditTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          PHI Access Audit Trail
        </h3>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">HIPAA Audit Requirements</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Log all PHI access attempts (successful and failed)</li>
              <li>• Record who accessed what PHI and when</li>
              <li>• Track all PHI modifications and deletions</li>
              <li>• Monitor for unauthorized access patterns</li>
              <li>• Maintain audit logs for 6 years minimum</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">⚠️ Current Implementation Status</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Basic error logging implemented</li>
              <li>• PHI-specific audit trails not yet implemented</li>
              <li>• Automated compliance monitoring needed</li>
              <li>• Tamper-proof log storage required</li>
            </ul>
          </div>
          
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">🚨 Critical Gaps</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• No PHI access logging currently implemented</li>
              <li>• No breach detection or alerting system</li>
              <li>• Audit log retention policies not established</li>
              <li>• No automated compliance reporting</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'PHI Overview', icon: Shield },
    { id: 'flagged', label: 'Flagged Logs', icon: Lock },
    { id: 'access', label: 'Access Requests', icon: Eye },
    { id: 'audit', label: 'Audit Trail', icon: FileText }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
            PHI Access Controls & HIPAA Compliance
          </h2>
          <p className="text-gray-600">
            Manage Protected Health Information with specialized access controls
          </p>
        </div>
        <div className="bg-red-100 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-red-700">
            HIPAA Compliance Required
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
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'flagged' && renderFlaggedTab()}
        {activeTab === 'access' && renderAccessTab()}
        {activeTab === 'audit' && renderAuditTab()}
      </div>
    </div>
  );
};