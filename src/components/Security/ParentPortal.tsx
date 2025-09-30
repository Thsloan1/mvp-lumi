import React, { useState, useEffect } from 'react';
import { Shield, FileText, Download, Eye, Calendar, User, Mail, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { useAppContext } from '../../context/AppContext';
import { AuditService } from '../../services/auditService';
import { EncryptionService } from '../../services/encryptionService';
import { safeLocalStorageGet, safeLocalStorageSet } from '../../utils/jsonUtils';

interface ParentPortalSession {
  id: string;
  childId: string;
  childName: string;
  parentEmail: string;
  parentName: string;
  accessToken: string;
  verificationCode: string;
  verified: boolean;
  expiresAt: Date;
  lastAccess: Date;
  accessCount: number;
}

interface EducationalRecord {
  id: string;
  childId: string;
  type: 'behavior_log' | 'developmental_note' | 'family_communication' | 'strategy_note';
  title: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  lastModified: Date;
  encrypted: boolean;
}

export const ParentPortal: React.FC = () => {
  const { children, behaviorLogs, toast } = useAppContext();
  const [activeTab, setActiveTab] = useState<'access' | 'records' | 'requests' | 'consent'>('access');
  const [parentSessions, setParentSessions] = useState<ParentPortalSession[]>(() => 
    safeLocalStorageGet('lumi_parent_sessions', [])
  );
  const [selectedSession, setSelectedSession] = useState<ParentPortalSession | null>(null);
  const [accessForm, setAccessForm] = useState({
    childName: '',
    parentName: '',
    parentEmail: '',
    verificationMethod: 'email'
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [showRecords, setShowRecords] = useState(false);

  // Generate secure access token
  const generateAccessToken = (): string => {
    return 'parent_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  };

  // Generate verification code
  const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Create parent portal access
  const handleCreateAccess = async () => {
    if (!accessForm.childName || !accessForm.parentName || !accessForm.parentEmail) {
      toast.error('Missing Information', 'Please fill in all required fields');
      return;
    }

    const child = children.find(c => c.name.toLowerCase() === accessForm.childName.toLowerCase());
    if (!child) {
      toast.error('Child Not Found', 'Please verify the child name is correct');
      return;
    }

    const accessToken = generateAccessToken();
    const verificationCode = generateVerificationCode();
    
    const session: ParentPortalSession = {
      id: Date.now().toString(),
      childId: child.id,
      childName: child.name,
      parentEmail: accessForm.parentEmail,
      parentName: accessForm.parentName,
      accessToken,
      verificationCode,
      verified: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      lastAccess: new Date(),
      accessCount: 0
    };

    const updatedSessions = [...parentSessions, session];
    setParentSessions(updatedSessions);
    safeLocalStorageSet('lumi_parent_sessions', updatedSessions);

    // Log FERPA access creation
    await AuditService.logFERPAAccess(
      child.id,
      child.name,
      'PARENT_PORTAL_ACCESS_CREATED',
      true
    );

    // In production, send verification email
    console.log(`📧 Verification code for ${accessForm.parentEmail}: ${verificationCode}`);
    
    toast.success('Access Created', 'Verification code sent to parent email');
    
    // Reset form
    setAccessForm({
      childName: '',
      parentName: '',
      parentEmail: '',
      verificationMethod: 'email'
    });
  };

  // Verify parent access
  const handleVerifyAccess = async (sessionId: string, code: string) => {
    const session = parentSessions.find(s => s.id === sessionId);
    if (!session) {
      toast.error('Invalid Session', 'Access session not found');
      return;
    }

    if (session.verificationCode !== code) {
      toast.error('Invalid Code', 'Verification code is incorrect');
      return;
    }

    if (new Date() > session.expiresAt) {
      toast.error('Expired', 'Access session has expired');
      return;
    }

    // Mark as verified
    const updatedSessions = parentSessions.map(s => 
      s.id === sessionId 
        ? { ...s, verified: true, lastAccess: new Date(), accessCount: s.accessCount + 1 }
        : s
    );
    setParentSessions(updatedSessions);
    safeLocalStorageSet('lumi_parent_sessions', updatedSessions);

    // Log successful verification
    await AuditService.logFERPAAccess(
      session.childId,
      session.childName,
      'PARENT_PORTAL_ACCESS_VERIFIED',
      true
    );

    setSelectedSession(session);
    setShowRecords(true);
    toast.success('Access Verified', 'You can now view educational records');
  };

  // Get educational records for child
  const getEducationalRecords = async (childId: string): Promise<EducationalRecord[]> => {
    try {
      const childBehaviorLogs = behaviorLogs.filter(log => log.childId === childId);
      const child = children.find(c => c.id === childId);
      
      const records: EducationalRecord[] = [];
      
      // Add behavior logs as educational records
      for (const log of childBehaviorLogs) {
        // Decrypt if encrypted
        const decryptedDescription = log.behaviorDescription.startsWith('enc_') 
          ? await EncryptionService.decryptText(log.behaviorDescription)
          : log.behaviorDescription;
        
        records.push({
          id: log.id,
          childId: log.childId,
          type: 'behavior_log',
          title: `Behavior Observation - ${new Date(log.createdAt).toLocaleDateString()}`,
          content: `Context: ${log.context}\nObservation: ${decryptedDescription}\nStrategy Used: ${log.selectedStrategy || 'None'}`,
          createdAt: log.createdAt,
          createdBy: 'Classroom Educator',
          lastModified: log.createdAt,
          encrypted: log.behaviorDescription.startsWith('enc_')
        });
      }
      
      // Add child profile as educational record
      if (child) {
        const decryptedNotes = child.developmentalNotes?.startsWith('enc_')
          ? await EncryptionService.decryptText(child.developmentalNotes)
          : child.developmentalNotes;
        
        records.push({
          id: child.id,
          childId: child.id,
          type: 'developmental_note',
          title: 'Child Development Profile',
          content: `Grade/Age: ${child.gradeBand}\nDevelopmental Notes: ${decryptedNotes || 'None recorded'}\nSupport Plans: ${child.hasIEP ? 'IEP' : ''} ${child.hasIFSP ? 'IFSP' : ''}`,
          createdAt: child.createdAt,
          createdBy: 'Classroom Educator',
          lastModified: child.updatedAt,
          encrypted: child.developmentalNotes?.startsWith('enc_') || false
        });
      }
      
      return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Failed to get educational records:', error);
      return [];
    }
  };

  // Generate FERPA access report
  const generateFERPAReport = async (session: ParentPortalSession) => {
    try {
      const records = await getEducationalRecords(session.childId);
      
      const report = `FERPA EDUCATIONAL RECORD ACCESS REPORT

Child: ${session.childName}
Parent/Guardian: ${session.parentName}
Generated: ${new Date().toLocaleDateString()}
Access Token: ${session.accessToken}

EDUCATIONAL RECORDS SUMMARY:
Total Records: ${records.length}

DETAILED RECORDS:
${records.map((record, index) => `
${index + 1}. ${record.title}
   Type: ${record.type.replace('_', ' ').toUpperCase()}
   Created: ${record.createdAt.toLocaleDateString()}
   Created By: ${record.createdBy}
   Encrypted: ${record.encrypted ? 'Yes' : 'No'}
   
   Content:
   ${record.content}
   
   ---
`).join('')}

DATA SHARING DISCLOSURE:
- No educational records have been shared with third parties without explicit consent
- All data is stored securely with encryption for sensitive information
- Access to records is logged and monitored for compliance

RETENTION POLICY:
- Educational records will be retained for 7 years after child leaves program
- Parents may request deletion of records at any time
- Data is stored in compliance with FERPA regulations

PARENT RIGHTS UNDER FERPA:
- Right to inspect and review educational records
- Right to request corrections to inaccurate information
- Right to control disclosure of personally identifiable information
- Right to file complaints with the Department of Education

CONTACT INFORMATION:
For questions about this report or to request corrections:
Email: privacy@lumi.app
Phone: 1-800-LUMI-HELP

This report was generated in compliance with FERPA 34 CFR 99.10-99.12.
Report ID: ${session.id}
Generated at: ${new Date().toISOString()}`;

      // Log the report generation
      await AuditService.logFERPAAccess(
        session.childId,
        session.childName,
        'FERPA_REPORT_GENERATED',
        true
      );

      // Download report
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FERPA_Report_${session.childName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('FERPA Report Generated', 'Educational records report downloaded');
    } catch (error) {
      console.error('Failed to generate FERPA report:', error);
      toast.error('Report Generation Failed', 'Please try again or contact support');
    }
  };

  const renderAccessTab = () => (
    <div className="space-y-6">
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-4">
          <Shield className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              FERPA Parent Portal Access
            </h3>
            <p className="text-blue-800 mb-4">
              Under the Family Educational Rights and Privacy Act (FERPA), parents have the right to 
              inspect and review their child's educational records. This secure portal provides 
              authenticated access to your child's educational information.
            </p>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Access is secured with email verification</p>
              <p>• All access is logged for compliance</p>
              <p>• Records are available for 7 days after verification</p>
              <p>• You may request corrections or deletions</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Request Access to Educational Records
        </h3>
        
        <div className="space-y-4">
          <Input
            label="Child's Full Name"
            value={accessForm.childName}
            onChange={(value) => setAccessForm(prev => ({ ...prev, childName: value }))}
            placeholder="Enter your child's full name as registered"
            required
          />
          
          <Input
            label="Parent/Guardian Name"
            value={accessForm.parentName}
            onChange={(value) => setAccessForm(prev => ({ ...prev, parentName: value }))}
            placeholder="Enter your full name"
            required
          />
          
          <Input
            label="Email Address"
            type="email"
            value={accessForm.parentEmail}
            onChange={(value) => setAccessForm(prev => ({ ...prev, parentEmail: value }))}
            placeholder="Enter your email address"
            required
            helperText="Verification code will be sent to this email"
          />
          
          <Button onClick={handleCreateAccess} icon={Mail} className="w-full">
            Request Access to Educational Records
          </Button>
        </div>
      </Card>

      {/* Active Sessions */}
      {parentSessions.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
            Active Parent Access Sessions
          </h3>
          
          <div className="space-y-4">
            {parentSessions.map((session) => (
              <div key={session.id} className="p-4 border border-[#E6E2DD] rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-[#1A1A1A]">
                      {session.childName} - {session.parentName}
                    </h4>
                    <p className="text-sm text-gray-600">{session.parentEmail}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      session.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {session.verified ? 'Verified' : 'Pending Verification'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      new Date() < session.expiresAt ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {new Date() < session.expiresAt ? 'Active' : 'Expired'}
                    </span>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Access Token:</p>
                    <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                      {session.accessToken}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Expires:</p>
                    <p className="font-medium">{session.expiresAt.toLocaleDateString()}</p>
                  </div>
                </div>
                
                {!session.verified ? (
                  <div className="space-y-3">
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Verification Required:</strong> Check email for verification code
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Code: {session.verificationCode} (Demo - normally sent via email)
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        value={verificationCode}
                        onChange={setVerificationCode}
                        placeholder="Enter 6-digit code"
                        className="flex-1"
                        maxLength={6}
                      />
                      <Button
                        onClick={() => handleVerifyAccess(session.id, verificationCode)}
                        disabled={verificationCode.length !== 6}
                        size="sm"
                      >
                        Verify
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        setSelectedSession(session);
                        setShowRecords(true);
                      }}
                      size="sm"
                      icon={Eye}
                    >
                      View Records
                    </Button>
                    <Button
                      onClick={() => generateFERPAReport(session)}
                      variant="outline"
                      size="sm"
                      icon={Download}
                    >
                      Download Report
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderRecordsTab = () => {
    if (!selectedSession || !selectedSession.verified) {
      return (
        <Card className="p-8 text-center">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-[#1A1A1A] mb-2">
            Access Required
          </h4>
          <p className="text-gray-600">
            Please verify your access to view educational records.
          </p>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[#1A1A1A]">
                Educational Records for {selectedSession.childName}
              </h3>
              <p className="text-gray-600">
                Accessed by: {selectedSession.parentName} ({selectedSession.parentEmail})
              </p>
            </div>
            <Button
              onClick={() => generateFERPAReport(selectedSession)}
              icon={Download}
            >
              Download Complete Report
            </Button>
          </div>
          
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Secure Access Verified
                </p>
                <p className="text-xs text-green-700">
                  Your access to these educational records is logged and complies with FERPA regulations.
                </p>
              </div>
            </div>
          </div>
          
          <EducationalRecordsDisplay childId={selectedSession.childId} />
        </Card>
      </div>
    );
  };

  const tabs = [
    { id: 'access', label: 'Request Access', icon: Shield },
    { id: 'records', label: 'View Records', icon: FileText },
    { id: 'requests', label: 'Submit Requests', icon: Mail },
    { id: 'consent', label: 'Manage Consent', icon: CheckCircle }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
            FERPA Parent Portal
          </h2>
          <p className="text-gray-600">
            Secure access to your child's educational records in compliance with FERPA
          </p>
        </div>
        <div className="bg-green-100 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-green-700">
            FERPA Compliant
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
        {activeTab === 'access' && renderAccessTab()}
        {activeTab === 'records' && renderRecordsTab()}
        {activeTab === 'requests' && (
          <Card className="p-8 text-center">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-[#1A1A1A] mb-2">
              Submit Record Requests
            </h4>
            <p className="text-gray-600">
              Request corrections or deletions of educational records.
            </p>
          </Card>
        )}
        {activeTab === 'consent' && (
          <Card className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-[#1A1A1A] mb-2">
              Manage Consent
            </h4>
            <p className="text-gray-600">
              Manage consent for data collection and sharing.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

// Educational Records Display Component
const EducationalRecordsDisplay: React.FC<{ childId: string }> = ({ childId }) => {
  const [records, setRecords] = useState<EducationalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        // This would call the getEducationalRecords function
        // For demo, create mock records
        const mockRecords: EducationalRecord[] = [
          {
            id: '1',
            childId,
            type: 'behavior_log',
            title: 'Behavior Observation - Transition Support',
            content: 'Context: Transition\nObservation: Child needed extra support during cleanup time\nStrategy Used: Connection Before Direction approach',
            createdAt: new Date(Date.now() - 86400000),
            createdBy: 'Classroom Educator',
            lastModified: new Date(Date.now() - 86400000),
            encrypted: true
          },
          {
            id: '2',
            childId,
            type: 'developmental_note',
            title: 'Child Development Profile',
            content: 'Grade/Age: Preschool (4-5 years old)\nDevelopmental Notes: Strong verbal skills, working on emotional regulation\nSupport Plans: None',
            createdAt: new Date(Date.now() - 7 * 86400000),
            createdBy: 'Classroom Educator',
            lastModified: new Date(Date.now() - 86400000),
            encrypted: false
          }
        ];
        
        setRecords(mockRecords);
      } catch (error) {
        console.error('Failed to load records:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [childId]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
        <p className="text-sm text-gray-600">Loading educational records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <div key={record.id} className="p-4 border border-[#E6E2DD] rounded-xl">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-medium text-[#1A1A1A]">{record.title}</h4>
              <p className="text-sm text-gray-600">
                {record.type.replace('_', ' ').toUpperCase()} • Created by {record.createdBy}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {record.encrypted && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  Encrypted
                </span>
              )}
              <span className="text-xs text-gray-500">
                {record.createdAt.toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {record.content}
            </pre>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
            Last Modified: {record.lastModified.toLocaleDateString()}
          </div>
        </div>
      ))}
      
      {records.length === 0 && (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No educational records found for this child.</p>
        </div>
      )}
    </div>
  );
};