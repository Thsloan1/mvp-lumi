import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Shield, 
  Zap, 
  Monitor, 
  Database,
  Globe,
  Users,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { productionTester, ProductionAssessment, TestResult } from '../../utils/productionReadinessAssessor';

export const ProductionDashboard: React.FC = () => {
  const [assessment, setAssessment] = useState<ProductionAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  useEffect(() => {
    runAssessment();
  }, []);

  const runAssessment = async () => {
    setLoading(true);
    try {
      const result = await productionTester.runFullAssessment();
      setAssessment(result);
    } catch (error) {
      console.error('Assessment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pass': return 'bg-green-50 border-green-200 text-green-800';
      case 'fail': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getCategoryIcon = (category: TestResult['category']) => {
    switch (category) {
      case 'frontend': return <Globe className="w-4 h-4" />;
      case 'middleware': return <Settings className="w-4 h-4" />;
      case 'backend': return <Database className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'performance': return <Zap className="w-4 h-4" />;
      case 'system': return <Monitor className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const filteredTests = assessment?.testResults.filter(test => 
    selectedCategory === 'all' || test.category === selectedCategory
  ) || [];

  const categoryStats = assessment?.testResults.reduce((acc, test) => {
    if (!acc[test.category]) {
      acc[test.category] = { pass: 0, fail: 0, warning: 0, total: 0 };
    }
    acc[test.category][test.status]++;
    acc[test.category].total++;
    return acc;
  }, {} as Record<string, { pass: number; fail: number; warning: number; total: number }>) || {};

  const exportReport = () => {
    if (!assessment) return;
    
    const report = {
      timestamp: new Date().toISOString(),
      overallScore: assessment.overallScore,
      criticalIssues: assessment.criticalIssues,
      testResults: assessment.testResults,
      performanceMetrics: assessment.performanceMetrics,
      securityValidation: assessment.securityValidation,
      recommendations: assessment.recommendations
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumi-production-assessment-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F6F4] flex items-center justify-center">
        <Card className="p-8 text-center bg-white border-[#E6E2DD]">
          <RefreshCw className="w-12 h-12 text-[#C44E38] mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Running Production Assessment</h2>
          <p className="text-[#615E59]">Testing frontend, middleware, backend, and system integration...</p>
        </Card>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-[#F8F6F4] flex items-center justify-center">
        <Card className="p-8 text-center bg-white border-[#E6E2DD]">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Assessment Failed</h2>
          <p className="text-[#615E59] mb-6">Unable to complete production readiness assessment.</p>
          <Button onClick={runAssessment} className="bg-[#C44E38] hover:bg-[#A63D2A] text-white">
            Retry Assessment
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F4]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
                Production Readiness Assessment
              </h1>
              <p className="text-[#615E59]">
                Comprehensive testing of new child profile features and system integration
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={runAssessment}
                icon={RefreshCw}
                variant="outline"
                className="border-[#E6E2DD] text-[#615E59] hover:border-[#C44E38] hover:text-[#C44E38]"
              >
                Refresh
              </Button>
              <Button
                onClick={exportReport}
                icon={Download}
                className="bg-[#C44E38] hover:bg-[#A63D2A] text-white"
              >
                Export Report
              </Button>
            </div>
          </div>

          {/* Overall Score */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-white border-[#E6E2DD] shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#615E59] mb-1">Overall Score</p>
                  <p className="text-3xl font-bold text-[#1A1A1A]">{assessment.overallScore}%</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  assessment.overallScore >= 80 ? 'bg-green-100' :
                  assessment.overallScore >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <BarChart3 className={`w-6 h-6 ${
                    assessment.overallScore >= 80 ? 'text-green-600' :
                    assessment.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white border-[#E6E2DD] shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#615E59] mb-1">Critical Issues</p>
                  <p className="text-3xl font-bold text-red-600">{assessment.criticalIssues}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white border-[#E6E2DD] shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#615E59] mb-1">Tests Passed</p>
                  <p className="text-3xl font-bold text-green-600">
                    {assessment.testResults.filter(t => t.status === 'pass').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white border-[#E6E2DD] shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#615E59] mb-1">Load Time</p>
                  <p className="text-3xl font-bold text-[#1A1A1A]">
                    {assessment.performanceMetrics.loadTime.toFixed(0)}ms
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Test Results */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white border-[#E6E2DD] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-[#1A1A1A]">Test Results</h3>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-[#E6E2DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C44E38] focus:border-[#C44E38]"
                >
                  <option value="all">All Categories</option>
                  <option value="frontend">Frontend</option>
                  <option value="middleware">Middleware</option>
                  <option value="backend">Backend</option>
                  <option value="security">Security</option>
                  <option value="performance">Performance</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div className="space-y-4">
                {filteredTests.map((test) => (
                  <div
                    key={test.id}
                    className={`p-4 rounded-xl border ${getStatusColor(test.status)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getStatusIcon(test.status)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {getCategoryIcon(test.category)}
                            <h4 className="font-semibold">{test.name}</h4>
                            {test.critical && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                Critical
                              </span>
                            )}
                          </div>
                          <p className="text-sm mb-2">{test.description}</p>
                          <p className="text-xs opacity-75">{test.details}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Eye}
                        onClick={() => setShowDetails(showDetails === test.id ? null : test.id)}
                        className="ml-2"
                      >
                        Details
                      </Button>
                    </div>
                    
                    {showDetails === test.id && test.metrics && (
                      <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                        <h5 className="font-medium mb-2">Metrics:</h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(test.metrics).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="opacity-75">{key}:</span>
                              <span className="font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category Breakdown */}
            <Card className="p-6 bg-white border-[#E6E2DD] shadow-sm">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Category Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(categoryStats).map(([category, stats]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(category as TestResult['category'])}
                        <span className="text-sm font-medium text-[#1A1A1A] capitalize">
                          {category}
                        </span>
                      </div>
                      <span className="text-sm text-[#615E59]">
                        {stats.pass}/{stats.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(stats.pass / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Security Validation */}
            <Card className="p-6 bg-white border-[#E6E2DD] shadow-sm">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Security Validation</h3>
              <div className="space-y-3">
                {Object.entries(assessment.securityValidation).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-[#615E59] capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    {value ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Performance Metrics */}
            <Card className="p-6 bg-white border-[#E6E2DD] shadow-sm">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Performance Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-[#615E59]">Load Time</span>
                  <span className="text-sm font-medium text-[#1A1A1A]">
                    {assessment.performanceMetrics.loadTime.toFixed(0)}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#615E59]">API Latency</span>
                  <span className="text-sm font-medium text-[#1A1A1A]">
                    {assessment.performanceMetrics.apiLatency}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#615E59]">Memory Usage</span>
                  <span className="text-sm font-medium text-[#1A1A1A]">
                    {assessment.performanceMetrics.memoryUsage}MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#615E59]">Bundle Size</span>
                  <span className="text-sm font-medium text-[#1A1A1A]">
                    {assessment.performanceMetrics.bundleSize}MB
                  </span>
                </div>
              </div>
            </Card>

            {/* Recommendations */}
            <Card className="p-6 bg-gradient-to-br from-[#C3D4B7] from-10% to-[#F8F6F4] border-[#C3D4B7] shadow-sm">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Recommendations</h3>
              
              {assessment.recommendations.critical.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-red-700 mb-2">Critical Issues</h4>
                  <ul className="text-xs text-red-600 space-y-1">
                    {assessment.recommendations.critical.slice(0, 3).map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {assessment.recommendations.improvements.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-yellow-700 mb-2">Improvements</h4>
                  <ul className="text-xs text-yellow-600 space-y-1">
                    {assessment.recommendations.improvements.slice(0, 3).map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-yellow-500 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-blue-700 mb-2">Monitoring</h4>
                <ul className="text-xs text-blue-600 space-y-1">
                  {assessment.recommendations.monitoring.slice(0, 2).map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};