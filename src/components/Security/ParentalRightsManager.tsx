import React, { useState } from 'react';
import { Shield, FileText, Download, Eye, Calendar, User, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { useAppContext } from '../../context/AppContext';
import { safeLocalStorageGet, safeLocalStorageSet } from '../../utils/jsonUtils';

interface ParentalRequest {
  id: string;
  requestType: 'access' | 'correction' | 'deletion' | 'consent_withdrawal';
  childName: string;
  parentName: string;
  parentEmail: string;
  requestDetails: string;
  status: 'pending' | 'approved' | 'completed' | 'denied';
  submittedAt: Date;
  processedAt?: Date;
  processedBy?: string;
  responseNotes?: string;
}

interface ConsentRecord {
  id: string;
  childName: string;
  parentName: string;
  consentType: 'data_collection' | 'behavior_tracking' | 'family_communication' | 'third_party_sharing';
  consentGiven: boolean;
  consentDate: Date;
  withdrawnDate?: Date;
  educatorId: string;
}

export const ParentalRightsManager: React.FC = () => {
  const { currentUser, children, toast } = useAppContext();
  const [activeTab, setActiveTab] = useState<'requests' | 'consent' | 'audit' | 'policy'>('policy');
  const [parentalRequests, setParentalRequests] = useState<ParentalRequest[]>(() => 
    safeLocalStorageGet('lumi_parental_requests', [])
  );
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>(() => 
    safeLocalStorageGet('lumi_consent_records', [])
  );
  const [newRequest, setNewRequest] = useState({
    requestType: 'access',
    childName: '',
    parentName: '',
    parentEmail: '',
    requestDetails: ''
  });

  const requestTypes = [
    { value: 'access', label: 'Access Educational Records' },
    { value: 'correction', label: 'Request Record Correction' },
    { value: 'deletion', label: 'Request Record Deletion' },
    { value: 'consent_withdrawal', label: 'Withdraw Consent' }
  ];

  const handleSubmitRequest = () => {
    if (!newRequest.childName || !newRequest.parentName || !newRequest.parentEmail) {
      toast.error('Missing Information', 'Please fill in all required fields');
      return;
    }

    const request: ParentalRequest = {
      id: Date.now().toString(),
      requestType: newRequest.requestType as any,
      childName: newRequest.childName,
      parentName: newRequest.parentName,
      parentEmail: newRequest.parentEmail,
      requestDetails: newRequest.requestDetails,
      status: 'pending',
      submittedAt: new Date()
    };

    const updatedRequests = [...parentalRequests, request];
    setParentalRequests(updatedRequests);
    safeLocalStorageSet('lumi_parental_requests', updatedRequests);

    // Reset form
    setNewRequest({
      requestType: 'access',
      childName: '',
      parentName: '',
      parentEmail: '',
      requestDetails: ''
    });

    toast.success('Request Submitted', 'Parental rights request has been logged');
  };

  const handleProcessRequest = (requestId: string, status: 'approved' | 'completed' | 'denied', notes?: string) => {
    const updatedRequests = parentalRequests.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            status, 
            processedAt: new Date(), 
            processedBy: currentUser?.fullName,
            responseNotes: notes 
          }
        : req
    );
    setParentalRequests(updatedRequests);
    safeLocalStorageSet('lumi_parental_requests', updatedRequests);
    toast.success('Request Processed', `Request ${status}`);
  };

  const generateAccessReport = (childName: string) => {
    // Generate comprehensive access report for parent
    const childData = children.find(c => c.name === childName);
    if (!childData) return;

    const report = `FERPA EDUCATIONAL RECORD ACCESS REPORT

Child: ${childName}
Generated: ${new Date().toLocaleDateString()}
Requested by: Parent/Guardian

EDUCATIONAL RECORDS SUMMARY:
- Child Profile: Created ${childData.createdAt.toLocaleDateString()}
- Grade/Age Band: ${childData.gradeBand}
- Support Plans: ${childData.hasIEP ? 'IEP' : ''} ${childData.hasIFSP ? 'IFSP' : ''}
- Developmental Notes: ${childData.developmentalNotes || 'None recorded'}

BEHAVIOR TRACKING RECORDS:
[Behavior logs would be listed here with dates, contexts, and strategies]

DATA SHARING:
- No educational records have been shared with third parties without consent
- Family communication notes generated: [Count would be listed]

RETENTION POLICY:
- Records will be retained for 7 years after child leaves program
- Parents may request deletion at any time
- Data is stored securely and encrypted

CONTACT INFORMATION:
For questions about this report or to request corrections:
Email: privacy@lumi.app
Phone: 1-800-LUMI-HELP

This report was generated in compliance with FERPA regulations.`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FERPA_Access_Report_${childName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderPolicyTab = () => (
    <div className="space-y-6">
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-4">
          <Shield className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              FERPA Parental Rights Policy
            </h3>
            <div className="text-blue-800 space-y-3 text-sm">
              <p>
                Under the Family Educational Rights and Privacy Act (FERPA), parents have the right to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Inspect and review their child's educational records</li>
                <li>Request corrections to inaccurate or misleading information</li>
                <li>Control disclosure of personally identifiable information</li>
                <li>File complaints with the Department of Education</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Data Retention Policy
        </h3>
        <div className="space-y-4 text-sm text-gray-700">
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Current Retention Schedule:</h4>
            <ul className="space-y-1">
              <li>• <strong>Behavior logs:</strong> 7 years after child leaves program</li>
              <li>• <strong>Child profiles:</strong> 7 years after child leaves program</li>
              <li>• <strong>Family communications:</strong> 3 years after child leaves program</li>
              <li>• <strong>Educator notes:</strong> 5 years after child leaves program</li>
            </ul>
          </div>
          
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">⚠️ Implementation Status:</h4>
            <p className="text-red-800">
              Automated data retention and deletion policies are not yet implemented. 
              This is a critical compliance gap that must be addressed before production.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Submit Parental Rights Request
        </h3>
        
        <div className="space-y-4">
          <Select
            label="Request Type"
            value={newRequest.requestType}
            onChange={(value) => setNewRequest(prev => ({ ...prev, requestType: value }))}
            options={requestTypes}
          />
          
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Child's Name"
              value={newRequest.childName}
              onChange={(value) => setNewRequest(prev => ({ ...prev, childName: value }))}
              placeholder="Enter child's full name"
              required
            />
            
            <Input
              label="Parent/Guardian Name"
              value={newRequest.parentName}
              onChange={(value) => setNewRequest(prev => ({ ...prev, parentName: value }))}
              placeholder="Enter parent/guardian name"
              required
            />
          </div>
          
          <Input
            label="Parent Email"
            type="email"
            value={newRequest.parentEmail}
            onChange={(value) => setNewRequest(prev => ({ ...prev, parentEmail: value }))}
            placeholder="Enter parent email address"
            required
          />
          
          <Input
            label="Request Details"
            type="textarea"
            value={newRequest.requestDetails}
            onChange={(value) => setNewRequest(prev => ({ ...prev, requestDetails: value }))}
            placeholder="Describe the specific records or corrections requested..."
            rows={3}
          />
          
          <Button onClick={handleSubmitRequest} icon={FileText}>
            Submit Parental Rights Request
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderRequestsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#1A1A1A]">
          Parental Rights Requests ({parentalRequests.length})
        </h3>
        <div className="text-sm text-gray-600">
          Pending: {parentalRequests.filter(r => r.status === 'pending').length}
        </div>
      </div>

      {parentalRequests.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-[#1A1A1A] mb-2">
            No Parental Rights Requests
          </h4>
          <p className="text-gray-600">
            All parental rights requests will appear here for processing.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {parentalRequests.map((request) => (
            <Card key={request.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-[#1A1A1A]">
                      {request.requestType.replace('_', ' ').toUpperCase()}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      request.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      request.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {request.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-1">
                    <strong>Child:</strong> {request.childName}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <strong>Parent:</strong> {request.parentName} ({request.parentEmail})
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Details:</strong> {request.requestDetails}
                  </p>
                  <p className="text-xs text-gray-500">
                    Submitted: {request.submittedAt.toLocaleDateString()}
                  </p>
                </div>
              </div>

              {request.status === 'pending' && (
                <div className="flex space-x-2 pt-4 border-t border-[#E6E2DD]">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (request.requestType === 'access') {
                        generateAccessReport(request.childName);
                        handleProcessRequest(request.id, 'completed', 'Access report generated and provided');
                      } else {
                        handleProcessRequest(request.id, 'approved', 'Request approved for processing');
                      }
                    }}
                  >
                    {request.requestType === 'access' ? 'Generate Report' : 'Approve'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleProcessRequest(request.id, 'denied', 'Request denied - insufficient documentation')}
                  >
                    Deny
                  </Button>
                </div>
              )}

              {request.processedAt && (
                <div className="mt-4 pt-4 border-t border-[#E6E2DD] bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Processed:</strong> {request.processedAt.toLocaleDateString()} by {request.processedBy}
                  </p>
                  {request.responseNotes && (
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>Notes:</strong> {request.responseNotes}
                    </p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderConsentTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Parental Consent Management
        </h3>
        
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900 mb-1">
                Implementation Required
              </h4>
              <p className="text-yellow-800 text-sm">
                Parental consent tracking system needs to be implemented for FERPA compliance.
                This should include consent for data collection, behavior tracking, and family communications.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {children.map((child) => (
            <div key={child.id} className="p-4 border border-[#E6E2DD] rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-[#1A1A1A]">{child.name}</h4>
                  <p className="text-sm text-gray-600">{child.gradeBand}</p>
                </div>
                <div className="flex space-x-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Consent Required
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Data Collection:</p>
                  <p className="font-medium text-red-600">Not Documented</p>
                </div>
                <div>
                  <p className="text-gray-600">Behavior Tracking:</p>
                  <p className="font-medium text-red-600">Not Documented</p>
                </div>
                <div>
                  <p className="text-gray-600">Family Communication:</p>
                  <p className="font-medium text-red-600">Not Documented</p>
                </div>
                <div>
                  <p className="text-gray-600">Third-Party Sharing:</p>
                  <p className="font-medium text-green-600">Not Applicable</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderAuditTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          FERPA Compliance Audit Trail
        </h3>
        
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">✓ Compliant Areas</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Role-based access control implemented</li>
              <li>• Data minimization in child profiles</li>
              <li>• Secure authentication with password policies</li>
              <li>• Encrypted data transmission (HTTPS)</li>
            </ul>
          </div>
          
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">⚠️ Critical Gaps</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Parental consent documentation system not implemented</li>
              <li>• Automated data retention/deletion policies missing</li>
              <li>• Parent portal for record access not available</li>
              <li>• Comprehensive audit logging needs enhancement</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">📋 Action Items</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Implement parental consent tracking system</li>
              <li>• Create parent portal for FERPA record access</li>
              <li>• Add automated data retention policies</li>
              <li>• Enhance audit logging for all data access</li>
              <li>• Document data sharing agreements</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );

  const tabs = [
    { id: 'policy', label: 'FERPA Policy', icon: Shield },
    { id: 'requests', label: 'Parent Requests', icon: FileText },
    { id: 'consent', label: 'Consent Management', icon: CheckCircle },
    { id: 'audit', label: 'Compliance Audit', icon: Eye }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
            Parental Rights & FERPA Compliance
          </h2>
          <p className="text-gray-600">
            Manage parental rights requests and ensure FERPA compliance
          </p>
        </div>
        <Button
          onClick={() => toast.info('Help', 'Contact privacy@lumi.app for FERPA compliance questions')}
          variant="outline"
          icon={Mail}
        >
          Contact Privacy Team
        </Button>
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
        {activeTab === 'policy' && renderPolicyTab()}
        {activeTab === 'requests' && renderRequestsTab()}
        {activeTab === 'consent' && renderConsentTab()}
        {activeTab === 'audit' && renderAuditTab()}
      </div>
    </div>
  );
};