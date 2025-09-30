import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Download, Play, RefreshCw, Lock, Users, Database, FileText, Eye, AlertCircle } from 'lucide-react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { useAppContext } from '../../context/AppContext';
import { securityAssessor, SecurityTestResult, ComplianceAssessment } from '../../utils/securityAssessment';
import { ErrorLogger } from '../../utils/errorLogger';

export const SecurityCompliancePanel: React.FC = () => {
  const { toast } = useAppContext();
  const [assessment, setAssessment] = useState<ComplianceAssessment | null>(null);
  const [testing, setTesting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Tests', icon: Shield },
    { id: 'authentication', label: 'Authentication', icon: Lock },
    { id: 'data_encryption', label: 'Data Encryption', icon: Database },
    { id: 'ferpa', label: 'FERPA Compliance', icon: FileText },
    { id: 'hipaa', label: 'HIPAA Compliance', icon: Users },
    { id: 'vulnerability', label: 'Vulnerabilities', icon: AlertTriangle },
    { id: 'audit_logging', label: 'Audit & Logging', icon: Eye }
  ];

  const runSecurityAssessment = async () => {
    setTesting(true);
    ErrorLogger.info('Starting security and compliance assessment');
    
    try {
      const result = await securityAssessor.runCompleteSecurityAssessment();
      setAssessment(result);
      
      ErrorLogger.info('Security assessment completed', {
        overallScore: result.overallComplianceScore,
        ferpaScore: result.ferpaCompliance,
        hipaaScore: result.hipaaCompliance,
        criticalRisks: result.criticalRisks
      });
      
      if (result.criticalRisks === 0) {
        toast.success('Assessment Complete!', `Compliance score: ${result.overallComplianceScore}%`);
      } else {
        toast.error('Critical Risks Found', `${result.criticalRisks} critical security issues detected`);
      }
    } catch (error) {
      ErrorLogger.error('Security assessment failed', { error: error.message });
      toast.error('Assessment Failed', error.message);
    } finally {
      setTesting(false);
    }
  };

  const exportSecurityReport = () => {
    if (!assessment) return;
    
    const report = {
      timestamp: new Date().toISOString(),
      overallComplianceScore: assessment.overallComplianceScore,
      ferpaCompliance: assessment.ferpaCompliance,
      hipaaCompliance: assessment.hipaaCompliance,
      criticalRisks: assessment.criticalRisks,
      testResults: assessment.testResults,
      dataFlowAnalysis: assessment.dataFlowAnalysis,
      vulnerabilityReport: assessment.vulnerabilityReport,
      recommendations: assessment.recommendations,
      executiveSummary: generateExecutiveSummary(assessment),
      environment: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lumi-security-compliance-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Security Report Exported', 'Compliance assessment downloaded');
  };

  const generateExecutiveSummary = (assessment: ComplianceAssessment): string => {
    return `
LUMI SECURITY & COMPLIANCE ASSESSMENT
Executive Summary

Overall Compliance Score: ${assessment.overallComplianceScore}%
FERPA Compliance: ${assessment.ferpaCompliance}%
HIPAA Compliance: ${assessment.hipaaCompliance}%
Critical Risks: ${assessment.criticalRisks}

KEY FINDINGS:
${assessment.criticalRisks > 0 ? 
  `⚠️  CRITICAL: ${assessment.criticalRisks} critical security risks identified that must be resolved before production launch.` :
  '✅ No critical security risks identified.'
}

FERPA COMPLIANCE STATUS:
${assessment.ferpaCompliance >= 80 ? '✅ Generally compliant with FERPA requirements' : 
  assessment.ferpaCompliance >= 60 ? '⚠️  Partially compliant - improvements needed' :
  '❌ Non-compliant - significant FERPA violations detected'
}

HIPAA COMPLIANCE STATUS:
${assessment.hipaaCompliance >= 80 ? '✅ Generally compliant with HIPAA requirements' : 
  assessment.hipaaCompliance >= 60 ? '⚠️  Partially compliant - improvements needed' :
  '❌ Non-compliant - significant HIPAA violations detected'
}

IMMEDIATE ACTION REQUIRED:
${assessment.recommendations.immediate.slice(0, 5).map(rec => `• ${rec}`).join('\n')}

PRODUCTION READINESS:
${assessment.criticalRisks === 0 && assessment.overallComplianceScore >= 80 ? 
  '✅ READY FOR PRODUCTION with recommended improvements' :
  '❌ NOT READY FOR PRODUCTION - critical issues must be resolved'
}
    `.trim();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'partial':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'non_compliant':
        return <XCircle className="w-5 h-5 text-orange-600" />;
      case 'critical_risk':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
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

  const getFilteredResults = () => {
    if (!assessment) return [];
    if (selectedCategory === 'all') return assessment.testResults;
    return assessment.testResults.filter(result => result.category === selectedCategory);
  };

  const getCategoryStats = (category: string) => {
    if (!assessment) return { total: 0, compliant: 0, critical: 0 };
    
    const categoryResults = category === 'all' 
      ? assessment.testResults 
      : assessment.testResults.filter(r => r.category === category);
    
    return {
      total: categoryResults.length,
      compliant: categoryResults.filter(r => r.status === 'compliant').length,
      critical: categoryResults.filter(r => r.riskLevel === 'critical').length
    };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
            Security & Compliance Assessment
          </h2>
          <p className="text-gray-600">
            FERPA and HIPAA compliance evaluation for educational data protection
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={runSecurityAssessment}
            loading={testing}
            icon={Play}
            size="lg"
          >
            Run Security Assessment
          </Button>
          {assessment && (
            <Button
              onClick={exportSecurityReport}
              variant="outline"
              icon={Download}
            >
              Export Report
            </Button>
          )}
        </div>
      </div>

      {/* Compliance Scores */}
      {assessment && (
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="p-6 text-center">
            <div className={`text-4xl font-bold mb-2 ${
              assessment.overallComplianceScore >= 80 ? 'text-green-600' : 
              assessment.overallComplianceScore >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {assessment.overallComplianceScore}%
            </div>
            <p className="text-sm text-gray-600">Overall Compliance</p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className={`text-3xl font-bold mb-2 ${
              assessment.ferpaCompliance >= 80 ? 'text-green-600' : 
              assessment.ferpaCompliance >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {assessment.ferpaCompliance}%
            </div>
            <p className="text-sm text-gray-600">FERPA Compliance</p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className={`text-3xl font-bold mb-2 ${
              assessment.hipaaCompliance >= 80 ? 'text-green-600' : 
              assessment.hipaaCompliance >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {assessment.hipaaCompliance}%
            </div>
            <p className="text-sm text-gray-600">HIPAA Compliance</p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className={`text-3xl font-bold mb-2 ${
              assessment.criticalRisks === 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {assessment.criticalRisks}
            </div>
            <p className="text-sm text-gray-600">Critical Risks</p>
          </Card>
        </div>
      )}

      {/* Critical Issues Alert */}
      {assessment && assessment.criticalRisks > 0 && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                🚨 CRITICAL SECURITY RISKS DETECTED
              </h3>
              <p className="text-red-800 mb-4">
                {assessment.criticalRisks} critical security issues must be resolved before production launch.
                These pose immediate compliance and data protection risks.
              </p>
              <div className="space-y-2">
                {assessment.recommendations.immediate.slice(0, 5).map((issue, index) => (
                  <div key={index} className="text-sm text-red-700 font-medium">
                    • {issue}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const IconComponent = category.icon;
          const stats = getCategoryStats(category.id);
          
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-200
                ${selectedCategory === category.id
                  ? 'bg-[#C44E38] text-white border-[#C44E38]'
                  : 'bg-white text-gray-700 border-[#E6E2DD] hover:border-[#C44E38]'
                }
              `}
            >
              <IconComponent className="w-4 h-4" />
              <span className="text-sm font-medium">{category.label}</span>
              {assessment && stats.total > 0 && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedCategory === category.id ? 'bg-white text-[#C44E38]' : 'bg-gray-100 text-gray-600'
                }`}>
                  {stats.compliant}/{stats.total}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Test Results */}
      {assessment && (
        <div className="space-y-6">
          {/* Data Flow Analysis */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
              Data Flow Security Analysis
            </h3>
            
            <div className="grid md:grid-cols-5 gap-4">
              {Object.entries(assessment.dataFlowAnalysis).map(([flow, tests]) => (
                <div key={flow} className="text-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${
                    tests.every(t => t.status === 'compliant') ? 'bg-green-100' :
                    tests.some(t => t.riskLevel === 'critical') ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    <Database className={`w-6 h-6 ${
                      tests.every(t => t.status === 'compliant') ? 'text-green-600' :
                      tests.some(t => t.riskLevel === 'critical') ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                  </div>
                  <p className="text-sm font-medium text-[#1A1A1A] capitalize">
                    {flow.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </p>
                  <p className="text-xs text-gray-600">
                    {tests.filter(t => t.status === 'compliant').length}/{tests.length} secure
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Vulnerability Report */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
              Vulnerability Report
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(assessment.vulnerabilityReport).map(([category, vulns]) => (
                <div key={category}>
                  <h4 className="font-medium text-[#1A1A1A] mb-3 capitalize">
                    {category.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </h4>
                  <div className="space-y-2">
                    {vulns.map((vuln, index) => (
                      <div key={index} className={`p-3 rounded-lg border ${
                        vuln.riskLevel === 'critical' ? 'bg-red-50 border-red-200' :
                        vuln.riskLevel === 'high' ? 'bg-orange-50 border-orange-200' :
                        vuln.riskLevel === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-green-50 border-green-200'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">{vuln.name}</p>
                          <span className={`text-xs font-bold ${getRiskColor(vuln.riskLevel)}`}>
                            {vuln.riskLevel.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{vuln.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Detailed Test Results */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
              Detailed Security Test Results
            </h3>
            
            <div className="space-y-4">
              {getFilteredResults().map((result) => (
                <div key={result.id} className="border border-[#E6E2DD] rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-[#1A1A1A]">
                            {result.name}
                          </p>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            result.riskLevel === 'critical' ? 'bg-red-100 text-red-700' :
                            result.riskLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                            result.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {result.riskLevel.toUpperCase()} RISK
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                            {result.category.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {result.description}
                        </p>
                        <p className="text-sm text-[#1A1A1A] mb-2">
                          {result.details}
                        </p>
                        {result.regulatoryRequirement && (
                          <p className="text-xs text-blue-600 font-medium">
                            📋 {result.regulatoryRequirement}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDetails(showDetails === result.id ? null : result.id)}
                      icon={Eye}
                    >
                      {showDetails === result.id ? 'Hide' : 'Details'}
                    </Button>
                  </div>

                  {showDetails === result.id && (
                    <div className="mt-4 pt-4 border-t border-[#E6E2DD]">
                      {/* Evidence */}
                      {result.evidence && result.evidence.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-medium text-[#1A1A1A] mb-2">Evidence:</h5>
                          <ul className="space-y-1">
                            {result.evidence.map((evidence, index) => (
                              <li key={index} className="text-sm text-gray-700">
                                • {evidence}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      <div>
                        <h5 className="font-medium text-[#1A1A1A] mb-2">Recommendations:</h5>
                        <ul className="space-y-1">
                          {result.recommendations.map((rec, index) => (
                            <li key={index} className={`text-sm ${
                              rec.includes('CRITICAL') || rec.includes('IMMEDIATE') ? 'text-red-700 font-medium' : 'text-gray-700'
                            }`}>
                              • {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Recommendations Summary */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Immediate Actions */}
            {assessment.recommendations.immediate.length > 0 && (
              <Card className="p-6 bg-red-50 border-red-200">
                <h4 className="font-semibold text-red-900 mb-4">
                  🚨 Immediate Actions
                </h4>
                <ul className="space-y-2">
                  {assessment.recommendations.immediate.slice(0, 3).map((item, index) => (
                    <li key={index} className="text-sm text-red-800">
                      • {item}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            
            {/* Medium-term Improvements */}
            {assessment.recommendations.mediumTerm.length > 0 && (
              <Card className="p-6 bg-yellow-50 border-yellow-200">
                <h4 className="font-semibold text-yellow-900 mb-4">
                  ⚠️ Medium-term
                </h4>
                <ul className="space-y-2">
                  {assessment.recommendations.mediumTerm.slice(0, 3).map((item, index) => (
                    <li key={index} className="text-sm text-yellow-800">
                      • {item}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            
            {/* Long-term Strategy */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-4">
                📈 Long-term
              </h4>
              <ul className="space-y-2">
                {assessment.recommendations.longTerm.slice(0, 3).map((item, index) => (
                  <li key={index} className="text-sm text-blue-800">
                    • {item}
                  </li>
                ))}
              </ul>
            </Card>
            
            {/* Governance */}
            <Card className="p-6 bg-purple-50 border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-4">
                📋 Governance
              </h4>
              <ul className="space-y-2">
                {assessment.recommendations.governance.slice(0, 3).map((item, index) => (
                  <li key={index} className="text-sm text-purple-800">
                    • {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}

      {/* Initial State */}
      {!assessment && !testing && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">
            Security & Compliance Assessment
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Comprehensive evaluation of FERPA and HIPAA compliance for educational data protection.
            This assessment will identify security vulnerabilities, compliance gaps, and provide
            actionable recommendations for production readiness.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-[#1A1A1A] mb-2">FERPA Compliance</h4>
              <p className="text-sm text-gray-600">
                Student data privacy, parental rights, educational record protection
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-[#1A1A1A] mb-2">HIPAA Compliance</h4>
              <p className="text-sm text-gray-600">
                Health information protection, PHI security, business associate agreements
              </p>
            </div>
          </div>
          
          <Button
            onClick={runSecurityAssessment}
            size="lg"
            icon={Shield}
            className="px-12"
          >
            Start Security Assessment
          </Button>
        </Card>
      )}

      {/* Testing in Progress */}
      {testing && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full" />
          </div>
          <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">
            Running Security Assessment...
          </h3>
          <p className="text-gray-600">
            Testing authentication, data protection, FERPA compliance, HIPAA compliance, and vulnerability scanning
          </p>
        </Card>
      )}
    </div>
  );
};