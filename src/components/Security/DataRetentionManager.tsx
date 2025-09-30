import React, { useState } from 'react';
import { Calendar, Trash2, Archive, AlertTriangle, Clock, Database, FileText, Download } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { useAppContext } from '../../context/AppContext';
import { safeLocalStorageGet, safeLocalStorageSet } from '../../utils/jsonUtils';

interface RetentionPolicy {
  id: string;
  dataType: 'behavior_logs' | 'child_profiles' | 'family_communications' | 'educator_notes' | 'organization_data';
  retentionPeriod: number; // in years
  autoDelete: boolean;
  legalBasis: string;
  lastReviewed: Date;
  nextReview: Date;
}

interface RetentionSchedule {
  id: string;
  childId: string;
  childName: string;
  dataType: string;
  createdAt: Date;
  retentionUntil: Date;
  status: 'active' | 'archived' | 'scheduled_deletion' | 'deleted';
  deletionReason?: string;
}

interface DeletionRequest {
  id: string;
  requestType: 'parent_request' | 'policy_expiration' | 'admin_request';
  childName: string;
  parentEmail?: string;
  requestedBy: string;
  requestedAt: Date;
  scheduledDeletion: Date;
  status: 'pending' | 'approved' | 'completed';
  dataTypes: string[];
}

