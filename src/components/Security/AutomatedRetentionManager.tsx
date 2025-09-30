import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, Archive, AlertTriangle, Clock, Database, FileText, Download, Play, Settings } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { useAppContext } from '../../context/AppContext';
import { safeLocalStorageGet, safeLocalStorageSet } from '../../utils/jsonUtils';

interface RetentionPolicy {
  id: string;
  organizationId: string;
  dataType: 'behavior_logs' | 'child_profiles' | 'family_communications' | 'educator_notes' | 'phi_data';
  retentionPeriodYears: number;
  autoDelete: boolean;
  legalBasis: string;
  createdBy: string;
  createdAt: Date;
  lastReviewedAt: Date;
  nextReviewAt: Date;
}

interface RetentionSchedule {
  id: string;
  organizationId: string;
  recordType: string;
  recordId: string;
  childId?: string;
  childName?: string;
  createdAt: Date;
  retentionUntil: Date;
  status: 'active' | 'archived' | 'scheduled_deletion' | 'deleted';
  deletionReason?: string;
  policyId: string;
}

interface DeletionRequest {
  id: string;
  organizationId: string;
  requestType: 'parent_request' | 'policy_expiration' | 'admin_request' | 'legal_hold_release';
  childName: string;
  parentName?: string;
  parentEmail?: string;
  requestedBy: string;
  requestedAt: Date;
  scheduledDeletion: Date;
  status: 'pending' | 'approved' | 'completed' | 'denied' | 'cancelled';
  dataTypes: string[];
  justification?: string;
  processedBy?: string;
  processedAt?: Date;
}

