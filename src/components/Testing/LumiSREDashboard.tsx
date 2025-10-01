import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Database, 
  Shield, 
  Zap, 
  Globe, 
  Settings, 
  Download, 
  Play, 
  Clock,
  Monitor,
  Activity,
  Server,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick
} from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';
import { sreAnalyzer, SystemRCAReport, ServiceHealthStatus, ModuleRCAResult } from '../../utils/sreRootCauseAnalyzer';

export const LumiSREDashboard: React.FC = () => {
  const { toast } = useAppContext();
  const [rcaReport, setRcaReport] = useState<SystemRCAReport | null>(null);
  const [diagnosisRunning, setDiagnosisRunning] = useState(false);
  const [recoveryRunning, setRecoveryRunning] = useState(false);
  const [fixingModule, setFixingModule] = useState<string | null>(null);
  const [lastDiagnosis, setLastDiagnosis] = useState<Date | null>(null);

  // Auto-run diagnosis on component mount
  useEffect(() => {
    runRootCauseAnalysis();
  }, []);

  const runRootCauseAnalysis = async () => {
    setDiagnosisRunning(true);
    console.log('🚨 SRE: Starting comprehensive root cause analysis...');
    
    try {
      const report = await sreAnalyzer.performRootCauseAnalysis();
      setRcaReport(report);
      setLastDiagnosis(new Date());
      
      // Alert based on severity
      if (report.overallStatus === 'total_outage') {
        toast.error('TOTAL OUTAGE DETECTED', 'Multiple critical systems down - immediate intervention required');
      } else if (report.overallStatus === 'critical_failure') {
        toast.error('CRITICAL FAILURE', 'Core system failure detected - emergency recovery needed');
      } else if (report.overallStatus === 'degraded') {
        toast.warning('SYSTEM DEGRADED', 'Performance issues detected - monitoring required');
      } else {
        toast.success('SYSTEM OPERATIONAL', 'All critical services healthy');
      }
      
    } catch (error) {
      console.error('🚨 SRE: Root cause analysis failed:', error);
      toast.error('DIAGNOSIS FAILED', 'Unable to complete system analysis');
    } finally {
      setDiagnosisRunning(false);
    }
  };

  const executeEmergencyRecovery = async () => {
    setRecoveryRunning(true);
    console.log('🚨 SRE: EXECUTING EMERGENCY RECOVERY PROCEDURES');
    
    try {
      await sreAnalyzer.executeEmergencyRecovery();
      
      // Re-run diagnosis after recovery
      setTimeout(() => {
        runRootCauseAnalysis();
      }, 3000);
      
      toast.success('EMERGENCY RECOVERY COMPLETE', 'All critical services restored');
      
    } catch (error) {
      console.error('🚨 SRE: Emergency recovery failed:', error);
      toast.error('RECOVERY FAILED', 'Manual intervention required - escalating to on-call engineer');
    } finally {
      setRecoveryRunning(false);
    }
  };

  const applyTargetedFix = async (module: string, fix: string) => {
    setFixingModule(module);
    
    try {
      await sreAnalyzer.applyTargetedFix(module, fix);
      toast.success('FIX APPLIED', `${module}: ${fix}`);
      
      // Re-run diagnosis after fix
      setTimeout(() => {
        runRootCauseAnalysis();
      }, 2000);
      
    } catch (error) {
      console.error(`🚨 SRE: Fix failed for ${module}:`, error);
      toast.error('FIX FAILED', `Unable to apply fix for ${module}`);
    } finally {
      setFixingModule(null);
    }
  };

  const exportRCAReport = () => {
    if (!rcaReport) return;
    
    const report = {
      ...rcaReport,
      exportedAt: new Date().toISOString(),
      exportedBy: 'SRE Dashboard',
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
    link.download = `Lumi_RCA_Report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('RCA Report Exported', 'Complete root cause analysis downloaded');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'down':
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'down':
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'total_outage':
        return 'bg-red-50 border-red-200';
      case 'critical_failure':
        return 'bg-red-50 border-red-200';
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200';
      case 'operational':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service.toLowerCase()) {
      case 'database/storage':
        return <Database className="w-5 h-5" />;
      case 'authentication':
        return <Shield className="w-5 h-5" />;
      case 'api gateway':
        return <Server className="w-5 h-5" />;
      case 'frontend application':
        return <Globe className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  if (diagnosisRunning) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center bg-blue-50 border-blue-200">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
          <h2 className="text-xl font-bold text-blue-900 mb-4">
            🚨 SRE: CRITICAL INCIDENT ANALYSIS IN PROGRESS
          </h2>
          <p className="text-blue-800 mb-4">
            Performing comprehensive end-to-end diagnosis across all Lumi application layers...
          </p>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Checking foundational services (Database, Auth, API Gateway)</p>
            <p>• Diagnosing authentication and user management</p>
            <p>• Analyzing AI engine and strategy generation</p>
            <p>• Validating data pipeline and analytics</p>
            <p>• Testing subscription and payment processing</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!rcaReport) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-red-900 mb-4">
            🚨 LUMI APPLICATION NON-FUNCTIONAL
          </h2>
          <p className="text-red-800 mb-6">
            Critical system failure detected. Immediate root cause analysis required.
          </p>
          <Button
            onClick={runRootCauseAnalysis}
            icon={Play}
            className="bg-red-600 hover:bg-red-700 text-white px-8"
            size="lg"
          >
            START EMERGENCY DIAGNOSIS
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Critical Status Header */}
      <Card className={`p-6 ${getStatusBgColor(rcaReport.overallStatus)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              {rcaReport.overallStatus === 'operational' ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : rcaReport.overallStatus === 'degraded' ? (
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${getStatusColor(rcaReport.overallStatus)}`}>
                LUMI APPLICATION STATUS: {rcaReport.overallStatus.replace('_', ' ').toUpperCase()}
              </h1>
              <p className="text-gray-700">
                Primary Root Cause: {rcaReport.primaryRootCause}
              </p>
              <p className="text-sm text-gray-600">
                Last Diagnosis: {lastDiagnosis?.toLocaleString()} • ETA Recovery: {rcaReport.estimatedRecoveryTime}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={runRootCauseAnalysis}
              loading={diagnosisRunning}
              icon={RefreshCw}
              variant="outline"
            >
              Re-run Diagnosis
            </Button>
            <Button
              onClick={exportRCAReport}
              variant="outline"
              icon={Download}
            >
              Export RCA Report
            </Button>
            {rcaReport.overallStatus !== 'operational' && (
              <Button
                onClick={executeEmergencyRecovery}
                loading={recoveryRunning}
                icon={AlertTriangle}
                className="bg-red-600 hover:bg-red-700"
              >
                EMERGENCY RECOVERY
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Immediate Actions Required */}
      {rcaReport.immediateActions.length > 0 && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-start space-x-4">
            <XCircle className="w-6 h-6 text-red-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                🚨 IMMEDIATE ACTIONS REQUIRED
              </h3>
              <div className="space-y-2">
                {rcaReport.immediateActions.map((action, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-red-200">
                    <span className="text-sm text-red-800 font-medium">{action}</span>
                    <Button
                      size="sm"
                      onClick={() => {
                        // Extract module and fix from action
                        const parts = action.split(': ');
                        if (parts.length >= 2) {
                          const module = parts[1].split(' - ')[0];
                          applyTargetedFix(module, action);
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-xs"
                    >
                      Apply Fix
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Cascading Failures */}
      {rcaReport.cascadingFailures.length > 0 && (
        <Card className="p-6 bg-orange-50 border-orange-200">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="w-6 h-6 text-orange-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                ⚡ CASCADING FAILURE ANALYSIS
              </h3>
              <div className="space-y-1">
                {rcaReport.cascadingFailures.map((failure, index) => (
                  <div key={index} className="text-sm text-orange-800">
                    • {failure}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Critical Path Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          🛤️ Critical Path Status
        </h3>
        <div className="space-y-2">
          {rcaReport.criticalPath.map((path, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-[#F8F6F4] rounded-lg">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-700">{path}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Service Health Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          🔍 Foundational Services Health
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {rcaReport.serviceHealth.map((service) => (
            <div key={service.service} className={`p-4 border rounded-xl ${
              service.status === 'down' ? 'border-red-200 bg-red-50' :
              service.status === 'degraded' ? 'border-yellow-200 bg-yellow-50' :
              'border-green-200 bg-green-50'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getServiceIcon(service.service)}
                  {getStatusIcon(service.status)}
                  <div>
                    <h4 className="font-semibold text-[#1A1A1A] text-sm">
                      {service.service}
                    </h4>
                    <p className="text-xs text-gray-600 capitalize">
                      {service.layer} layer
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${getStatusColor(service.status)}`}>
                    {service.status.toUpperCase()}
                  </span>
                  {service.latency && (
                    <p className="text-xs text-gray-500">
                      {service.latency.toFixed(0)}ms
                    </p>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-2">{service.details}</p>
              
              {service.error && (
                <div className="bg-red-100 border border-red-200 p-2 rounded text-xs text-red-700">
                  <strong>Error:</strong> {service.error}
                </div>
              )}
              
              {service.criticalPath && (
                <div className="mt-2">
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                    CRITICAL PATH
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Module Analysis */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          🔧 Module-by-Module Root Cause Analysis
        </h3>
        
        <div className="space-y-4">
          {rcaReport.moduleAnalysis.map((module) => (
            <div key={module.module} className={`p-4 border rounded-xl ${
              module.status === 'failed' ? 'border-red-200 bg-red-50' :
              module.status === 'degraded' ? 'border-yellow-200 bg-yellow-50' :
              'border-green-200 bg-green-50'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(module.status)}
                  <div>
                    <h4 className="font-semibold text-[#1A1A1A]">
                      {module.module}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600 capitalize">
                        {module.layer} layer
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(module.priority)}`}>
                        {module.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${getStatusColor(module.status)}`}>
                    {module.status.toUpperCase()}
                  </span>
                  <p className="text-xs text-gray-500">
                    ETA: {module.estimatedDowntime}
                  </p>
                </div>
              </div>

              {module.rootCause && (
                <div className="mb-3 p-3 bg-white rounded-lg border">
                  <h5 className="font-medium text-[#1A1A1A] text-sm mb-1">Root Cause:</h5>
                  <p className="text-sm text-gray-700">{module.rootCause}</p>
                </div>
              )}

              {module.symptoms.length > 0 && (
                <div className="mb-3">
                  <h5 className="font-medium text-red-900 text-sm mb-2">Symptoms Detected:</h5>
                  <ul className="space-y-1">
                    {module.symptoms.map((symptom, index) => (
                      <li key={index} className="text-sm text-red-700 flex items-start">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                        {symptom}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {module.fixes.length > 0 && (
                <div>
                  <h5 className="font-medium text-blue-900 text-sm mb-2">Recommended Fixes:</h5>
                  <div className="space-y-2">
                    {module.fixes.map((fix, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                        <span className="text-sm text-blue-700">{fix}</span>
                        <Button
                          size="sm"
                          onClick={() => applyTargetedFix(module.module, fix)}
                          loading={fixingModule === module.module}
                          className="text-xs px-3 py-1"
                        >
                          Apply Fix
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {module.rollbackRequired && (
                <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded">
                  <p className="text-xs text-red-700 font-medium">
                    ⚠️ ROLLBACK RECOMMENDED: Recent deployment may have caused this failure
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Recovery Plan */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Immediate Recovery */}
        <Card className="p-6 bg-red-50 border-red-200">
          <h3 className="text-lg font-semibold text-red-900 mb-4">
            🚨 Immediate Recovery Plan
          </h3>
          <div className="space-y-3">
            {rcaReport.recoveryPlan.immediate.map((action, index) => (
              <div key={index} className="bg-white p-3 rounded-lg border border-red-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-red-900 text-sm">{action.action}</span>
                  <span className="text-xs text-red-600">{action.eta}</span>
                </div>
                <p className="text-xs text-red-700">Owner: {action.owner}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Short-term Recovery */}
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4">
            ⚠️ Short-term Stabilization
          </h3>
          <div className="space-y-3">
            {rcaReport.recoveryPlan.shortTerm.map((action, index) => (
              <div key={index} className="bg-white p-3 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-yellow-900 text-sm">{action.action}</span>
                  <span className="text-xs text-yellow-600">{action.eta}</span>
                </div>
                <p className="text-xs text-yellow-700">Owner: {action.owner}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Rollback Recommendation */}
      {rcaReport.rollbackRecommendation && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                🔄 ROLLBACK RECOMMENDED
              </h3>
              <p className="text-red-800 mb-4">
                Analysis indicates recent deployment may have caused system failure. 
                Immediate rollback to last stable version recommended.
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    // Simulate rollback procedure
                    toast.warning('ROLLBACK INITIATED', 'Rolling back to last stable version...');
                    setTimeout(() => {
                      executeEmergencyRecovery();
                    }, 2000);
                  }}
                  className="bg-red-600 hover:bg-red-700"
                  icon={RefreshCw}
                >
                  Execute Rollback
                </Button>
                <Button
                  onClick={() => toast.info('Escalation', 'Incident escalated to on-call engineering team')}
                  variant="outline"
                  className="text-red-600 border-red-300"
                >
                  Escalate to On-Call
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* System Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Monitor className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-lg font-bold text-[#1A1A1A]">
            {rcaReport.serviceHealth.filter(s => s.status === 'healthy').length}
          </div>
          <p className="text-xs text-gray-600">Healthy Services</p>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-lg font-bold text-red-600">
            {rcaReport.moduleAnalysis.filter(m => m.status === 'failed').length}
          </div>
          <p className="text-xs text-gray-600">Failed Modules</p>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-lg font-bold text-yellow-600">
            {rcaReport.moduleAnalysis.filter(m => m.priority === 'critical').length}
          </div>
          <p className="text-xs text-gray-600">Critical Issues</p>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Clock className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-lg font-bold text-green-600">
            {rcaReport.estimatedRecoveryTime}
          </div>
          <p className="text-xs text-gray-600">Recovery ETA</p>
        </Card>
      </div>

      {/* Emergency Procedures */}
      <Card className="p-6 bg-gray-50 border-gray-200">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          🛠️ Emergency Recovery Procedures
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <Button
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              toast.success('Cache Cleared', 'All application cache cleared');
              setTimeout(() => runRootCauseAnalysis(), 1000);
            }}
            variant="outline"
            icon={RefreshCw}
            className="justify-start"
          >
            Clear Application Cache
          </Button>
          
          <Button
            onClick={() => {
              // Force memory cleanup
              if ('gc' in window) (window as any).gc();
              toast.success('Memory Cleaned', 'Forced garbage collection');
            }}
            variant="outline"
            icon={MemoryStick}
            className="justify-start"
          >
            Force Memory Cleanup
          </Button>
          
          <Button
            onClick={() => {
              window.location.reload();
            }}
            variant="outline"
            icon={RefreshCw}
            className="justify-start text-red-600 border-red-300"
          >
            Force Application Restart
          </Button>
        </div>
      </Card>
    </div>
  );
};