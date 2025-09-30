import React, { useState } from 'react';
import { Shield, AlertTriangle, XCircle, CheckCircle, FileText, Download, Eye, Lock, Users, Database } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';
import { 
  securityExpertEvaluation, 
  implementationQuality, 
  launchRecommendation,
  SecurityEvaluationResult 
} from '../../utils/securityComplianceEvaluation';

export const SecurityExpertReport: React.FC = () => {
  const { toast } = useAppContext();
  const [activeTab, setActiveTab] = useState<'summary' | 'findings' | 'compliance' | 'remediation'>('summary');
  const [selectedFinding, setSelectedFinding] = useState<string | null>(null);

  const evaluation = securityExpertEvaluation;
  const quality = implementationQuality;
  const recommendation = launchRecommendation;

  const exportFullReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      assessmentType: 'Security & Compliance Expert Evaluation',
      overallRisk: evaluation.overallRisk,
      productionReadiness: evaluation.productionReadiness,
      complianceScores: {
        ferpa: evaluation.ferpaCompliance,
        hipaa: evaluation.hipaaCompliance,
        security: evaluation.securityPosture
      },
      criticalBlockers: evaluation.criticalBlockers,
      findings: evaluation.findings,
      implementationQuality: quality,
      launchRecommendation: recommendation,
      executiveSummary: evaluation.executiveSummary,
      legalRiskAssessment: evaluation.legalRiskAssessment,
      remediationPlan: evaluation.remediationPlan
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lumi-security-expert-evaluation-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Expert Report Exported', 'Comprehensive security evaluation downloaded');
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderSummaryTab = () => (
    <div className="space-y-8">
      {/* Launch Recommendation */}
      <Card className={`p-6 ${
        recommendation.recommendation === 'BLOCK_LAUNCH' ? 'bg-red-50 border-red-200' :
        recommendation.recommendation === 'CONDITIONAL_LAUNCH' ? 'bg-yellow-50 border-yellow-200' :
        'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            recommendation.recommendation === 'BLOCK_LAUNCH' ? 'bg-red-100' :
            recommendation.recommendation === 'CONDITIONAL_LAUNCH' ? 'bg-yellow-100' :
            'bg-green-100'
          }`}>
            {recommendation.recommendation === 'BLOCK_LAUNCH' ? (
              <XCircle className="w-6 h-6 text-red-600" />
            ) : recommendation.recommendation === 'CONDITIONAL_LAUNCH' ? (
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            ) : (
              <CheckCircle className="w-6 h-6 text-green-600" />
            )}
          </div>
          <div>
            <h3 className={`text-xl font-bold mb-2 ${
              recommendation.recommendation === 'BLOCK_LAUNCH' ? 'text-red-900' :
              recommendation.recommendation === 'CONDITIONAL_LAUNCH' ? 'text-yellow-900' :
              'text-green-900'
            }`}>
              {recommendation.recommendation === 'BLOCK_LAUNCH' ? '🚫 BLOCK PRODUCTION LAUNCH' :
               recommendation.recommendation === 'CONDITIONAL_LAUNCH' ? '⚠️ CONDITIONAL LAUNCH APPROVAL' :
               '✅ APPROVE FOR PRODUCTION LAUNCH'}
            </h3>
            <p className={`mb-4 ${
              recommendation.recommendation === 'BLOCK_LAUNCH' ? 'text-red-800' :
              recommendation.recommendation === 'CONDITIONAL_LAUNCH' ? 'text-yellow-800' :
              'text-green-800'
            }`}>
              {recommendation.reasoning}
            </p>
            <div className="text-sm">
              <p className="font-medium mb-2">Timeline: {recommendation.timeline}</p>
              {recommendation.conditions && (
                <div>
                  <p className="font-medium mb-2">Required Conditions:</p>
                  <ul className="space-y-1">
                    {recommendation.conditions.map((condition, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 mr-2 flex-shrink-0" />
                        {condition}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Compliance Scores */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <div className={`text-4xl font-bold mb-2 ${getComplianceColor(evaluation.ferpaCompliance)}`}>
            {evaluation.ferpaCompliance}%
          </div>
          <p className="text-sm text-gray-600 mb-2">FERPA Compliance</p>
          <p className={`text-xs font-medium ${getComplianceColor(evaluation.ferpaCompliance)}`}>
            {evaluation.ferpaCompliance >= 80 ? 'COMPLIANT' : 
             evaluation.ferpaCompliance >= 60 ? 'PARTIAL' : 'NON-COMPLIANT'}
          </p>
        </Card>
        
        <Card className="p-6 text-center">
          <div className={`text-4xl font-bold mb-2 ${getComplianceColor(evaluation.hipaaCompliance)}`}>
            {evaluation.hipaaCompliance}%
          </div>
          <p className="text-sm text-gray-600 mb-2">HIPAA Compliance</p>
          <p className={`text-xs font-medium ${getComplianceColor(evaluation.hipaaCompliance)}`}>
            {evaluation.hipaaCompliance >= 80 ? 'COMPLIANT' : 
             evaluation.hipaaCompliance >= 60 ? 'PARTIAL' : 'NON-COMPLIANT'}
          </p>
        </Card>
        
        <Card className="p-6 text-center">
          <div className={`text-4xl font-bold mb-2 ${getComplianceColor(evaluation.securityPosture)}`}>
            {evaluation.securityPosture}%
          </div>
          <p className="text-sm text-gray-600 mb-2">Security Posture</p>
          <p className={`text-xs font-medium ${getComplianceColor(evaluation.securityPosture)}`}>
            {evaluation.securityPosture >= 80 ? 'STRONG' : 
             evaluation.securityPosture >= 60 ? 'ADEQUATE' : 'WEAK'}
          </p>
        </Card>
      </div>

      {/* Critical Blockers */}
      <Card className="p-6 bg-red-50 border-red-200">
        <h3 className="text-lg font-semibold text-red-900 mb-4">
          🚨 Critical Production Blockers ({evaluation.criticalBlockers.length})
        </h3>
        <div className="space-y-2">
          {evaluation.criticalBlockers.map((blocker, index) => (
            <div key={index} className="flex items-start space-x-2">
              <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800 font-medium">{blocker}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Implementation Quality Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            ✅ Implementation Strengths
          </h3>
          <div className="space-y-2">
            {quality.strengths.map((strength, index) => (
              <div key={index} className="text-sm text-green-800">
                {strength}
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-6 bg-red-50 border-red-200">
          <h3 className="text-lg font-semibold text-red-900 mb-4">
            🚨 Critical Weaknesses
          </h3>
          <div className="space-y-2">
            {quality.criticalWeaknesses.slice(0, 4).map((weakness, index) => (
              <div key={index} className="text-sm text-red-800">
                {weakness}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderFindingsTab = () => (
    <div className="space-y-6">
      {evaluation.findings.map((finding) => (
        <Card key={finding.finding} className={`p-6 ${
          finding.riskLevel === 'critical' ? 'border-red-200 bg-red-50' :
          finding.riskLevel === 'high' ? 'border-orange-200 bg-orange-50' :
          finding.riskLevel === 'medium' ? 'border-yellow-200 bg-yellow-50' :
          'border-green-200 bg-green-50'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                {finding.finding}
              </h3>
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  finding.riskLevel === 'critical' ? 'bg-red-100 text-red-700' :
                  finding.riskLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                  finding.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {finding.riskLevel.toUpperCase()} RISK
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  finding.complianceStatus === 'compliant' ? 'bg-green-100 text-green-700' :
                  finding.complianceStatus === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {finding.complianceStatus.replace('_', ' ').toUpperCase()}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                  {finding.category.replace('_', ' ')}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFinding(selectedFinding === finding.finding ? null : finding.finding)}
              icon={Eye}
            >
              {selectedFinding === finding.finding ? 'Hide' : 'Details'}
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-[#1A1A1A] mb-2">Business Impact:</h4>
              <p className="text-sm text-gray-700">{finding.businessImpact}</p>
            </div>

            {finding.regulatoryReference && (
              <div>
                <h4 className="font-medium text-[#1A1A1A] mb-2">Regulatory Reference:</h4>
                <p className="text-sm text-blue-700 font-medium">{finding.regulatoryReference}</p>
              </div>
            )}

            {selectedFinding === finding.finding && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                {/* Evidence */}
                <div>
                  <h4 className="font-medium text-[#1A1A1A] mb-2">Evidence:</h4>
                  <ul className="space-y-1">
                    {finding.evidence.map((evidence, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <CheckCircle className="w-3 h-3 text-green-600 mt-1 mr-2 flex-shrink-0" />
                        {evidence}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Gaps */}
                <div>
                  <h4 className="font-medium text-[#1A1A1A] mb-2">Identified Gaps:</h4>
                  <ul className="space-y-1">
                    {finding.gaps.map((gap, index) => (
                      <li key={index} className={`text-sm flex items-start ${
                        gap.includes('CRITICAL') ? 'text-red-700 font-medium' : 'text-gray-700'
                      }`}>
                        <XCircle className={`w-3 h-3 mt-1 mr-2 flex-shrink-0 ${
                          gap.includes('CRITICAL') ? 'text-red-600' : 'text-orange-600'
                        }`} />
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="font-medium text-[#1A1A1A] mb-2">Expert Recommendations:</h4>
                  <ul className="space-y-1">
                    {finding.recommendations.map((rec, index) => (
                      <li key={index} className={`text-sm flex items-start ${
                        rec.includes('IMMEDIATE') ? 'text-red-700 font-medium' : 'text-gray-700'
                      }`}>
                        <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 mr-2 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );

  const renderComplianceTab = () => (
    <div className="space-y-8">
      {/* Executive Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Executive Summary
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
            {evaluation.executiveSummary}
          </pre>
        </div>
      </Card>

      {/* Legal Risk Assessment */}
      <Card className="p-6 bg-red-50 border-red-200">
        <h3 className="text-lg font-semibold text-red-900 mb-4">
          Legal Risk Assessment
        </h3>
        <div className="bg-white p-4 rounded-lg border border-red-200">
          <pre className="text-sm text-red-800 whitespace-pre-wrap">
            {evaluation.legalRiskAssessment}
          </pre>
        </div>
      </Card>

      {/* Compliance Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
            FERPA Compliance Analysis
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Data Minimization:</span>
              <span className="text-green-600 font-medium">✓ Partial</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Parental Rights:</span>
              <span className="text-red-600 font-medium">✗ Missing</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Access Controls:</span>
              <span className="text-yellow-600 font-medium">⚠ Partial</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Audit Trails:</span>
              <span className="text-yellow-600 font-medium">⚠ Basic</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Data Retention:</span>
              <span className="text-red-600 font-medium">✗ Missing</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
            HIPAA Compliance Analysis
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">PHI Identification:</span>
              <span className="text-yellow-600 font-medium">⚠ Manual</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Access Controls:</span>
              <span className="text-red-600 font-medium">✗ Missing</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Encryption:</span>
              <span className="text-red-600 font-medium">✗ Inadequate</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Audit Trails:</span>
              <span className="text-red-600 font-medium">✗ Missing</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">BAAs:</span>
              <span className="text-red-600 font-medium">✗ Missing</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderRemediationTab = () => (
    <div className="space-y-8">
      {/* Immediate Actions */}
      <Card className="p-6 bg-red-50 border-red-200">
        <h3 className="text-lg font-semibold text-red-900 mb-4">
          🚨 Immediate Actions (1-3 weeks)
        </h3>
        <div className="space-y-4">
          {evaluation.remediationPlan.immediate.map((action, index) => (
            <div key={index} className="p-4 bg-white border border-red-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-red-900">{action.action}</h4>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                  {action.timeline}
                </span>
              </div>
              <p className="text-sm text-red-700">
                <strong>Owner:</strong> {action.owner}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Short-term Actions */}
      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-900 mb-4">
          ⚠️ Short-term Actions (4-8 weeks)
        </h3>
        <div className="space-y-4">
          {evaluation.remediationPlan.shortTerm.map((action, index) => (
            <div key={index} className="p-4 bg-white border border-yellow-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-yellow-900">{action.action}</h4>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                  {action.timeline}
                </span>
              </div>
              <p className="text-sm text-yellow-700">
                <strong>Owner:</strong> {action.owner}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Medium-term Actions */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          📈 Medium-term Actions (8-20 weeks)
        </h3>
        <div className="space-y-4">
          {evaluation.remediationPlan.mediumTerm.map((action, index) => (
            <div key={index} className="p-4 bg-white border border-blue-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-blue-900">{action.action}</h4>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {action.timeline}
                </span>
              </div>
              <p className="text-sm text-blue-700">
                <strong>Owner:</strong> {action.owner}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const tabs = [
    { id: 'summary', label: 'Expert Summary', icon: Shield },
    { id: 'findings', label: 'Detailed Findings', icon: FileText },
    { id: 'compliance', label: 'Compliance Analysis', icon: Lock },
    { id: 'remediation', label: 'Remediation Plan', icon: AlertTriangle }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
            Security & Compliance Expert Evaluation
          </h1>
          <p className="text-gray-600">
            Professional assessment of Lumi's security posture and regulatory compliance
          </p>
        </div>
        <div className="flex space-x-3">
          <div className={`px-4 py-2 rounded-xl ${
            evaluation.overallRisk === 'critical' ? 'bg-red-100 text-red-700' :
            evaluation.overallRisk === 'high' ? 'bg-orange-100 text-orange-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            <span className="text-sm font-medium">
              {evaluation.overallRisk.toUpperCase()} RISK
            </span>
          </div>
          <Button
            onClick={exportFullReport}
            variant="outline"
            icon={Download}
          >
            Export Full Report
          </Button>
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
        {activeTab === 'summary' && renderSummaryTab()}
        {activeTab === 'findings' && renderFindingsTab()}
        {activeTab === 'compliance' && renderComplianceTab()}
        {activeTab === 'remediation' && renderRemediationTab()}
      </div>
    </div>
  );
};