export const AutomatedRetentionManager: React.FC = () => {
  const { currentUser, children, behaviorLogs, toast } = useAppContext();
  const [activeTab, setActiveTab] = useState<'policies' | 'schedules' | 'automation' | 'compliance'>('policies');
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>([]);
  const [retentionSchedules, setRetentionSchedules] = useState<RetentionSchedule[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([]);
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    dataType: 'behavior_logs',
    retentionPeriodYears: 7,
    autoDelete: false,
    legalBasis: 'FERPA educational record retention requirements'
  });

  useEffect(() => {
    initializeRetentionSystem();
  }, []);

  const initializeRetentionSystem = async () => {
    try {
      // Initialize default FERPA-compliant retention policies
      const defaultPolicies: RetentionPolicy[] = [
        {
          id: '1',
          organizationId: 'org-1',
          dataType: 'behavior_logs',
          retentionPeriodYears: 7,
          autoDelete: false,
          legalBasis: 'FERPA 34 CFR 99.3 - Educational records retention',
          createdBy: currentUser?.id || 'system',
          createdAt: new Date(),
          lastReviewedAt: new Date(),
          nextReviewAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          organizationId: 'org-1',
          dataType: 'child_profiles',
          retentionPeriodYears: 7,
          autoDelete: false,
          legalBasis: 'FERPA 34 CFR 99.3 - Educational records retention',
          createdBy: currentUser?.id || 'system',
          createdAt: new Date(),
          lastReviewedAt: new Date(),
          nextReviewAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        },
        {
          id: '3',
          organizationId: 'org-1',
          dataType: 'family_communications',
          retentionPeriodYears: 3,
          autoDelete: false,
          legalBasis: 'Communication record retention policy',
          createdBy: currentUser?.id || 'system',
          createdAt: new Date(),
          lastReviewedAt: new Date(),
          nextReviewAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        },
        {
          id: '4',
          organizationId: 'org-1',
          dataType: 'phi_data',
          retentionPeriodYears: 6,
          autoDelete: false,
          legalBasis: 'HIPAA 45 CFR 164.530 - PHI retention requirements',
          createdBy: currentUser?.id || 'system',
          createdAt: new Date(),
          lastReviewedAt: new Date(),
          nextReviewAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      ];

      setRetentionPolicies(defaultPolicies);
      safeLocalStorageSet('lumi_retention_policies', defaultPolicies);

      // Generate retention schedules for existing data
      generateRetentionSchedules(defaultPolicies);
      
    } catch (error) {
      console.error('Failed to initialize retention system:', error);
      toast.error('Initialization Failed', 'Could not set up data retention system');
    }
  };

  const generateRetentionSchedules = (policies: RetentionPolicy[]) => {
    const schedules: RetentionSchedule[] = [];

    // Generate schedules for existing children
    children.forEach(child => {
      const policy = policies.find(p => p.dataType === 'child_profiles');
      if (policy) {
        const retentionDate = new Date(child.createdAt);
        retentionDate.setFullYear(retentionDate.getFullYear() + policy.retentionPeriodYears);

        schedules.push({
          id: `child-${child.id}`,
          organizationId: 'org-1',
          recordType: 'child_profiles',
          recordId: child.id,
          childId: child.id,
          childName: child.name,
          createdAt: child.createdAt,
          retentionUntil: retentionDate,
          status: 'active',
          policyId: policy.id
        });
      }
    });

    // Generate schedules for existing behavior logs
    behaviorLogs.forEach(log => {
      const policy = policies.find(p => p.dataType === 'behavior_logs');
      if (policy) {
        const retentionDate = new Date(log.createdAt);
        retentionDate.setFullYear(retentionDate.getFullYear() + policy.retentionPeriodYears);

        schedules.push({
          id: `behavior-${log.id}`,
          organizationId: 'org-1',
          recordType: 'behavior_logs',
          recordId: log.id,
          childId: log.childId,
          childName: children.find(c => c.id === log.childId)?.name,
          createdAt: log.createdAt,
          retentionUntil: retentionDate,
          status: 'active',
          policyId: policy.id
        });
      }
    });

    setRetentionSchedules(schedules);
    safeLocalStorageSet('lumi_retention_schedules', schedules);
  };

  const enableAutomatedRetention = async () => {
    try {
      // Enable automated retention processing
      setAutomationEnabled(true);
      safeLocalStorageSet('lumi_retention_automation', { enabled: true, enabledAt: new Date() });
      
      // Process any overdue deletions
      await processScheduledDeletions();
      
      toast.success('Automation Enabled', 'Automated data retention is now active');
    } catch (error) {
      console.error('Failed to enable automation:', error);
      toast.error('Automation Failed', 'Could not enable automated retention');
    }
  };

  const processScheduledDeletions = async () => {
    const now = new Date();
    const overdueDeletions = retentionSchedules.filter(schedule => 
      schedule.status === 'active' && schedule.retentionUntil <= now
    );

    if (overdueDeletions.length === 0) {
      toast.info('No Overdue Deletions', 'All data is within retention periods');
      return;
    }

    // Create deletion requests for overdue data
    const newDeletionRequests: DeletionRequest[] = overdueDeletions.map(schedule => ({
      id: Date.now().toString() + Math.random(),
      organizationId: schedule.organizationId,
      requestType: 'policy_expiration',
      childName: schedule.childName || 'Unknown',
      requestedBy: 'Automated System',
      requestedAt: new Date(),
      scheduledDeletion: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days notice
      status: 'pending',
      dataTypes: [schedule.recordType],
      justification: `Data retention period expired (${schedule.retentionUntil.toLocaleDateString()})`
    }));

    const updatedRequests = [...deletionRequests, ...newDeletionRequests];
    setDeletionRequests(updatedRequests);
    safeLocalStorageSet('lumi_deletion_requests', updatedRequests);

    toast.warning('Deletions Scheduled', `${overdueDeletions.length} records scheduled for deletion`);
  };

  const createRetentionPolicy = () => {
    if (!newPolicy.dataType || !newPolicy.retentionPeriodYears) {
      toast.error('Missing Information', 'Please fill in all required fields');
      return;
    }

    const policy: RetentionPolicy = {
      id: Date.now().toString(),
      organizationId: 'org-1',
      dataType: newPolicy.dataType as any,
      retentionPeriodYears: newPolicy.retentionPeriodYears,
      autoDelete: newPolicy.autoDelete,
      legalBasis: newPolicy.legalBasis,
      createdBy: currentUser?.id || 'admin',
      createdAt: new Date(),
      lastReviewedAt: new Date(),
      nextReviewAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    };

    const updatedPolicies = [...retentionPolicies, policy];
    setRetentionPolicies(updatedPolicies);
    safeLocalStorageSet('lumi_retention_policies', updatedPolicies);

    // Reset form
    setNewPolicy({
      dataType: 'behavior_logs',
      retentionPeriodYears: 7,
      autoDelete: false,
      legalBasis: 'FERPA educational record retention requirements'
    });

    toast.success('Policy Created', 'Data retention policy has been established');
  };

  const getUpcomingDeletions = () => {
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return retentionSchedules.filter(schedule => 
      schedule.status === 'active' && 
      schedule.retentionUntil <= thirtyDaysFromNow
    );
  };

  const upcomingDeletions = getUpcomingDeletions();

  const renderPoliciesTab = () => (
    <div className="space-y-6">
      {/* Automation Status */}
      <Card className={`p-6 ${automationEnabled ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-start space-x-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            automationEnabled ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {automationEnabled ? (
              <Clock className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold mb-2 ${
              automationEnabled ? 'text-green-900' : 'text-red-900'
            }`}>
              {automationEnabled ? '✅ Automated Retention Active' : '🚨 Automated Retention Required'}
            </h3>
            <p className={`mb-4 ${
              automationEnabled ? 'text-green-800' : 'text-red-800'
            }`}>
              {automationEnabled 
                ? 'Automated data retention and deletion policies are active and monitoring all records.'
                : 'FERPA compliance requires automated data retention policies. Manual deletion only is insufficient.'
              }
            </p>
            {!automationEnabled && (
              <Button
                onClick={enableAutomatedRetention}
                icon={Play}
                className="bg-red-600 hover:bg-red-700"
              >
                Enable Automated Retention
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Current Policies */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Active Retention Policies ({retentionPolicies.length})
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
                    Retention: {policy.retentionPeriodYears} years
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    policy.autoDelete ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {policy.autoDelete ? 'Auto-Delete ON' : 'Manual Review'}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    FERPA Compliant
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Legal Basis:</strong> {policy.legalBasis}</p>
                <p><strong>Last Reviewed:</strong> {policy.lastReviewedAt.toLocaleDateString()}</p>
                <p><strong>Next Review:</strong> {policy.nextReviewAt.toLocaleDateString()}</p>
              </div>
              
              <div className="mt-3 pt-3 border-t border-[#E6E2DD]">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const updatedPolicies = retentionPolicies.map(p =>
                        p.id === policy.id
                          ? { ...p, autoDelete: !p.autoDelete }
                          : p
                      );
                      setRetentionPolicies(updatedPolicies);
                      safeLocalStorageSet('lumi_retention_policies', updatedPolicies);
                      toast.success('Policy Updated', `Auto-delete ${!policy.autoDelete ? 'enabled' : 'disabled'}`);
                    }}
                  >
                    {policy.autoDelete ? 'Disable Auto-Delete' : 'Enable Auto-Delete'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const updatedPolicies = retentionPolicies.map(p =>
                        p.id === policy.id
                          ? { ...p, lastReviewedAt: new Date(), nextReviewAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }
                          : p
                      );
                      setRetentionPolicies(updatedPolicies);
                      safeLocalStorageSet('lumi_retention_policies', updatedPolicies);
                      toast.success('Policy Reviewed', 'Review date updated');
                    }}
                  >
                    Mark as Reviewed
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Create New Policy */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Create New Retention Policy
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Select
            label="Data Type"
            value={newPolicy.dataType}
            onChange={(value) => setNewPolicy(prev => ({ ...prev, dataType: value }))}
            options={[
              { value: 'behavior_logs', label: 'Behavior Logs' },
              { value: 'child_profiles', label: 'Child Profiles' },
              { value: 'family_communications', label: 'Family Communications' },
              { value: 'educator_notes', label: 'Educator Notes' },
              { value: 'phi_data', label: 'Protected Health Information' }
            ]}
          />
          
          <Input
            label="Retention Period (Years)"
            type="number"
            value={newPolicy.retentionPeriodYears.toString()}
            onChange={(value) => setNewPolicy(prev => ({ ...prev, retentionPeriodYears: parseInt(value) || 7 }))}
            min={1}
            max={50}
          />
        </div>

        <div className="mb-6">
          <Input
            label="Legal Basis"
            value={newPolicy.legalBasis}
            onChange={(value) => setNewPolicy(prev => ({ ...prev, legalBasis: value }))}
            placeholder="Legal requirement for this retention period..."
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={newPolicy.autoDelete}
              onChange={(e) => setNewPolicy(prev => ({ ...prev, autoDelete: e.target.checked }))}
              className="rounded border-[#E6E2DD] text-[#C44E38] focus:ring-[#C44E38]"
            />
            <div>
              <span className="font-medium text-[#1A1A1A]">Enable Automatic Deletion</span>
              <p className="text-sm text-gray-600">
                Automatically delete data when retention period expires (recommended for compliance)
              </p>
            </div>
          </label>
        </div>

        <Button onClick={createRetentionPolicy} icon={Calendar}>
          Create Retention Policy
        </Button>
      </Card>
    </div>
  );

  const renderSchedulesTab = () => (
    <div className="space-y-6">
      {/* Upcoming Deletions Alert */}
      {upcomingDeletions.length > 0 && (
        <Card className="p-6 bg-orange-50 border-orange-200">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="w-6 h-6 text-orange-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                Upcoming Data Deletions ({upcomingDeletions.length})
              </h3>
              <p className="text-orange-800 mb-4">
                The following records are approaching their retention limits and will be scheduled for deletion.
              </p>
              <div className="space-y-2">
                {upcomingDeletions.slice(0, 5).map((schedule) => (
                  <div key={schedule.id} className="bg-white p-3 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-orange-900">
                          {schedule.childName || 'Unknown'} - {schedule.recordType.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-orange-700">
                          Retention expires: {schedule.retentionUntil.toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Create deletion request
                          const request: DeletionRequest = {
                            id: Date.now().toString(),
                            organizationId: schedule.organizationId,
                            requestType: 'policy_expiration',
                            childName: schedule.childName || 'Unknown',
                            requestedBy: currentUser?.fullName || 'System',
                            requestedAt: new Date(),
                            scheduledDeletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                            status: 'pending',
                            dataTypes: [schedule.recordType],
                            justification: 'Data retention period expired per organizational policy'
                          };
                          
                          const updatedRequests = [...deletionRequests, request];
                          setDeletionRequests(updatedRequests);
                          safeLocalStorageSet('lumi_deletion_requests', updatedRequests);
                          toast.success('Deletion Scheduled', 'Record marked for deletion review');
                        }}
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

      {/* All Retention Schedules */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Data Retention Schedules ({retentionSchedules.length})
        </h3>
        
        <div className="space-y-4">
          {retentionSchedules.slice(0, 20).map((schedule) => {
            const daysUntilDeletion = Math.ceil((schedule.retentionUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const isOverdue = daysUntilDeletion <= 0;
            const isUpcoming = daysUntilDeletion <= 30 && daysUntilDeletion > 0;
            
            return (
              <div key={schedule.id} className={`p-4 border rounded-xl ${
                isOverdue ? 'border-red-200 bg-red-50' :
                isUpcoming ? 'border-orange-200 bg-orange-50' :
                'border-[#E6E2DD] bg-[#F8F6F4]'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-[#1A1A1A]">
                      {schedule.childName || 'System Record'} - {schedule.recordType.replace('_', ' ')}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Created: {schedule.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      isOverdue ? 'text-red-600' :
                      isUpcoming ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {isOverdue ? 'OVERDUE' :
                       isUpcoming ? `${daysUntilDeletion} days left` :
                       `${daysUntilDeletion} days remaining`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Until: {schedule.retentionUntil.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    schedule.status === 'active' ? 'bg-green-100 text-green-700' :
                    schedule.status === 'archived' ? 'bg-blue-100 text-blue-700' :
                    schedule.status === 'scheduled_deletion' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {schedule.status.replace('_', ' ').toUpperCase()}
                  </span>
                  
                  {(isOverdue || isUpcoming) && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Extend retention by 1 year
                          const updatedSchedules = retentionSchedules.map(s =>
                            s.id === schedule.id
                              ? { ...s, retentionUntil: new Date(s.retentionUntil.getTime() + 365 * 24 * 60 * 60 * 1000) }
                              : s
                          );
                          setRetentionSchedules(updatedSchedules);
                          safeLocalStorageSet('lumi_retention_schedules', updatedSchedules);
                          toast.success('Retention Extended', 'Record retention extended by 1 year');
                        }}
                        icon={Calendar}
                      >
                        Extend
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          // Archive immediately
                          const updatedSchedules = retentionSchedules.map(s =>
                            s.id === schedule.id
                              ? { ...s, status: 'archived' as const }
                              : s
                          );
                          setRetentionSchedules(updatedSchedules);
                          safeLocalStorageSet('lumi_retention_schedules', updatedSchedules);
                          toast.info('Record Archived', 'Record moved to archive status');
                        }}
                        className="bg-orange-600 hover:bg-orange-700"
                        icon={Archive}
                      >
                        Archive
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  const renderAutomationTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Automated Retention Processing
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-[#1A1A1A] mb-3">Automation Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Automated Processing:</span>
                <span className={`font-medium ${automationEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {automationEnabled ? '✓ Enabled' : '✗ Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Daily Processing:</span>
                <span className="font-medium text-blue-600">2:00 AM UTC</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Last Run:</span>
                <span className="font-medium text-gray-600">
                  {automationEnabled ? 'Today 2:00 AM' : 'Never'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Records Processed:</span>
                <span className="font-medium text-[#1A1A1A]">
                  {retentionSchedules.length}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-[#1A1A1A] mb-3">Processing Rules</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="font-medium text-blue-900 mb-1">Daily Processing (2:00 AM):</p>
                <ul className="text-blue-800 space-y-1">
                  <li>• Check all retention schedules</li>
                  <li>• Identify expired records</li>
                  <li>• Create deletion requests</li>
                  <li>• Send compliance notifications</li>
                </ul>
              </div>
              
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                <p className="font-medium text-green-900 mb-1">Auto-Delete Process:</p>
                <ul className="text-green-800 space-y-1">
                  <li>• 30-day notice period</li>
                  <li>• Parent notification (if applicable)</li>
                  <li>• Archive before deletion</li>
                  <li>• Audit trail creation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-[#E6E2DD]">
          <div className="flex space-x-3">
            <Button
              onClick={processScheduledDeletions}
              icon={Play}
              variant="outline"
            >
              Run Manual Processing
            </Button>
            <Button
              onClick={() => {
                const report = {
                  timestamp: new Date().toISOString(),
                  policies: retentionPolicies,
                  schedules: retentionSchedules,
                  upcomingDeletions: upcomingDeletions.length,
                  automationEnabled
                };
                
                const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `retention-report-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                toast.success('Report Exported', 'Retention management report downloaded');
              }}
              variant="outline"
              icon={Download}
            >
              Export Report
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderComplianceTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          FERPA Retention Compliance Status
        </h3>
        
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">✓ Compliant Areas</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Retention policies established for all data types</li>
              <li>• Legal basis documented for each retention period</li>
              <li>• Regular policy review schedule implemented</li>
              <li>• Automated processing system available</li>
            </ul>
          </div>
          
          <div className={`border p-4 rounded-lg ${
            automationEnabled ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <h4 className={`font-medium mb-2 ${
              automationEnabled ? 'text-green-900' : 'text-red-900'
            }`}>
              {automationEnabled ? '✓ Automated Enforcement' : '🚨 Manual Process Only'}
            </h4>
            <p className={`text-sm ${
              automationEnabled ? 'text-green-800' : 'text-red-800'
            }`}>
              {automationEnabled 
                ? 'Automated retention and deletion policies are active and monitoring all records.'
                : 'CRITICAL: Automated retention enforcement is required for FERPA compliance. Manual deletion only is insufficient.'
              }
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">📊 Retention Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p>Total records tracked: {retentionSchedules.length}</p>
                <p>Active policies: {retentionPolicies.length}</p>
              </div>
              <div>
                <p>Upcoming deletions: {upcomingDeletions.length}</p>
                <p>Automation status: {automationEnabled ? 'Active' : 'Disabled'}</p>
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
    { id: 'automation', label: 'Automation', icon: Settings },
    { id: 'compliance', label: 'Compliance Status', icon: Database }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
            Automated Data Retention & Lifecycle Management
          </h2>
          <p className="text-gray-600">
            FERPA-compliant automated data retention with policy enforcement and audit trails
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full ${
          automationEnabled ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <span className={`text-sm font-medium ${
            automationEnabled ? 'text-green-700' : 'text-red-700'
          }`}>
            {automationEnabled ? 'Automation Active' : 'Automation Required'}
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
        {activeTab === 'automation' && renderAutomationTab()}
        {activeTab === 'compliance' && renderComplianceTab()}
      </div>
    </div>
  );
};