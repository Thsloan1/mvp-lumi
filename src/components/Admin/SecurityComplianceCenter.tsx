import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Lock, Eye, FileText, Database, Users } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';
import { ParentalRightsManager } from '../Security/ParentalRightsManager';
import { PHIAccessControls } from '../Security/PHIAccessControls';
import { DataRetentionManager } from '../Security/DataRetentionManager';
import { SecurityVulnerabilityScanner } from '../Security/SecurityVulnerabilityScanner';
import { EnhancedAuditLogger } from '../Security/EnhancedAuditLogger';
import { ParentPortal } from '../Security/ParentPortal';

export const SecurityComplianceCenter: React.FC = () => {
  const { setCurrentView } = useAppContext();
  const [activeModule, setActiveModule] = useState<'overview' | 'parental_rights' | 'parent_portal' | 'phi_controls' | 'data_retention' | 'vulnerabilities' | 'audit_logging'>('overview');

  const securityModules = [
    {
      id: 'overview',
      title: 'Security Overview',
      description: 'Comprehensive security and compliance dashboard',
      icon: Shield,
      status: 'active',
      riskLevel: 'medium'
    },
    {
      id: 'parental_rights',
      title: 'FERPA Parental Rights',
      description: 'Manage parental access requests and consent',
      icon: Users,
      status: 'critical_gap',
      riskLevel: 'critical'
    },
    {
      id: 'parent_portal',
      title: 'FERPA Parent Portal',
      description: 'Functional parent portal for educational record access',
      icon: Users,
      status: 'active',
      riskLevel: 'low'
    },
    {
      id: 'phi_controls',
      title: 'PHI Access Controls',
      description: 'HIPAA-compliant health information protection',
      icon: Lock,
      status: 'critical_gap',
      riskLevel: 'critical'
    },
    {
      id: 'data_retention',
      title: 'Data Retention Policies',
      description: 'Automated data lifecycle and deletion management',
      icon: Database,
      status: 'critical_gap',
      riskLevel: 'critical'
    },
    {
      id: 'vulnerabilities',
      title: 'Vulnerability Scanner',
      description: 'Security vulnerability detection and remediation',
      icon: AlertTriangle,
      status: 'partial',
      riskLevel: 'high'
    },
    {
      id: 'audit_logging',
      title: 'Enhanced Audit Logging',
      description: 'Comprehensive audit trails for compliance',
      icon: Eye,
      status: 'partial',
      riskLevel: 'medium'
    },
    {
      title: 'Expert Security Review',
      description: 'Professional security and compliance evaluation',
      icon: AlertTriangle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      action: () => setCurrentView('security-expert-report')
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'partial':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'critical_gap':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
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

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Critical Security Alert */}
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex items-start space-x-4">
          <AlertTriangle className="w-8 h-8 text-red-600 mt-1" />
          <div>
            <h3 className="text-xl font-semibold text-red-900 mb-2">
              🚨 CRITICAL SECURITY & COMPLIANCE GAPS
            </h3>
            <p className="text-red-800 mb-4">
              Lumi has critical security and compliance gaps that must be addressed before production launch.
              These gaps pose significant legal and regulatory risks.
            </p>
            <div className="space-y-2 text-sm text-red-800">
              <p>• <strong>FERPA Violation Risk:</strong> No parental rights management system</p>
              <p>• <strong>HIPAA Violation Risk:</strong> PHI access controls not implemented</p>
              <p>• <strong>Data Retention Risk:</strong> No automated deletion policies</p>
              <p>• <strong>Security Risk:</strong> Insufficient audit logging and monitoring</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Security Modules Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {securityModules.filter(module => module.id !== 'overview').map((module) => {
          const IconComponent = module.icon;
          return (
            <Card 
              key={module.id} 
              className={`p-6 cursor-pointer hover:shadow-md transition-shadow duration-200 ${
                module.status === 'critical_gap' ? 'border-red-200 bg-red-50' :
                module.status === 'partial' ? 'border-yellow-200 bg-yellow-50' :
                'border-green-200 bg-green-50'
              }`}
              onClick={() => setActiveModule(module.id as any)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  module.status === 'critical_gap' ? 'bg-red-100' :
                  module.status === 'partial' ? 'bg-yellow-100' :
                  'bg-green-100'
                }`}>
                  <IconComponent className={`w-6 h-6 ${
                    module.status === 'critical_gap' ? 'text-red-600' :
                    module.status === 'partial' ? 'text-yellow-600' :
                    'text-green-600'
                  }`} />
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(module.status)}
                  <span className={`text-xs font-medium ${getRiskColor(module.riskLevel)}`}>
                    {module.riskLevel.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                {module.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {module.description}
              </p>
              
              <div className={`px-3 py-2 rounded-lg text-xs font-medium ${
                module.status === 'critical_gap' ? 'bg-red-100 text-red-700' :
                module.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {module.status === 'critical_gap' ? 'CRITICAL GAP - Implementation Required' :
                 module.status === 'partial' ? 'PARTIAL - Enhancement Needed' :
                 'ACTIVE - Monitoring'}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Compliance Summary */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
            FERPA Compliance Status
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Data Minimization</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Secure Authentication</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Role-Based Access</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Parental Rights</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Data Retention</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Audit Logging</span>
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-[#E6E2DD]">
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#1A1A1A]">Overall FERPA Compliance:</span>
              <span className="font-bold text-yellow-600">60% - Partial</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
            HIPAA Compliance Status
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">PHI Identification</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">PHI Access Controls</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">PHI Encryption</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Audit Trails</span>
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Business Associates</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Breach Procedures</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-[#E6E2DD]">
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#1A1A1A]">Overall HIPAA Compliance:</span>
              <span className="font-bold text-red-600">25% - Non-compliant</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Items */}
      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-900 mb-4">
          📋 Immediate Action Items for Production Readiness
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-yellow-900 mb-3">Critical (Must Fix Before Launch)</h4>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                Implement FERPA parental rights management system
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                Add PHI-specific access controls and flagging
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                Establish automated data retention and deletion policies
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                Fix cross-classroom data access vulnerabilities
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-yellow-900 mb-3">High Priority (Post-Launch)</h4>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                Enhance comprehensive audit logging
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                Implement automated compliance monitoring
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                Add advanced threat detection and alerting
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                Strengthen data encryption (field-level for PHI)
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );

  const modules = [
    { id: 'overview', label: 'Security Overview', icon: Shield },
    { id: 'parental_rights', label: 'FERPA Parental Rights', icon: Users },
    { id: 'phi_controls', label: 'PHI Access Controls', icon: Lock },
    { id: 'data_retention', label: 'Data Retention', icon: Database },
    { id: 'vulnerabilities', label: 'Vulnerability Scanner', icon: AlertTriangle },
    { id: 'audit_logging', label: 'Audit Logging', icon: Eye }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('admin-dashboard')}
            icon={Shield}
            className="mb-6 -ml-2"
          >
            Back to Admin Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
                Security & Compliance Center
              </h1>
              <p className="text-gray-600">
                Comprehensive FERPA and HIPAA compliance management for educational data protection
              </p>
            </div>
            <div className="bg-red-100 px-4 py-2 rounded-xl">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-700">
                  Critical Compliance Gaps Detected
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Module Navigation */}
        <div className="border-b border-[#E6E2DD] mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {modules.map((module) => {
              const IconComponent = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id as any)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                    ${activeModule === module.id
                      ? 'border-[#C44E38] text-[#C44E38]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{module.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Module Content */}
        <div>
          {activeModule === 'overview' && renderOverview()}
          {activeModule === 'parental_rights' && <ParentalRightsManager />}
          {activeModule === 'parent_portal' && <ParentPortal />}
          {activeModule === 'phi_controls' && <PHIAccessControls />}
          {activeModule === 'data_retention' && <DataRetentionManager />}
          {activeModule === 'vulnerabilities' && <SecurityVulnerabilityScanner />}
          {activeModule === 'audit_logging' && <EnhancedAuditLogger />}
        </div>
      </div>
    </div>
  );
};