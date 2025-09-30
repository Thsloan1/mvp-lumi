import React, { useState } from 'react';
import { Shield, Building, AlertTriangle, CheckCircle, Calendar, FileText, Download, Plus, Edit, Save, X } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { useAppContext } from '../../context/AppContext';
import { safeLocalStorageGet, safeLocalStorageSet } from '../../utils/jsonUtils';

interface BusinessAssociate {
  id: string;
  organizationId: string;
  vendorName: string;
  vendorType: 'cloud_provider' | 'analytics' | 'payment_processor' | 'email_service' | 'monitoring' | 'other';
  serviceDescription: string;
  baaStatus: 'pending' | 'signed' | 'expired' | 'terminated';
  baaSignedDate?: Date;
  baaExpirationDate?: Date;
  phiAccessLevel: 'none' | 'limited' | 'full';
  dataTypesAccessed: string[];
  complianceStatus: 'compliant' | 'non_compliant' | 'under_review';
  lastAuditDate?: Date;
  nextAuditDate?: Date;
  riskAssessment: 'low' | 'medium' | 'high' | 'critical';
  contactEmail: string;
  contractUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const BusinessAssociateManager: React.FC = () => {
  const { currentUser, toast } = useAppContext();
  const [businessAssociates, setBusinessAssociates] = useState<BusinessAssociate[]>(() => 
    safeLocalStorageGet('lumi_business_associates', [])
  );
  const [editingBA, setEditingBA] = useState<string | null>(null);
  const [showNewBAForm, setShowNewBAForm] = useState(false);
  const [newBA, setNewBA] = useState({
    vendorName: '',
    vendorType: 'cloud_provider',
    serviceDescription: '',
    phiAccessLevel: 'none',
    dataTypesAccessed: [] as string[],
    contactEmail: '',
    riskAssessment: 'medium'
  });

  // Initialize with critical vendors that need BAAs
  React.useEffect(() => {
    if (businessAssociates.length === 0) {
      const criticalVendors: BusinessAssociate[] = [
        {
          id: '1',
          organizationId: 'org-1',
          vendorName: 'Supabase (Database Provider)',
          vendorType: 'cloud_provider',
          serviceDescription: 'Database hosting and management for educational records',
          baaStatus: 'pending',
          phiAccessLevel: 'full',
          dataTypesAccessed: ['behavior_logs', 'child_profiles', 'phi_data'],
          complianceStatus: 'non_compliant',
          riskAssessment: 'critical',
          contactEmail: 'legal@supabase.com',
          notes: 'CRITICAL: BAA required before production launch',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          organizationId: 'org-1',
          vendorName: 'Vercel (Hosting Provider)',
          vendorType: 'cloud_provider',
          serviceDescription: 'Web application hosting and CDN services',
          baaStatus: 'pending',
          phiAccessLevel: 'limited',
          dataTypesAccessed: ['application_logs', 'user_sessions'],
          complianceStatus: 'non_compliant',
          riskAssessment: 'high',
          contactEmail: 'legal@vercel.com',
          notes: 'BAA needed for any PHI in application logs',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          organizationId: 'org-1',
          vendorName: 'Stripe (Payment Processor)',
          vendorType: 'payment_processor',
          serviceDescription: 'Payment processing for subscriptions',
          baaStatus: 'signed',
          baaSignedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          baaExpirationDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
          phiAccessLevel: 'none',
          dataTypesAccessed: ['billing_information'],
          complianceStatus: 'compliant',
          riskAssessment: 'low',
          contactEmail: 'privacy@stripe.com',
          lastAuditDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          nextAuditDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
          notes: 'BAA in place, no PHI access',
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: '4',
          organizationId: 'org-1',
          vendorName: 'Resend (Email Service)',
          vendorType: 'email_service',
          serviceDescription: 'Transactional email delivery for notifications',
          baaStatus: 'pending',
          phiAccessLevel: 'limited',
          dataTypesAccessed: ['email_communications', 'user_notifications'],
          complianceStatus: 'under_review',
          riskAssessment: 'medium',
          contactEmail: 'support@resend.com',
          notes: 'Review needed for family communication emails',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      setBusinessAssociates(criticalVendors);
      safeLocalStorageSet('lumi_business_associates', criticalVendors);
    }
  }, [businessAssociates.length]);

  const vendorTypes = [
    { value: 'cloud_provider', label: 'Cloud Provider' },
    { value: 'analytics', label: 'Analytics Service' },
    { value: 'payment_processor', label: 'Payment Processor' },
    { value: 'email_service', label: 'Email Service' },
    { value: 'monitoring', label: 'Monitoring/Logging' },
    { value: 'other', label: 'Other' }
  ];

  const phiAccessLevels = [
    { value: 'none', label: 'No PHI Access' },
    { value: 'limited', label: 'Limited PHI Access' },
    { value: 'full', label: 'Full PHI Access' }
  ];

  const riskLevels = [
    { value: 'low', label: 'Low Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'high', label: 'High Risk' },
    { value: 'critical', label: 'Critical Risk' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed':
      case 'compliant':
        return 'text-green-600';
      case 'pending':
      case 'under_review':
        return 'text-yellow-600';
      case 'expired':
      case 'non_compliant':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleCreateBA = () => {
    if (!newBA.vendorName || !newBA.serviceDescription || !newBA.contactEmail) {
      toast.error('Missing Information', 'Please fill in all required fields');
      return;
    }

    const businessAssociate: BusinessAssociate = {
      id: Date.now().toString(),
      organizationId: 'org-1',
      vendorName: newBA.vendorName,
      vendorType: newBA.vendorType as any,
      serviceDescription: newBA.serviceDescription,
      baaStatus: 'pending',
      phiAccessLevel: newBA.phiAccessLevel as any,
      dataTypesAccessed: newBA.dataTypesAccessed,
      complianceStatus: 'under_review',
      riskAssessment: newBA.riskAssessment as any,
      contactEmail: newBA.contactEmail,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedBAs = [...businessAssociates, businessAssociate];
    setBusinessAssociates(updatedBAs);
    safeLocalStorageSet('lumi_business_associates', updatedBAs);

    // Reset form
    setNewBA({
      vendorName: '',
      vendorType: 'cloud_provider',
      serviceDescription: '',
      phiAccessLevel: 'none',
      dataTypesAccessed: [],
      contactEmail: '',
      riskAssessment: 'medium'
    });
    setShowNewBAForm(false);

    toast.success('Business Associate Added', 'Vendor added to BAA tracking system');
  };

  const handleSignBAA = (baId: string) => {
    const updatedBAs = businessAssociates.map(ba =>
      ba.id === baId
        ? {
            ...ba,
            baaStatus: 'signed' as const,
            baaSignedDate: new Date(),
            baaExpirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            complianceStatus: 'compliant' as const,
            lastAuditDate: new Date(),
            nextAuditDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
          }
        : ba
    );
    setBusinessAssociates(updatedBAs);
    safeLocalStorageSet('lumi_business_associates', updatedBAs);
    toast.success('BAA Signed', 'Business Associate Agreement executed');
  };

  const generateBAATemplate = (ba: BusinessAssociate) => {
    const template = `BUSINESS ASSOCIATE AGREEMENT
HIPAA Compliance for Protected Health Information

Covered Entity: [Organization Name]
Business Associate: ${ba.vendorName}
Service Description: ${ba.serviceDescription}

HIPAA COMPLIANCE REQUIREMENTS:

1. PERMITTED USES AND DISCLOSURES
Business Associate may use and disclose Protected Health Information (PHI) only as necessary to perform the services outlined in this agreement.

2. SAFEGUARDS
Business Associate shall implement appropriate safeguards to prevent use or disclosure of PHI other than as provided for by this Agreement.

3. REPORTING
Business Associate shall report to Covered Entity any use or disclosure of PHI not provided for by this Agreement within 24 hours of discovery.

4. SUBCONTRACTORS
Business Associate shall ensure that any subcontractors that create, receive, maintain, or transmit PHI agree to the same restrictions and conditions.

5. ACCESS TO PHI
Business Associate shall provide access to PHI to the individual who is the subject of the information as directed by Covered Entity.

6. AMENDMENT
Business Associate shall make any amendment(s) to PHI as directed by Covered Entity.

7. MINIMUM NECESSARY
Business Associate shall limit uses and disclosures to the minimum necessary to accomplish the intended purpose.

8. RETURN OR DESTRUCTION
Upon termination of this Agreement, Business Associate shall return or destroy all PHI received from Covered Entity.

PHI Access Level: ${ba.phiAccessLevel.toUpperCase()}
Data Types Accessed: ${ba.dataTypesAccessed.join(', ')}
Risk Assessment: ${ba.riskAssessment.toUpperCase()}

Contact Information:
Business Associate: ${ba.contactEmail}
Covered Entity: privacy@lumi.app

This agreement shall remain in effect until terminated by either party with 30 days written notice.

Generated: ${new Date().toLocaleDateString()}
Agreement ID: ${ba.id}`;

    const blob = new Blob([template], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BAA_${ba.vendorName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('BAA Template Generated', 'Business Associate Agreement template downloaded');
  };

  const criticalBAs = businessAssociates.filter(ba => 
    ba.riskAssessment === 'critical' && ba.baaStatus !== 'signed'
  );

  const expiringBAs = businessAssociates.filter(ba => 
    ba.baaExpirationDate && 
    ba.baaExpirationDate.getTime() - Date.now() <= 30 * 24 * 60 * 60 * 1000
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
            Business Associate Agreement (BAA) Management
          </h2>
          <p className="text-gray-600">
            HIPAA-compliant vendor management and Business Associate Agreement tracking
          </p>
        </div>
        <div className="flex space-x-3">
          <div className={`px-3 py-1 rounded-full ${
            criticalBAs.length === 0 ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <span className={`text-sm font-medium ${
              criticalBAs.length === 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              {criticalBAs.length === 0 ? 'All Critical BAAs Signed' : `${criticalBAs.length} Critical BAAs Missing`}
            </span>
          </div>
          <Button
            onClick={() => setShowNewBAForm(true)}
            icon={Plus}
          >
            Add Business Associate
          </Button>
        </div>
      </div>

      {/* Critical BAAs Alert */}
      {criticalBAs.length > 0 && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                🚨 CRITICAL: Missing BAAs for Production Launch
              </h3>
              <p className="text-red-800 mb-4">
                {criticalBAs.length} critical vendors require signed Business Associate Agreements before production launch.
                Operating without BAAs creates immediate HIPAA violation risk.
              </p>
              <div className="space-y-2">
                {criticalBAs.map((ba) => (
                  <div key={ba.id} className="bg-white p-3 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-900">{ba.vendorName}</p>
                        <p className="text-sm text-red-700">{ba.serviceDescription}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => generateBAATemplate(ba)}
                          icon={FileText}
                        >
                          Generate BAA
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSignBAA(ba.id)}
                        >
                          Mark as Signed
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Expiring BAAs Alert */}
      {expiringBAs.length > 0 && (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-start space-x-4">
            <Calendar className="w-6 h-6 text-yellow-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                ⚠️ BAAs Expiring Soon ({expiringBAs.length})
              </h3>
              <p className="text-yellow-800 mb-4">
                The following Business Associate Agreements expire within 30 days and need renewal.
              </p>
              <div className="space-y-2">
                {expiringBAs.map((ba) => (
                  <div key={ba.id} className="bg-white p-3 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-yellow-900">{ba.vendorName}</p>
                        <p className="text-sm text-yellow-700">
                          Expires: {ba.baaExpirationDate?.toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Extend BAA by 1 year
                          const updatedBAs = businessAssociates.map(vendor =>
                            vendor.id === ba.id
                              ? {
                                  ...vendor,
                                  baaExpirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                                  nextAuditDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                                  updatedAt: new Date()
                                }
                              : vendor
                          );
                          setBusinessAssociates(updatedBAs);
                          safeLocalStorageSet('lumi_business_associates', updatedBAs);
                          toast.success('BAA Renewed', 'Agreement extended for 1 year');
                        }}
                        className="text-yellow-600 border-yellow-300"
                      >
                        Renew BAA
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* New BA Form */}
      {showNewBAForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#1A1A1A]">
              Add New Business Associate
            </h3>
            <Button
              variant="ghost"
              onClick={() => setShowNewBAForm(false)}
              icon={X}
            >
              Cancel
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Vendor Name"
              value={newBA.vendorName}
              onChange={(value) => setNewBA(prev => ({ ...prev, vendorName: value }))}
              placeholder="Enter vendor/company name"
              required
            />
            
            <Select
              label="Vendor Type"
              value={newBA.vendorType}
              onChange={(value) => setNewBA(prev => ({ ...prev, vendorType: value }))}
              options={vendorTypes}
            />
            
            <div className="md:col-span-2">
              <Input
                label="Service Description"
                value={newBA.serviceDescription}
                onChange={(value) => setNewBA(prev => ({ ...prev, serviceDescription: value }))}
                placeholder="Describe the services provided..."
                required
              />
            </div>
            
            <Select
              label="PHI Access Level"
              value={newBA.phiAccessLevel}
              onChange={(value) => setNewBA(prev => ({ ...prev, phiAccessLevel: value }))}
              options={phiAccessLevels}
            />
            
            <Select
              label="Risk Assessment"
              value={newBA.riskAssessment}
              onChange={(value) => setNewBA(prev => ({ ...prev, riskAssessment: value }))}
              options={riskLevels}
            />
            
            <Input
              label="Contact Email"
              type="email"
              value={newBA.contactEmail}
              onChange={(value) => setNewBA(prev => ({ ...prev, contactEmail: value }))}
              placeholder="legal@vendor.com"
              required
            />
          </div>
          
          <div className="mt-6">
            <Button onClick={handleCreateBA} icon={Building}>
              Add Business Associate
            </Button>
          </div>
        </Card>
      )}

      {/* Business Associates List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Business Associates ({businessAssociates.length})
        </h3>
        
        <div className="space-y-4">
          {businessAssociates.map((ba) => (
            <div key={ba.id} className={`p-6 border rounded-xl ${
              ba.riskAssessment === 'critical' ? 'border-red-200 bg-red-50' :
              ba.riskAssessment === 'high' ? 'border-orange-200 bg-orange-50' :
              ba.riskAssessment === 'medium' ? 'border-yellow-200 bg-yellow-50' :
              'border-green-200 bg-green-50'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-[#1A1A1A]">
                      {ba.vendorName}
                    </h4>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {ba.vendorType.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{ba.serviceDescription}</p>
                  <p className="text-sm text-gray-600">Contact: {ba.contactEmail}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ba.baaStatus === 'signed' ? 'bg-green-100 text-green-700' :
                    ba.baaStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    BAA {ba.baaStatus.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(ba.riskAssessment)} bg-white`}>
                    {ba.riskAssessment.toUpperCase()} RISK
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-600">PHI Access Level:</p>
                  <p className={`font-medium ${
                    ba.phiAccessLevel === 'full' ? 'text-red-600' :
                    ba.phiAccessLevel === 'limited' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {ba.phiAccessLevel.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Compliance Status:</p>
                  <p className={`font-medium ${getStatusColor(ba.complianceStatus)}`}>
                    {ba.complianceStatus.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Data Types:</p>
                  <p className="font-medium text-[#1A1A1A]">
                    {ba.dataTypesAccessed.length > 0 ? ba.dataTypesAccessed.join(', ') : 'None specified'}
                  </p>
                </div>
              </div>

              {ba.baaSignedDate && (
                <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">BAA Signed:</p>
                    <p className="font-medium text-[#1A1A1A]">{ba.baaSignedDate.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">BAA Expires:</p>
                    <p className={`font-medium ${
                      ba.baaExpirationDate && ba.baaExpirationDate.getTime() - Date.now() <= 30 * 24 * 60 * 60 * 1000
                        ? 'text-red-600' : 'text-[#1A1A1A]'
                    }`}>
                      {ba.baaExpirationDate?.toLocaleDateString() || 'Not set'}
                    </p>
                  </div>
                </div>
              )}

              {ba.notes && (
                <div className="mb-4 p-3 bg-white rounded-lg border">
                  <p className="text-sm text-gray-700">
                    <strong>Notes:</strong> {ba.notes}
                  </p>
                </div>
              )}

              <div className="flex space-x-2 pt-4 border-t border-gray-200">
                {ba.baaStatus === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => generateBAATemplate(ba)}
                      icon={FileText}
                    >
                      Generate BAA Template
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSignBAA(ba.id)}
                    >
                      Mark as Signed
                    </Button>
                  </>
                )}
                
                {ba.baaStatus === 'signed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const updatedBAs = businessAssociates.map(vendor =>
                        vendor.id === ba.id
                          ? {
                              ...vendor,
                              lastAuditDate: new Date(),
                              nextAuditDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                              updatedAt: new Date()
                            }
                          : vendor
                      );
                      setBusinessAssociates(updatedBAs);
                      safeLocalStorageSet('lumi_business_associates', updatedBAs);
                      toast.success('Audit Completed', 'BAA compliance audit recorded');
                    }}
                    icon={CheckCircle}
                  >
                    Complete Audit
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingBA(editingBA === ba.id ? null : ba.id)}
                  icon={Edit}
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Compliance Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
            BAA Compliance Summary
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Business Associates:</span>
              <span className="font-medium text-[#1A1A1A]">{businessAssociates.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">BAAs Signed:</span>
              <span className="font-medium text-green-600">
                {businessAssociates.filter(ba => ba.baaStatus === 'signed').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">BAAs Pending:</span>
              <span className="font-medium text-red-600">
                {businessAssociates.filter(ba => ba.baaStatus === 'pending').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Critical Risk Vendors:</span>
              <span className="font-medium text-red-600">
                {businessAssociates.filter(ba => ba.riskAssessment === 'critical').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">PHI Access Vendors:</span>
              <span className="font-medium text-orange-600">
                {businessAssociates.filter(ba => ba.phiAccessLevel !== 'none').length}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
            HIPAA Compliance Actions
          </h3>
          
          <div className="space-y-3">
            <Button
              onClick={() => {
                const report = {
                  timestamp: new Date().toISOString(),
                  businessAssociates,
                  summary: {
                    total: businessAssociates.length,
                    signed: businessAssociates.filter(ba => ba.baaStatus === 'signed').length,
                    pending: businessAssociates.filter(ba => ba.baaStatus === 'pending').length,
                    critical: criticalBAs.length,
                    expiring: expiringBAs.length
                  },
                  complianceStatus: criticalBAs.length === 0 ? 'compliant' : 'non_compliant'
                };
                
                const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `BAA_Compliance_Report_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                toast.success('BAA Report Exported', 'Compliance report downloaded');
              }}
              variant="outline"
              className="w-full"
              icon={Download}
            >
              Export BAA Compliance Report
            </Button>
            
            <Button
              onClick={() => {
                // Generate all missing BAA templates
                criticalBAs.forEach(ba => generateBAATemplate(ba));
                toast.success('BAA Templates Generated', `${criticalBAs.length} templates downloaded`);
              }}
              variant="outline"
              className="w-full"
              icon={FileText}
              disabled={criticalBAs.length === 0}
            >
              Generate All Missing BAAs
            </Button>
            
            <Button
              onClick={() => {
                toast.info('Legal Review', 'Contact legal@lumi.app for BAA review and execution');
              }}
              variant="outline"
              className="w-full"
              icon={Shield}
            >
              Request Legal Review
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};