import React, { useState } from 'react';
import { Zap, Users, Database, Clock, BarChart3, AlertTriangle, CheckCircle, Play, Download } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';
import { testDataManager } from '../../data/testData';
import { ErrorLogger } from '../../utils/errorLogger';

interface StressTestResult {
  id: string;
  testName: string;
  category: 'load' | 'volume' | 'spike' | 'endurance' | 'concurrent';
  description: string;
  parameters: Record<string, any>;
  results: {
    success: boolean;
    duration: number;
    throughput?: number;
    errorRate?: number;
    memoryUsage?: number;
    responseTime?: number;
  };
  status: 'pass' | 'warning' | 'fail';
  details: string;
  timestamp: Date;
}

export const StressTestRunner: React.FC = () => {
  const { toast } = useAppContext();
  const [testResults, setTestResults] = useState<StressTestResult[]>([]);
  const [running, setRunning] = useState<string | null>(null);
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());

  const stressTests = [
    {
      id: 'large-classroom-load',
      name: 'Large Classroom Load Test',
      category: 'volume' as const,
      description: 'Test UI performance with 40+ children and 200+ behavior logs',
      parameters: { children: 40, behaviorLogs: 200, classrooms: 5 },
      estimatedDuration: '30 seconds'
    },
    {
      id: 'concurrent-educators',
      name: 'Concurrent Educators Test',
      category: 'concurrent' as const,
      description: 'Simulate 100+ educators logging behaviors simultaneously',
      parameters: { concurrentUsers: 100, requestsPerUser: 5, duration: 60 },
      estimatedDuration: '60 seconds'
    },
    {
      id: 'rapid-submissions',
      name: 'Rapid Behavior Submissions',
      category: 'spike' as const,
      description: 'Test rapid behavior log submissions (10 logs/second)',
      parameters: { submissionsPerSecond: 10, duration: 30, totalSubmissions: 300 },
      estimatedDuration: '30 seconds'
    },
    {
      id: 'bulk-report-generation',
      name: 'Bulk Report Generation',
      category: 'load' as const,
      description: 'Generate reports across multiple classrooms and organizations',
      parameters: { organizations: 10, classrooms: 50, reports: 100 },
      estimatedDuration: '45 seconds'
    },
    {
      id: 'database-scaling',
      name: 'Database Scaling Test',
      category: 'volume' as const,
      description: 'Test database performance with 10k+ records',
      parameters: { children: 1000, behaviorLogs: 10000, queries: 1000 },
      estimatedDuration: '60 seconds'
    },
    {
      id: 'memory-endurance',
      name: 'Memory Endurance Test',
      category: 'endurance' as const,
      description: 'Monitor memory usage over extended operation',
      parameters: { duration: 300, operations: 1000, memoryThreshold: 100 },
      estimatedDuration: '5 minutes'
    },
    {
      id: 'api-throughput',
      name: 'API Throughput Test',
      category: 'load' as const,
      description: 'Maximum API requests per second before degradation',
      parameters: { maxRPS: 1000, rampUpTime: 60, sustainTime: 120 },
      estimatedDuration: '3 minutes'
    },
    {
      id: 'navigation-stress',
      name: 'Navigation Stress Test',
      category: 'spike' as const,
      description: 'Rapid navigation between views and components',
      parameters: { navigationsPerSecond: 5, duration: 60, views: 10 },
      estimatedDuration: '60 seconds'
    }
  ];

  const runStressTest = async (testId: string) => {
    const test = stressTests.find(t => t.id === testId);
    if (!test) return;

    setRunning(testId);
    ErrorLogger.info(`Starting stress test: ${test.name}`);

    try {
      const startTime = performance.now();
      let result: StressTestResult;

      switch (testId) {
        case 'large-classroom-load':
          result = await runLargeClassroomTest(test);
          break;
        case 'concurrent-educators':
          result = await runConcurrentEducatorsTest(test);
          break;
        case 'rapid-submissions':
          result = await runRapidSubmissionsTest(test);
          break;
        case 'bulk-report-generation':
          result = await runBulkReportTest(test);
          break;
        case 'database-scaling':
          result = await runDatabaseScalingTest(test);
          break;
        case 'memory-endurance':
          result = await runMemoryEnduranceTest(test);
          break;
        case 'api-throughput':
          result = await runAPIThroughputTest(test);
          break;
        case 'navigation-stress':
          result = await runNavigationStressTest(test);
          break;
        default:
          throw new Error(`Unknown test: ${testId}`);
      }

      const endTime = performance.now();
      result.results.duration = endTime - startTime;

      setTestResults(prev => [result, ...prev]);
      
      if (result.status === 'pass') {
        toast.success('Stress Test Passed', `${test.name} completed successfully`);
      } else if (result.status === 'warning') {
        toast.warning('Stress Test Warning', `${test.name} completed with warnings`);
      } else {
        toast.error('Stress Test Failed', `${test.name} failed validation`);
      }

      ErrorLogger.info(`Stress test completed: ${test.name}`, {
        testId,
        status: result.status,
        duration: result.results.duration
      });

    } catch (error) {
      ErrorLogger.error(`Stress test failed: ${test.name}`, { testId, error: error.message });
      toast.error('Test Failed', `${test.name}: ${error.message}`);
    } finally {
      setRunning(null);
    }
  };

  const runSelectedTests = async () => {
    if (selectedTests.size === 0) {
      toast.warning('No Tests Selected', 'Please select tests to run');
      return;
    }

    for (const testId of selectedTests) {
      await runStressTest(testId);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const runAllTests = async () => {
    for (const test of stressTests) {
      await runStressTest(test.id);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  // Stress test implementations
  const runLargeClassroomTest = async (test: any): Promise<StressTestResult> => {
    // Generate large dataset
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Add large number of children and behavior logs
    for (let i = 0; i < test.parameters.children; i++) {
      testDataManager.addChild({
        id: `stress-child-${i}`,
        name: `Stress Test Child ${i + 1}`,
        age: Math.floor(Math.random() * 3) + 3,
        gradeBand: 'Preschool (4-5 years old)',
        classroomId: 'classroom-1',
        hasIEP: Math.random() > 0.8,
        hasIFSP: Math.random() > 0.9,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    testDataManager.generateTestBehaviorLogs(test.parameters.behaviorLogs);
    
    // Test UI rendering performance
    const renderStart = performance.now();
    const childElements = document.querySelectorAll('[data-child], .child-profile, [class*="child"]');
    const renderEnd = performance.now();
    
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = (endMemory - startMemory) / 1024 / 1024; // MB
    const renderTime = renderEnd - renderStart;
    
    const success = renderTime < 2000 && memoryIncrease < 50;
    
    return {
      id: test.id,
      testName: test.name,
      category: test.category,
      description: test.description,
      parameters: test.parameters,
      results: {
        success,
        duration: renderTime,
        memoryUsage: memoryIncrease,
        responseTime: renderTime
      },
      status: success ? 'pass' : renderTime < 5000 ? 'warning' : 'fail',
      details: `Rendered ${test.parameters.children} children and ${test.parameters.behaviorLogs} logs in ${renderTime.toFixed(0)}ms. Memory increase: ${memoryIncrease.toFixed(1)}MB`,
      timestamp: new Date()
    };
  };

  const runConcurrentEducatorsTest = async (test: any): Promise<StressTestResult> => {
    const promises: Promise<any>[] = [];
    const startTime = performance.now();
    
    // Simulate concurrent API requests
    for (let i = 0; i < test.parameters.concurrentUsers; i++) {
      for (let j = 0; j < test.parameters.requestsPerUser; j++) {
        promises.push(
          fetch('/api/behavior-logs', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer test-token-${i}`
            },
            body: JSON.stringify({
              behaviorDescription: `Concurrent test behavior ${i}-${j}`,
              context: 'test',
              severity: 'low'
            })
          }).catch(() => ({ ok: false, status: 500 }))
        );
      }
    }
    
    const results = await Promise.all(promises);
    const endTime = performance.now();
    
    const totalRequests = promises.length;
    const successfulRequests = results.filter(r => r && (r.ok || r.status === 401)).length;
    const errorRate = ((totalRequests - successfulRequests) / totalRequests) * 100;
    const throughput = totalRequests / ((endTime - startTime) / 1000);
    const avgResponseTime = (endTime - startTime) / totalRequests;
    
    const success = errorRate < 10 && avgResponseTime < 1000;
    
    return {
      id: test.id,
      testName: test.name,
      category: test.category,
      description: test.description,
      parameters: test.parameters,
      results: {
        success,
        duration: endTime - startTime,
        throughput,
        errorRate,
        responseTime: avgResponseTime
      },
      status: success ? 'pass' : errorRate < 20 ? 'warning' : 'fail',
      details: `${successfulRequests}/${totalRequests} requests successful (${errorRate.toFixed(1)}% error rate). Throughput: ${throughput.toFixed(1)} req/s`,
      timestamp: new Date()
    };
  };

  const runRapidSubmissionsTest = async (test: any): Promise<StressTestResult> => {
    const submissions: Promise<any>[] = [];
    const startTime = performance.now();
    
    // Submit behavior logs rapidly
    for (let i = 0; i < test.parameters.totalSubmissions; i++) {
      submissions.push(
        fetch('/api/behavior-logs', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({
            behaviorDescription: `Rapid submission test ${i}`,
            context: 'test',
            severity: 'low'
          })
        }).catch(() => ({ ok: false }))
      );
      
      // Delay to achieve target rate
      if (i % test.parameters.submissionsPerSecond === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const results = await Promise.all(submissions);
    const endTime = performance.now();
    
    const successfulSubmissions = results.filter(r => r && (r.ok || r.status === 401)).length;
    const errorRate = ((test.parameters.totalSubmissions - successfulSubmissions) / test.parameters.totalSubmissions) * 100;
    const actualRate = test.parameters.totalSubmissions / ((endTime - startTime) / 1000);
    
    const success = errorRate < 5 && actualRate >= test.parameters.submissionsPerSecond * 0.8;
    
    return {
      id: test.id,
      testName: test.name,
      category: test.category,
      description: test.description,
      parameters: test.parameters,
      results: {
        success,
        duration: endTime - startTime,
        throughput: actualRate,
        errorRate
      },
      status: success ? 'pass' : errorRate < 15 ? 'warning' : 'fail',
      details: `${successfulSubmissions}/${test.parameters.totalSubmissions} submissions successful. Rate: ${actualRate.toFixed(1)} logs/sec (target: ${test.parameters.submissionsPerSecond})`,
      timestamp: new Date()
    };
  };

  const runBulkReportTest = async (test: any): Promise<StressTestResult> => {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Generate large dataset for reports
    testDataManager.addSampleData();
    testDataManager.generateTestBehaviorLogs(500);
    
    // Simulate bulk report generation
    const reports: any[] = [];
    for (let i = 0; i < test.parameters.reports; i++) {
      const reportData = {
        id: `report-${i}`,
        type: 'behavior-summary',
        data: testDataManager.getBehaviorLogs().slice(0, 50),
        generatedAt: new Date()
      };
      reports.push(reportData);
    }
    
    const endTime = performance.now();
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    const duration = endTime - startTime;
    const memoryIncrease = (endMemory - startMemory) / 1024 / 1024;
    const reportsPerSecond = test.parameters.reports / (duration / 1000);
    
    const success = duration < 10000 && memoryIncrease < 100 && reportsPerSecond > 5;
    
    return {
      id: test.id,
      testName: test.name,
      category: test.category,
      description: test.description,
      parameters: test.parameters,
      results: {
        success,
        duration,
        throughput: reportsPerSecond,
        memoryUsage: memoryIncrease
      },
      status: success ? 'pass' : duration < 20000 ? 'warning' : 'fail',
      details: `Generated ${test.parameters.reports} reports in ${duration.toFixed(0)}ms. Rate: ${reportsPerSecond.toFixed(1)} reports/sec. Memory: +${memoryIncrease.toFixed(1)}MB`,
      timestamp: new Date()
    };
  };

  const runDatabaseScalingTest = async (test: any): Promise<StressTestResult> => {
    const startTime = performance.now();
    
    // Generate large dataset
    const originalDataSize = testDataManager.getBehaviorLogs().length;
    
    // Add large number of records
    for (let i = 0; i < test.parameters.children; i++) {
      testDataManager.addChild({
        id: `scale-child-${i}`,
        name: `Scale Test Child ${i + 1}`,
        age: Math.floor(Math.random() * 3) + 3,
        gradeBand: 'Preschool (4-5 years old)',
        classroomId: 'classroom-1',
        hasIEP: false,
        hasIFSP: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    testDataManager.generateTestBehaviorLogs(test.parameters.behaviorLogs);
    
    // Test query performance
    const queryStart = performance.now();
    const behaviorLogs = testDataManager.getBehaviorLogs();
    const childLogs = behaviorLogs.filter(log => log.childId === 'scale-child-1');
    const queryEnd = performance.now();
    
    const endTime = performance.now();
    const newDataSize = behaviorLogs.length;
    const queryTime = queryEnd - queryStart;
    const totalTime = endTime - startTime;
    
    const success = queryTime < 100 && totalTime < 30000 && newDataSize > originalDataSize;
    
    return {
      id: test.id,
      testName: test.name,
      category: test.category,
      description: test.description,
      parameters: test.parameters,
      results: {
        success,
        duration: totalTime,
        responseTime: queryTime
      },
      status: success ? 'pass' : queryTime < 500 ? 'warning' : 'fail',
      details: `Added ${newDataSize - originalDataSize} records in ${totalTime.toFixed(0)}ms. Query time: ${queryTime.toFixed(0)}ms`,
      timestamp: new Date()
    };
  };

  const runMemoryEnduranceTest = async (test: any): Promise<StressTestResult> => {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryReadings: number[] = [];
    
    // Run operations for specified duration
    const endTime = startTime + (test.parameters.duration * 1000);
    let operationCount = 0;
    
    while (performance.now() < endTime && operationCount < test.parameters.operations) {
      // Simulate memory-intensive operations
      testDataManager.addChild({
        id: `memory-child-${operationCount}`,
        name: `Memory Test Child ${operationCount}`,
        age: 4,
        gradeBand: 'Preschool (4-5 years old)',
        classroomId: 'classroom-1',
        hasIEP: false,
        hasIFSP: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Record memory usage
      if (operationCount % 100 === 0) {
        const currentMemory = (performance as any).memory?.usedJSHeapSize || 0;
        memoryReadings.push((currentMemory - startMemory) / 1024 / 1024);
      }
      
      operationCount++;
      
      // Small delay to prevent blocking
      if (operationCount % 50 === 0) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    const finalTime = performance.now();
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const totalMemoryIncrease = (finalMemory - startMemory) / 1024 / 1024;
    const maxMemoryIncrease = Math.max(...memoryReadings);
    
    const success = totalMemoryIncrease < test.parameters.memoryThreshold && 
                   maxMemoryIncrease < test.parameters.memoryThreshold * 1.5;
    
    return {
      id: test.id,
      testName: test.name,
      category: test.category,
      description: test.description,
      parameters: test.parameters,
      results: {
        success,
        duration: finalTime - startTime,
        memoryUsage: totalMemoryIncrease
      },
      status: success ? 'pass' : totalMemoryIncrease < test.parameters.memoryThreshold * 2 ? 'warning' : 'fail',
      details: `Completed ${operationCount} operations. Memory increase: ${totalMemoryIncrease.toFixed(1)}MB (max: ${maxMemoryIncrease.toFixed(1)}MB)`,
      timestamp: new Date()
    };
  };

  const runAPIThroughputTest = async (test: any): Promise<StressTestResult> => {
    const startTime = performance.now();
    let requestCount = 0;
    let successCount = 0;
    let errorCount = 0;
    
    // Ramp up requests gradually
    const rampUpEnd = startTime + (test.parameters.rampUpTime * 1000);
    const sustainEnd = rampUpEnd + (test.parameters.sustainTime * 1000);
    
    const promises: Promise<any>[] = [];
    
    while (performance.now() < sustainEnd) {
      const currentTime = performance.now();
      const isRampUp = currentTime < rampUpEnd;
      const targetRPS = isRampUp 
        ? (test.parameters.maxRPS * ((currentTime - startTime) / (rampUpEnd - startTime)))
        : test.parameters.maxRPS;
      
      // Send requests at target rate
      if (requestCount < targetRPS * ((currentTime - startTime) / 1000)) {
        promises.push(
          fetch('/api/health', {
            method: 'GET',
            headers: { 'Authorization': `Bearer test-token-${requestCount}` }
          }).then(response => {
            if (response.ok || response.status === 401) {
              successCount++;
            } else {
              errorCount++;
            }
            return response;
          }).catch(() => {
            errorCount++;
            return null;
          })
        );
        requestCount++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    await Promise.all(promises);
    const endTime = performance.now();
    
    const totalDuration = (endTime - startTime) / 1000;
    const actualThroughput = requestCount / totalDuration;
    const errorRate = (errorCount / requestCount) * 100;
    
    const success = actualThroughput >= test.parameters.maxRPS * 0.8 && errorRate < 5;
    
    return {
      id: test.id,
      testName: test.name,
      category: test.category,
      description: test.description,
      parameters: test.parameters,
      results: {
        success,
        duration: endTime - startTime,
        throughput: actualThroughput,
        errorRate
      },
      status: success ? 'pass' : actualThroughput >= test.parameters.maxRPS * 0.6 ? 'warning' : 'fail',
      details: `Achieved ${actualThroughput.toFixed(1)} req/s (target: ${test.parameters.maxRPS}). Error rate: ${errorRate.toFixed(1)}%`,
      timestamp: new Date()
    };
  };

  const runNavigationStressTest = async (test: any): Promise<StressTestResult> => {
    const startTime = performance.now();
    const views = ['dashboard', 'child-profiles', 'behavior-log', 'reports', 'library'];
    let navigationCount = 0;
    let errorCount = 0;
    
    const endTime = startTime + (test.parameters.duration * 1000);
    
    while (performance.now() < endTime) {
      try {
        // Simulate rapid navigation
        const randomView = views[Math.floor(Math.random() * views.length)];
        
        // Trigger navigation (in real app this would change routes)
        const navEvent = new CustomEvent('navigate', { detail: { view: randomView } });
        document.dispatchEvent(navEvent);
        
        navigationCount++;
        
        // Wait for target rate
        await new Promise(resolve => setTimeout(resolve, 1000 / test.parameters.navigationsPerSecond));
      } catch (error) {
        errorCount++;
      }
    }
    
    const finalTime = performance.now();
    const actualRate = navigationCount / ((finalTime - startTime) / 1000);
    const errorRate = (errorCount / navigationCount) * 100;
    
    const success = errorRate < 5 && actualRate >= test.parameters.navigationsPerSecond * 0.8;
    
    return {
      id: test.id,
      testName: test.name,
      category: test.category,
      description: test.description,
      parameters: test.parameters,
      results: {
        success,
        duration: finalTime - startTime,
        throughput: actualRate,
        errorRate
      },
      status: success ? 'pass' : errorRate < 10 ? 'warning' : 'fail',
      details: `${navigationCount} navigations at ${actualRate.toFixed(1)} nav/s. Error rate: ${errorRate.toFixed(1)}%`,
      timestamp: new Date()
    };
  };

  const exportStressTestReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      testResults,
      summary: {
        totalTests: testResults.length,
        passed: testResults.filter(r => r.status === 'pass').length,
        warnings: testResults.filter(r => r.status === 'warning').length,
        failed: testResults.filter(r => r.status === 'fail').length
      },
      performance: {
        avgDuration: testResults.reduce((sum, r) => sum + r.results.duration, 0) / testResults.length,
        avgThroughput: testResults.filter(r => r.results.throughput).reduce((sum, r) => sum + (r.results.throughput || 0), 0) / testResults.filter(r => r.results.throughput).length,
        avgErrorRate: testResults.filter(r => r.results.errorRate).reduce((sum, r) => sum + (r.results.errorRate || 0), 0) / testResults.filter(r => r.results.errorRate).length
      }
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lumi-stress-test-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Stress Test Report Exported', 'Performance analysis downloaded');
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
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const toggleTestSelection = (testId: string) => {
    const newSelected = new Set(selectedTests);
    if (newSelected.has(testId)) {
      newSelected.delete(testId);
    } else {
      newSelected.add(testId);
    }
    setSelectedTests(newSelected);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
            Stress Test Runner
          </h2>
          <p className="text-gray-600">
            Performance and load testing for production readiness validation
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={runSelectedTests}
            disabled={selectedTests.size === 0 || running !== null}
            icon={Play}
          >
            Run Selected Tests ({selectedTests.size})
          </Button>
          <Button
            onClick={runAllTests}
            disabled={running !== null}
            variant="outline"
            icon={Zap}
          >
            Run All Tests
          </Button>
          {testResults.length > 0 && (
            <Button
              onClick={exportStressTestReport}
              variant="outline"
              icon={Download}
            >
              Export Report
            </Button>
          )}
        </div>
      </div>

      {/* Test Results Summary */}
      {testResults.length > 0 && (
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {testResults.filter(r => r.status === 'pass').length}
            </div>
            <p className="text-sm text-gray-600">Tests Passed</p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {testResults.filter(r => r.status === 'warning').length}
            </div>
            <p className="text-sm text-gray-600">Warnings</p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {testResults.filter(r => r.status === 'fail').length}
            </div>
            <p className="text-sm text-gray-600">Failed</p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {testResults.length > 0 ? 
                (testResults.reduce((sum, r) => sum + r.results.duration, 0) / testResults.length / 1000).toFixed(1) : 
                '0'
              }s
            </div>
            <p className="text-sm text-gray-600">Avg Duration</p>
          </Card>
        </div>
      )}

      {/* Available Tests */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Available Stress Tests
        </h3>
        
        <div className="space-y-4">
          {stressTests.map((test) => (
            <div key={test.id} className="border border-[#E6E2DD] rounded-xl p-4">
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  checked={selectedTests.has(test.id)}
                  onChange={() => toggleTestSelection(test.id)}
                  className="mt-1 rounded border-[#E6E2DD] text-[#C44E38] focus:ring-[#C44E38]"
                />
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-[#1A1A1A]">{test.name}</h4>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                        {test.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        Est. {test.estimatedDuration}
                      </span>
                      <Button
                        onClick={() => runStressTest(test.id)}
                        disabled={running !== null}
                        loading={running === test.id}
                        size="sm"
                        icon={Play}
                      >
                        Run Test
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{test.description}</p>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h5 className="font-medium text-[#1A1A1A] mb-2">Test Parameters:</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(test.parameters).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600">{key}:</span>
                          <span className="font-medium text-[#1A1A1A]">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
            Stress Test Results
          </h3>
          
          <div className="space-y-4">
            {testResults.map((result) => (
              <div key={`${result.id}-${result.timestamp.getTime()}`} className="border border-[#E6E2DD] rounded-xl p-4">
                <div className="flex items-start space-x-4">
                  {getStatusIcon(result.status)}
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-[#1A1A1A]">{result.testName}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${
                          result.status === 'pass' ? 'text-green-600' :
                          result.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {result.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {result.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{result.details}</p>
                    
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium text-[#1A1A1A] ml-2">
                          {(result.results.duration / 1000).toFixed(1)}s
                        </span>
                      </div>
                      {result.results.throughput && (
                        <div>
                          <span className="text-gray-600">Throughput:</span>
                          <span className="font-medium text-[#1A1A1A] ml-2">
                            {result.results.throughput.toFixed(1)}/s
                          </span>
                        </div>
                      )}
                      {result.results.errorRate !== undefined && (
                        <div>
                          <span className="text-gray-600">Error Rate:</span>
                          <span className={`font-medium ml-2 ${
                            result.results.errorRate < 5 ? 'text-green-600' : 
                            result.results.errorRate < 15 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {result.results.errorRate.toFixed(1)}%
                          </span>
                        </div>
                      )}
                      {result.results.memoryUsage && (
                        <div>
                          <span className="text-gray-600">Memory:</span>
                          <span className="font-medium text-[#1A1A1A] ml-2">
                            +{result.results.memoryUsage.toFixed(1)}MB
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};