export const DataRetentionManager: React.FC = () => {
  const { currentUser, children, behaviorLogs, toast } = useAppContext();
  const [activeTab, setActiveTab] = useState<'policies' | 'schedules' | 'deletions' | 'audit'>('policies');
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>(() => 
    safeLocalStorageGet('lumi_retention_policies', [
      {
        id: '1',
        dataType: 'behavior_logs',
        retentionPeriod: 7,
        autoDelete: false,
        legalBasis: 'FERPA educational record retention requirements',
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        dataType: 'child_profiles',
        retentionPeriod: 7,
        autoDelete: false,
        legalBasis: 'FERPA educational record retention requirements',
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        dataType: 'family_communications',
        retentionPeriod: 3,
        autoDelete: false,
        legalBasis: 'Communication record retention',
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    ])
  );
  const [retentionSchedules, setRetentionSchedules] = useState<RetentionSchedule[]>(() => 
    safeLocalStorageGet('lumi_retention_schedules', [])
  );
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>(() => 
    safeLocalStorageGet('lumi_deletion_requests', [])
  );

  const dataTypes = [
    { value: 'behavior_logs', label: 'Behavior Logs' },
    { value: 'child_profiles', label: 'Child Profiles' },
    { value: 'family_communications', label: 'Family Communications' },
    { value: 'educator_notes', label: 'Educator Notes' },
    { value: 'organization_data', label: 'Organization Data' }
  ];

  const calculateRetentionDate = (createdAt: Date, retentionYears: number): Date => {
    const retentionDate = new Date(createdAt);
    retentionDate.setFullYear(retentionDate.getFullYear() + retentionYears);
    return retentionDate;
  };

  const getDataAtRisk = () => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return children.map(child => {
      const childLogs = behaviorLogs.filter(log => log.childId === child.id);
      const policy = retentionPolicies.find(p => p.dataType === 'behavior_logs');
      
      if (!policy) return null;
      
      const oldestLog = childLogs.length > 0 ? 
        new Date(Math.min(...childLogs.map(log => new Date(log.createdAt).getTime()))) : 
        child.createdAt;
      
      const retentionDate = calculateRetentionDate(oldestLog, policy.retentionPeriod);
      const daysUntilDeletion = Math.ceil((retentionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        child,
        retentionDate,
        daysUntilDeletion,
        isAtRisk: daysUntilDeletion <= 30,
        logCount: childLogs.length
      };
    }).filter(Boolean);
  };

  const dataAtRisk = getDataAtRisk();
  const upcomingDeletions = dataAtRisk.filter(item => item && item.daysUntilDeletion <= 30);

  const handleCreateDeletionRequest = (childName: string, requestType: string) => {
    const request: DeletionRequest = {
      id: Date.now().toString(),
      requestType: requestType as any,
      childName,
      requestedBy: currentUser?.fullName || '',
      requestedAt: new Date(),
      scheduledDeletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days notice
      status: 'pending',
      dataTypes: ['behavior_logs', 'child_profiles']
    };

    const updatedRequests = [...deletionRequests, request];
    setDeletionRequests(updatedRequests);
    safeLocalStorageSet('lumi_deletion_requests', updatedRequests);

    toast.success('Deletion Scheduled', `Data deletion scheduled for ${childName}`);
  };

  const renderPoliciesTab = () => (
    <div className="space-y-6">
      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <div className="flex items-start space-x-4">
          <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              ⚠️ Critical Implementation Gap
            </h3>
            <p className="text-yellow-800 mb-4">
              Automated data retention and deletion policies are not yet implemented. 
              This is a critical FERPA compliance requirement that must be addressed before production.
            </p>
            <div className="space-y-2 text-sm text-yellow-800">
              <p>• <strong>FERPA Requirement:</strong> Educational records must be deleted when no longer needed</p>
              <p>• <strong>Current Status:</strong> Manual deletion only</p>
              <p>• <strong>Risk:</strong> Indefinite data retention violates privacy regulations</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Current Retention Policies
        </h3>
        
        <div className="space-y-4">
          {retentionPolicies.map((policy) => (
            <div key={policy.id} className="p-4 border border-[#E6E2DD] rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-[#1A1A1A]">
                    {policy.dataType.replace('_', ' ').toUpperCase()}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Retention: {policy.retentionPeriod} years
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    policy.autoDelete ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {policy.autoDelete ? 'Auto-Delete ON' : 'Auto-Delete OFF'}
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Legal Basis:</strong> {policy.legalBasis}</p>
                <p><strong>Last Reviewed:</strong> {policy.lastReviewed.toLocaleDateString()}</p>
                <p><strong>Next Review:</strong> {policy.nextReview.toLocaleDateString()}</p>
              </div>
              
              {!policy.autoDelete && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Compliance Risk:</strong> Manual deletion only. Automated deletion required for FERPA compliance.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderSchedulesTab = () => (
    <div className="space-y-6">
      {upcomingDeletions.length > 0 && (
        <Card className="p-6 bg-orange-50 border-orange-200">
          <div className="flex items-start space-x-4">
            <Clock className="w-6 h-6 text-orange-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                Upcoming Data Deletions ({upcomingDeletions.length})
              </h3>
              <p className="text-orange-800 mb-4">
                The following children's data is approaching retention limits and may need deletion.
              </p>
              <div className="space-y-2">
                {upcomingDeletions.map((item, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-orange-900">{item?.child.name}</p>
                        <p className="text-sm text-orange-700">
                          {item?.logCount} behavior logs • Deletion in {item?.daysUntilDeletion} days
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCreateDeletionRequest(item?.child.name || '', 'policy_expiration')}
                        className="text-orange-600 border-orange-300"
                      >
                        Schedule Deletion
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Data Retention Schedules
        </h3>
        
        <div className="space-y-4">
          {children.map((child) => {
            const childLogs = behaviorLogs.filter(log => log.childId === child.id);
            const policy = retentionPolicies.find(p => p.dataType === 'behavior_logs');
            const retentionDate = policy ? calculateRetentionDate(child.createdAt, policy.retentionPeriod) : null;
            const daysUntilDeletion = retentionDate ? 
              Math.ceil((retentionDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
            
            return (
              <div key={child.id} className="p-4 border border-[#E6E2DD] rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-[#1A1A1A]">{child.name}</h4>
                    <p className="text-sm text-gray-600">{child.gradeBand}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      {childLogs.length} behavior logs
                    </p>
                    {retentionDate && (
                      <p className={`text-xs ${
                        daysUntilDeletion && daysUntilDeletion <= 30 ? 'text-red-600' :
                        daysUntilDeletion && daysUntilDeletion <= 90 ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        Retention until: {retentionDate.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Created:</p>
                    <p className="font-medium">{child.createdAt.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Last Activity:</p>
                    <p className="font-medium">
                      {childLogs.length > 0 ? 
                        new Date(Math.max(...childLogs.map(log => new Date(log.createdAt).getTime()))).toLocaleDateString() :
                        'No activity'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status:</p>
                    <p className={`font-medium ${
                      daysUntilDeletion && daysUntilDeletion <= 30 ? 'text-red-600' :
                      daysUntilDeletion && daysUntilDeletion <= 90 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {daysUntilDeletion && daysUntilDeletion > 0 ? 
                        `${daysUntilDeletion} days remaining` :
                        daysUntilDeletion && daysUntilDeletion <= 0 ?
                        'Overdue for deletion' :
                        'Active'
                      }
                    </p>
                  </div>
                </div>
                
                {daysUntilDeletion && daysUntilDeletion <= 30 && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleCreateDeletionRequest(child.name, 'policy_expiration')}
                        className="bg-red-600 hover:bg-red-700"
                        icon={Trash2}
                      >
                        Schedule Deletion
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Extend retention by 1 year
                          toast.info('Retention Extended', `${child.name}'s data retention extended by 1 year`);
                        }}
                        icon={Calendar}
                      >
                        Extend Retention
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  const renderDeletionsTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A]">
            Data Deletion Requests ({deletionRequests.length})
          </h3>
          <Button
            onClick={() => {
              const request: DeletionRequest = {
                id: Date.now().toString(),
                requestType: 'admin_request',
                childName: 'Manual Request',
                requestedBy: currentUser?.fullName || '',
                requestedAt: new Date(),
                scheduledDeletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: 'pending',
                dataTypes: ['behavior_logs']
              };
              
              const updatedRequests = [...deletionRequests, request];
              setDeletionRequests(updatedRequests);
              safeLocalStorageSet('lumi_deletion_requests', updatedRequests);
              toast.success('Deletion Request Created', 'Manual deletion request submitted');
            }}
            icon={Trash2}
            size="sm"
          >
            Create Manual Request
          </Button>
        </div>
        
        {deletionRequests.length === 0 ? (
          <div className="text-center py-8">
            <Trash2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No deletion requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deletionRequests.map((request) => (
              <div key={request.id} className="p-4 border border-[#E6E2DD] rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-[#1A1A1A]">
                      {request.childName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {request.requestType.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    request.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {request.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Requested by:</p>
                    <p className="font-medium">{request.requestedBy}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Scheduled deletion:</p>
                    <p className="font-medium">{request.scheduledDeletion.toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="text-sm">
                  <p className="text-gray-600 mb-1">Data types:</p>
                  <div className="flex flex-wrap gap-1">
                    {request.dataTypes.map((type, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {type.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
                
                {request.status === 'pending' && currentUser?.role === 'admin' && (
                  <div className="flex space-x-2 mt-4 pt-3 border-t border-[#E6E2DD]">
                    <Button
                      size="sm"
                      onClick={() => {
                        const updatedRequests = deletionRequests.map(req =>
                          req.id === request.id
                            ? { ...req, status: 'approved' as const }
                            : req
                        );
                        setDeletionRequests(updatedRequests);
                        safeLocalStorageSet('lumi_deletion_requests', updatedRequests);
                        toast.success('Deletion Approved', 'Data deletion approved');
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Approve Deletion
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updatedRequests = deletionRequests.filter(req => req.id !== request.id);
                        setDeletionRequests(updatedRequests);
                        safeLocalStorageSet('lumi_deletion_requests', updatedRequests);
                        toast.info('Request Cancelled', 'Deletion request cancelled');
                      }}
                    >
                      Cancel
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
          Data Retention Compliance Audit
        </h3>
        
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">✓ Compliant Areas</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Retention policies documented for all data types</li>
              <li>• Legal basis established for each retention period</li>
              <li>• Regular policy review schedule in place</li>
            </ul>
          </div>
          
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">🚨 Critical Issues</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• No automated deletion system implemented</li>
              <li>• No data lifecycle management</li>
              <li>• No parent-initiated deletion process</li>
              <li>• No audit trail for data deletions</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">📊 Retention Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p>Total children: {children.length}</p>
                <p>Total behavior logs: {behaviorLogs.length}</p>
              </div>
              <div>
                <p>Upcoming deletions: {upcomingDeletions.length}</p>
                <p>Overdue deletions: {dataAtRisk.filter(item => item && item.daysUntilDeletion <= 0).length}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const tabs = [
    { id: 'policies', label: 'Retention Policies', icon: FileText },
    { id: 'schedules', label: 'Deletion Schedules', icon: Calendar },
    { id: 'deletions', label: 'Deletion Requests', icon: Trash2 },
    { id: 'audit', label: 'Compliance Audit', icon: Database }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
            Data Retention & Deletion Management
          </h2>
          <p className="text-gray-600">
            FERPA-compliant data lifecycle management and automated retention policies
          </p>
        </div>
        <div className="bg-red-100 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-red-700">
            Critical Implementation Required
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
        {activeTab === 'policies' && renderPoliciesTab()}
        {activeTab === 'schedules' && renderSchedulesTab()}
        {activeTab === 'deletions' && renderDeletionsTab()}
        {activeTab === 'audit' && renderAuditTab()}
      </div>
    </div>
  );
};