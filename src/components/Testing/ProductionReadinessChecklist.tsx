import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Shield, Zap, Globe, Smartphone, Database, Code, Users, BarChart3, Lock, Play, Download, RefreshCw } from 'lucide-react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { useAppContext } from '../../context/AppContext';
import { productionTester, TestResult, ProductionAssessment } from '../../utils/productionTester';
import { ErrorLogger } from '../../utils/errorLogger';

export const ProductionReadinessChecklist: React.FC = () => {
  const { setCurrentView, toast } = useAppContext();
  const [assessment, setAssessment] = useState<ProductionAssessment | null>(null);
  const [testing, setTesting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stressTesting, setStressTesting] = useState(false);

  const categories = [
    { id: 'all', label: 'All Tests', icon: Code },
    { id: 'frontend', label: 'Frontend', icon: Globe },
    { id: 'middleware', label: 'Middleware/API', icon: Database },
    { id: 'backend', label: 'Backend', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'system', label: 'System-Wide', icon: BarChart3 }
  ];

  const runCompleteAssessment = async () => {
    setTesting(true);
    ErrorLogger.info('Starting production readiness assessment');
    
    try {
      const result = await productionTester.runCompleteAssessment();
      setAssessment(result);
      
      ErrorLogger.info('Production assessment completed', {
        overallScore: result.overallScore,
        criticalIssues: result.criticalIssues,
        totalTests: result.testResults.length
      });
      
      if (result.criticalIssues === 0) {
        toast.success('Assessment Complete!', `Overall score: ${result.overallScore}% - Ready for production`);
      } else {
        toast.warning('Issues Found', `${result.criticalIssues} critical issues need attention`);
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
      // Run stress tests
      const concurrentUsersTest = await productionTester.stressTestConcurrentUsers(50);
      const rapidSubmissionsTest = await productionTester.stressTestRapidSubmissions();
      
      const stressResults = [concurrentUsersTest, rapidSubmissionsTest];
      
      if (assessment) {
        setAssessment({
          ...assessment,
          testResults: [...assessment.testResults, ...stressResults]
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
      overallScore: assessment.overallScore,
      criticalIssues: assessment.criticalIssues,
      testResults: assessment.testResults,
      performanceMetrics: assessment.performanceMetrics,
      securityValidation: assessment.securityValidation,
      recommendations: assessment.recommendations,
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
    link.download = `lumi-production-assessment-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Report Exported', 'Production assessment report downloaded');
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

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.id === category);
    if (categoryData) {
      const IconComponent = categoryData.icon;
      return <IconComponent className="w-5 h-5" />;
    }
    return <Code className="w-5 h-5" />;
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
      warnings: categoryResults.filter(r => r.status === 'warning').length
    };
  };

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
                Comprehensive testing of frontend, middleware, backend, and system-wide components
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

        {/* Overall Score */}
        {assessment && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 text-center">
              <div className={`text-4xl font-bold mb-2 ${
                assessment.overallScore >= 90 ? 'text-green-600' : 
                assessment.overallScore >= 70 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {assessment.overallScore}%
              </div>
              <p className="text-sm text-gray-600">Overall Score</p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className={`text-3xl font-bold mb-2 ${
                assessment.criticalIssues === 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {assessment.criticalIssues}
              </div>
              <p className="text-sm text-gray-600">Critical Issues</p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {assessment.testResults.filter(t => t.status === 'pass').length}
              </div>
              <p className="text-sm text-gray-600">Tests Passed</p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {assessment.performanceMetrics.loadTime.toFixed(0)}ms
              </div>
              <p className="text-sm text-gray-600">Load Time</p>
            </Card>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-8">
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
                      {stats.passed}/{stats.total}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Test Results */}
        {assessment && (
          <div className="space-y-6">
            {/* Performance Metrics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                Performance Metrics
              </h3>
              
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-1 ${
                    assessment.performanceMetrics.loadTime < 2000 ? 'text-green-600' : 
                    assessment.performanceMetrics.loadTime < 3000 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {assessment.performanceMetrics.loadTime.toFixed(0)}ms
                  </div>
                  <p className="text-sm text-gray-600">Load Time</p>
                </div>
                
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-1 ${
                    assessment.performanceMetrics.apiLatency < 500 ? 'text-green-600' : 
                    assessment.performanceMetrics.apiLatency < 1000 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {assessment.performanceMetrics.apiLatency}ms
                  </div>
                  <p className="text-sm text-gray-600">API Latency</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {assessment.performanceMetrics.memoryUsage}MB
                  </div>
                  <p className="text-sm text-gray-600">Memory Usage</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {assessment.performanceMetrics.bundleSize}MB
                  </div>
                  <p className="text-sm text-gray-600">Bundle Size</p>
                </div>
              </div>
            </Card>

            {/* Security Validation */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                Security Validation
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(assessment.securityValidation).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    <span className={`font-medium ${value ? 'text-green-600' : 'text-red-600'}`}>
                      {value ? '✓ Secure' : '✗ Needs Attention'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Critical Issues */}
            {assessment.criticalIssues > 0 && (
              <Card className="p-6 bg-red-50 border-red-200">
                <div className="flex items-start space-x-4">
                  <XCircle className="w-6 h-6 text-red-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-900 mb-2">
                      Critical Issues Found ({assessment.criticalIssues})
                    </h3>
                    <p className="text-red-800 mb-4">
                      These issues must be resolved before production launch.
                    </p>
                    <div className="space-y-2">
                      {assessment.recommendations.critical.map((issue, index) => (
                        <div key={index} className="text-sm text-red-700">
                          • {issue}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Test Results by Category */}
            <Card className="p-6">
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
                    Re-run Tests
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {getFilteredResults().map((result) => (
                  <div key={result.id} className="flex items-start justify-between p-4 bg-[#F8F6F4] rounded-xl">
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
                        <p className="text-xs text-gray-500">
                          {result.details}
                        </p>
                        {result.timestamp && (
                          <p className="text-xs text-gray-400 mt-1">
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
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer">
                            Metrics
                          </summary>
                          <div className="text-xs text-gray-600 mt-1">
                            {Object.entries(result.metrics).map(([key, value]) => (
                              <div key={key}>
                                {key}: {typeof value === 'boolean' ? (value ? '✓' : '✗') : value}
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recommendations */}
            {assessment.recommendations && (
              <div className="grid md:grid-cols-3 gap-6">
                {/* Critical Issues */}
                {assessment.recommendations.critical.length > 0 && (
                  <Card className="p-6">
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
                  <Card className="p-6">
                    <h4 className="font-semibold text-yellow-900 mb-4">
                      ⚠️ Recommended Improvements
                    </h4>
                    <ul className="space-y-2">
                      {assessment.recommendations.improvements.slice(0, 5).map((item, index) => (
                        <li key={index} className="text-sm text-yellow-800">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
                
                {/* Monitoring */}
                <Card className="p-6">
                  <h4 className="font-semibold text-blue-900 mb-4">
                    📊 Monitoring Setup
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

            {/* Stress Testing Results */}
            {assessment.testResults.some(t => t.id.includes('stress')) && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                  Stress Testing Results
                </h3>
                
                <div className="space-y-4">
                  {assessment.testResults
                    .filter(t => t.id.includes('stress'))
                    .map((result) => (
                      <div key={result.id} className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-blue-900">{result.name}</h4>
                          <span className={`text-sm font-medium ${
                            result.status === 'pass' ? 'text-green-600' :
                            result.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {result.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-blue-800">{result.details}</p>
                        {result.metrics && (
                          <div className="mt-2 text-xs text-blue-700">
                            {Object.entries(result.metrics).map(([key, value]) => (
                              <span key={key} className="mr-4">
                                {key}: {typeof value === 'number' ? value.toFixed(1) : value.toString()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Initial State */}
        {!assessment && !testing && (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Play className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">
              Ready to Test Production Readiness
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              This comprehensive assessment will test frontend functionality, middleware APIs, 
              backend data integrity, security measures, performance metrics, and system-wide workflows.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-[#1A1A1A]">Frontend</p>
                <p className="text-xs text-gray-600">UI/UX, Forms, Navigation</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-[#1A1A1A]">Middleware</p>
                <p className="text-xs text-gray-600">APIs, Auth, Business Logic</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-[#1A1A1A]">Backend</p>
                <p className="text-xs text-gray-600">Database, Security, Scaling</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-sm font-medium text-[#1A1A1A]">System-Wide</p>
                <p className="text-xs text-gray-600">Workflows, Monitoring</p>
              </div>
            </div>
            
            <Button
              onClick={runCompleteAssessment}
              size="lg"
              icon={Play}
              className="px-12"
            >
              Start Production Assessment
            </Button>
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
            <p className="text-gray-600">
              Testing frontend, middleware, backend, security, and performance layers
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};