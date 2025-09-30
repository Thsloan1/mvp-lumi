import React, { useState } from 'react';
import { Play, Download, RefreshCw, CheckCircle, AlertTriangle, XCircle, Shield, Globe, Database, Code, BarChart3, Users, Lock, Zap } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';
import { productionAssessor, TestResult, ProductionAssessment } from '../../utils/productionReadinessAssessor';
import { ErrorLogger } from '../../utils/errorLogger';

export const ProductionReadinessReport: React.FC = () => {
  const { toast } = useAppContext();
  const [assessment, setAssessment] = useState<ProductionAssessment | null>(null);
  const [testing, setTesting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [stressTesting, setStressTesting] = useState(false);

  const categories = [
    { id: 'all', label: 'All Tests', icon: Code, description: 'Complete assessment' },
    { id: 'frontend', label: 'Frontend', icon: Globe, description: 'UI/UX, forms, navigation' },
    { id: 'middleware', label: 'Middleware', icon: Database, description: 'APIs, auth, business logic' },
    { id: 'backend', label: 'Backend', icon: Shield, description: 'Database, security, scaling' },
    { id: 'security', label: 'Security', icon: Lock, description: 'RBAC, encryption, compliance' },
    { id: 'performance', label: 'Performance', icon: Zap, description: 'Load times, stress tests' },
    { id: 'system', label: 'System-Wide', icon: BarChart3, description: 'Workflows, monitoring' }
  ];

  const runCompleteAssessment = async () => {
    setTesting(true);
    ErrorLogger.info('Starting comprehensive production readiness assessment');
    
    try {
      const result = await productionAssessor.runCompleteAssessment();
      setAssessment(result);
      
      ErrorLogger.info('Production assessment completed', {
        overallScore: result.overallScore,
        criticalIssues: result.criticalIssues,
        totalTests: result.testResults.length
      });
      
      if (result.criticalIssues === 0 && result.overallScore >= 85) {
        toast.success('Production Ready!', `Overall score: ${result.overallScore}% - Ready for launch`);
      } else if (result.criticalIssues === 0) {
        toast.warning('Conditional Launch', `Score: ${result.overallScore}% - Launch with monitoring`);
      } else {
        toast.error('Not Production Ready', `${result.criticalIssues} critical issues must be resolved`);
      }
    } catch (error) {
      ErrorLogger.error('Production assessment failed', { error: error.message });
      toast.error('Assessment Failed', error.message);
    } finally {
      setTesting(false);
    }
  };

  const runStressTests = async () => {
    setStressTesting(true);
    
    try {
      // Run additional stress tests
      const largeClassroomTest = await productionAssessor.stressTestLargeClassrooms();
      
      if (assessment) {
        setAssessment({
          ...assessment,
          testResults: [...assessment.testResults, largeClassroomTest]
        });
      }
      
      toast.success('Stress Tests Complete', 'Additional performance data collected');
    } catch (error) {
      toast.error('Stress Tests Failed', error.message);
    } finally {
      setStressTesting(false);
    }
  };

  const exportAssessmentReport = () => {
    if (!assessment) return;
    
    const report = {
      timestamp: new Date().toISOString(),
      assessmentType: 'Comprehensive Production Readiness Assessment',
      overallScore: assessment.overallScore,
      criticalIssues: assessment.criticalIssues,
      testResults: assessment.testResults,
      performanceMetrics: assessment.performanceMetrics,
      securityValidation: assessment.securityValidation,
      recommendations: assessment.recommendations,
      summary: {
        frontend: this.getCategoryStats('frontend'),
        middleware: this.getCategoryStats('middleware'),
        backend: this.getCategoryStats('backend'),
        security: this.getCategoryStats('security'),
        performance: this.getCategoryStats('performance'),
        system: this.getCategoryStats('system')
      },
      productionReadiness: {
        ready: assessment.criticalIssues === 0 && assessment.overallScore >= 85,
        conditional: assessment.criticalIssues === 0 && assessment.overallScore >= 70,
        blocked: assessment.criticalIssues > 0 || assessment.overallScore < 70
      },
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
    link.download = `lumi-production-readiness-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Assessment Report Exported', 'Comprehensive production readiness report downloaded');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getFilteredResults = () => {
    if (!assessment) return [];
    if (selectedCategory === 'all') return assessment.testResults;
    return assessment.testResults.filter(result => result.category === selectedCategory);
  };

  const getCategoryStats = (category: string) => {
    if (!assessment) return { total: 0, passed: 0, failed: 0, warnings: 0 };
    
    const categoryResults = category === 'all' 
      ? assessment.testResults 
      : assessment.testResults.filter(r => r.category === category);
    
    return {
      total: categoryResults.length,
      passed: categoryResults.filter(r => r.status === 'pass').length,
      failed: categoryResults.filter(r => r.status === 'fail').length,
      warnings: categoryResults.filter(r => r.status === 'warning').length,
      critical: categoryResults.filter(r => r.critical && r.status === 'fail').length
    };
  };

  const getProductionReadinessStatus = () => {
    if (!assessment) return { status: 'unknown', message: '', color: 'gray' };
    
    if (assessment.criticalIssues === 0 && assessment.overallScore >= 85) {
      return {
        status: 'ready',
        message: '✅ READY FOR PRODUCTION LAUNCH',
        color: 'green',
        description: 'All critical tests passed. System is production-ready.'
      };
    } else if (assessment.criticalIssues === 0 && assessment.overallScore >= 70) {
      return {
        status: 'conditional',
        message: '⚠️ CONDITIONAL LAUNCH APPROVAL',
        color: 'yellow',
        description: 'No critical issues, but enhanced monitoring recommended.'
      };
    } else {
      return {
        status: 'blocked',
        message: '🚫 NOT READY FOR PRODUCTION',
        color: 'red',
        description: `${assessment.criticalIssues} critical issues must be resolved first.`
      };
    }
  };

  const readinessStatus = getProductionReadinessStatus();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
                Production Readiness Assessment
              </h1>
              <p className="text-gray-600">
                Comprehensive evaluation of frontend, middleware, backend, and system-wide components
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={runCompleteAssessment}
                loading={testing}
                icon={Play}
                size="lg"
              >
                Run Complete Assessment
              </Button>
              {assessment && (
                <Button
                  onClick={exportAssessmentReport}
                  variant="outline"
                  icon={Download}
                >
                  Export Report
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Production Readiness Status */}
        {assessment && (
          <Card className={`p-8 mb-8 ${
            readinessStatus.color === 'green' ? 'bg-green-50 border-green-200' :
            readinessStatus.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
            'bg-red-50 border-red-200'
          }`}>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-4 ${
                readinessStatus.color === 'green' ? 'text-green-600' :
                readinessStatus.color === 'yellow' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {readinessStatus.message}
              </div>
              <p className={`text-lg mb-6 ${
                readinessStatus.color === 'green' ? 'text-green-800' :
                readinessStatus.color === 'yellow' ? 'text-yellow-800' :
                'text-red-800'
              }`}>
                {readinessStatus.description}
              </p>
              
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${
                    assessment.overallScore >= 85 ? 'text-green-600' : 
                    assessment.overallScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {assessment.overallScore}%
                  </div>
                  <p className="text-sm text-gray-600">Overall Score</p>
                </div>
                
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${
                    assessment.criticalIssues === 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {assessment.criticalIssues}
                  </div>
                  <p className="text-sm text-gray-600">Critical Issues</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {assessment.testResults.filter(t => t.status === 'pass').length}
                  </div>
                  <p className="text-sm text-gray-600">Tests Passed</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {assessment.performanceMetrics.loadTime.toFixed(0)}ms
                  </div>
                  <p className="text-sm text-gray-600">Load Time</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Category Filter */}
        <div className="mb-8">
          <div className="grid md:grid-cols-3 lg:grid-cols-7 gap-3">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const stats = getCategoryStats(category.id);
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    p-4 rounded-xl border transition-all duration-200 text-left
                    ${selectedCategory === category.id
                      ? 'bg-[#C44E38] text-white border-[#C44E38]'
                      : 'bg-white text-gray-700 border-[#E6E2DD] hover:border-[#C44E38]'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium text-sm">{category.label}</span>
                  </div>
                  <p className="text-xs opacity-75 mb-2">{category.description}</p>
                  {assessment && stats.total > 0 && (
                    <div className={`text-xs ${
                      selectedCategory === category.id ? 'text-white' : 'text-gray-600'
                    }`}>
                      {stats.passed}/{stats.total} passed
                      {stats.critical > 0 && (
                        <span className={`ml-2 px-2 py-1 rounded-full ${
                          selectedCategory === category.id ? 'bg-white text-red-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {stats.critical} critical
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Performance Metrics */}
        {assessment && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 text-center">
              <div className={`text-3xl font-bold mb-2 ${
                assessment.performanceMetrics.loadTime < 2000 ? 'text-green-600' : 
                assessment.performanceMetrics.loadTime < 3000 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {assessment.performanceMetrics.loadTime.toFixed(0)}ms
              </div>
              <p className="text-sm text-gray-600">Load Time</p>
              <p className="text-xs text-gray-500 mt-1">Target: &lt;2000ms</p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className={`text-3xl font-bold mb-2 ${
                assessment.performanceMetrics.apiLatency < 500 ? 'text-green-600' : 
                assessment.performanceMetrics.apiLatency < 1000 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {assessment.performanceMetrics.apiLatency}ms
              </div>
              <p className="text-sm text-gray-600">API Latency</p>
              <p className="text-xs text-gray-500 mt-1">Target: &lt;500ms</p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {assessment.performanceMetrics.memoryUsage}MB
              </div>
              <p className="text-sm text-gray-600">Memory Usage</p>
              <p className="text-xs text-gray-500 mt-1">Current session</p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {assessment.performanceMetrics.bundleSize}MB
              </div>
              <p className="text-sm text-gray-600">Bundle Size</p>
              <p className="text-xs text-gray-500 mt-1">JavaScript assets</p>
            </Card>
          </div>
        )}

        {/* Security Validation */}
        {assessment && (
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
              Security Validation Summary
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(assessment.securityValidation).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                  <span className={`font-medium flex items-center space-x-1 ${
                    value ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {value ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    <span>{value ? 'Secure' : 'Needs Attention'}</span>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Critical Issues Alert */}
        {assessment && assessment.criticalIssues > 0 && (
          <Card className="p-6 mb-8 bg-red-50 border-red-200">
            <div className="flex items-start space-x-4">
              <XCircle className="w-6 h-6 text-red-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  🚨 CRITICAL ISSUES BLOCKING PRODUCTION ({assessment.criticalIssues})
                </h3>
                <p className="text-red-800 mb-4">
                  These critical issues must be resolved before production launch.
                </p>
                <div className="space-y-2">
                  {assessment.recommendations.critical.map((issue, index) => (
                    <div key={index} className="text-sm text-red-700 font-medium">
                      • {issue}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Test Results */}
        {assessment && (
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#1A1A1A]">
                Test Results
                {selectedCategory !== 'all' && (
                  <span className="ml-2 text-base font-normal text-gray-600">
                    - {categories.find(c => c.id === selectedCategory)?.label}
                  </span>
                )}
              </h3>
              <div className="flex space-x-2">
                <Button
                  onClick={runStressTests}
                  loading={stressTesting}
                  variant="outline"
                  size="sm"
                  icon={Zap}
                >
                  Run Stress Tests
                </Button>
                <Button
                  onClick={runCompleteAssessment}
                  loading={testing}
                  variant="outline"
                  size="sm"
                  icon={RefreshCw}
                >
                  Re-run Assessment
                </Button>
              </div>
            </div>
            
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
                          {result.critical && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                              Critical
                            </span>
                          )}
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                            {result.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {result.description}
                        </p>
                        <p className="text-sm text-[#1A1A1A]">
                          {result.details}
                        </p>
                        {result.timestamp && (
                          <p className="text-xs text-gray-500 mt-1">
                            Tested: {result.timestamp.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`text-sm font-medium capitalize ${
                        result.status === 'pass' ? 'text-green-600' :
                        result.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {result.status}
                      </span>
                      {result.metrics && Object.keys(result.metrics).length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDetails(showDetails === result.id ? null : result.id)}
                          className="mt-2"
                        >
                          {showDetails === result.id ? 'Hide' : 'Details'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {showDetails === result.id && result.metrics && (
                    <div className="mt-4 pt-4 border-t border-[#E6E2DD] bg-gray-50 p-3 rounded-lg">
                      <h5 className="font-medium text-[#1A1A1A] mb-2">Test Metrics:</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(result.metrics).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-medium text-[#1A1A1A]">
                              {typeof value === 'boolean' ? (value ? '✓' : '✗') : 
                               typeof value === 'number' ? value.toFixed(1) : 
                               value?.toString() || 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recommendations */}
        {assessment && assessment.recommendations && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Critical Issues */}
            {assessment.recommendations.critical.length > 0 && (
              <Card className="p-6 bg-red-50 border-red-200">
                <h4 className="font-semibold text-red-900 mb-4">
                  🚨 Must Fix Before Launch
                </h4>
                <ul className="space-y-2">
                  {assessment.recommendations.critical.map((item, index) => (
                    <li key={index} className="text-sm text-red-800">
                      • {item}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            
            {/* Improvements */}
            {assessment.recommendations.improvements.length > 0 && (
              <Card className="p-6 bg-yellow-50 border-yellow-200">
                <h4 className="font-semibold text-yellow-900 mb-4">
                  ⚠️ Recommended Improvements
                </h4>
                <ul className="space-y-2">
                  {assessment.recommendations.improvements.slice(0, 8).map((item, index) => (
                    <li key={index} className="text-sm text-yellow-800">
                      • {item}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            
            {/* Monitoring */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-4">
                📊 Production Monitoring
              </h4>
              <ul className="space-y-2">
                {assessment.recommendations.monitoring.map((item, index) => (
                  <li key={index} className="text-sm text-blue-800">
                    • {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        {/* Initial State */}
        {!assessment && !testing && (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Play className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">
              Ready to Assess Production Readiness
            </h3>
            <p className="text-gray-600 mb-8 max-w-3xl mx-auto">
              This comprehensive assessment will evaluate all layers of Lumi including frontend functionality, 
              middleware APIs, backend data integrity, security measures, performance metrics, and system-wide workflows.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium text-[#1A1A1A] mb-1">Frontend Layer</h4>
                <p className="text-xs text-gray-600">UI/UX, forms, navigation, responsiveness</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-[#1A1A1A] mb-1">Middleware Layer</h4>
                <p className="text-xs text-gray-600">APIs, authentication, business logic</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-[#1A1A1A] mb-1">Backend Layer</h4>
                <p className="text-xs text-gray-600">Database, security, scaling, compliance</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-medium text-[#1A1A1A] mb-1">System-Wide</h4>
                <p className="text-xs text-gray-600">Workflows, monitoring, deployment</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <Button
                onClick={runCompleteAssessment}
                size="lg"
                icon={Play}
                className="px-12"
              >
                Start Production Assessment
              </Button>
              
              <div className="text-sm text-gray-500">
                <p>Assessment includes:</p>
                <p>• 40+ automated tests across all system layers</p>
                <p>• Performance benchmarking and stress testing</p>
                <p>• Security vulnerability scanning</p>
                <p>• FERPA and HIPAA compliance validation</p>
              </div>
            </div>
          </Card>
        )}

        {/* Testing in Progress */}
        {testing && (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
            </div>
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">
              Running Production Assessment...
            </h3>
            <p className="text-gray-600 mb-4">
              Testing frontend, middleware, backend, security, performance, and system-wide components
            </p>
            <div className="text-sm text-gray-500">
              This comprehensive assessment may take 30-60 seconds to complete
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};