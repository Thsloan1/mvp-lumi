import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Clock, Users, Database, Shield, Globe, Zap, BarChart3 } from 'lucide-react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';

interface ChecklistItem {
  id: string;
  category: 'frontend' | 'middleware' | 'backend' | 'security' | 'performance' | 'system';
  name: string;
  description: string;
  status: 'complete' | 'partial' | 'pending' | 'critical';
  priority: 'critical' | 'high' | 'medium' | 'low';
  testInstructions: string;
  validationCriteria: string[];
  dependencies?: string[];
}

export const ProductionChecklist: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const checklistItems: ChecklistItem[] = [
    // FRONTEND LAYER
    {
      id: 'onboarding-flows',
      category: 'frontend',
      name: 'Complete Onboarding Flows',
      description: 'All user types (educator, admin, invited) can complete onboarding end-to-end',
      status: 'complete',
      priority: 'critical',
      testInstructions: 'Test educator signup → onboarding → dashboard. Test admin signup → org setup → invite flow. Test invited user → acceptance → onboarding.',
      validationCriteria: [
        'Educator can complete 8-step onboarding wizard',
        'Admin can create organization and invite educators',
        'Invited users can accept invitations and complete setup',
        'All flows handle validation errors gracefully',
        'Progress is auto-saved at each step'
      ]
    },
    {
      id: 'form-validation',
      category: 'frontend',
      name: 'Form Validation & Error Handling',
      description: 'All forms validate inputs and show proper error messages',
      status: 'complete',
      priority: 'critical',
      testInstructions: 'Submit forms with invalid data. Test required field validation. Verify error messages are clear and actionable.',
      validationCriteria: [
        'Required fields show validation errors',
        'Email format validation works',
        'Password strength requirements enforced',
        'Error messages are user-friendly',
        'Form state persists during validation'
      ]
    },
    {
      id: 'responsive-design',
      category: 'frontend',
      name: 'Mobile/Tablet Responsiveness',
      description: 'UI works optimally on mobile, tablet, and desktop',
      status: 'complete',
      priority: 'critical',
      testInstructions: 'Test on iPhone, iPad, Android devices. Verify touch interactions, readable text, accessible buttons.',
      validationCriteria: [
        'All content readable on mobile screens',
        'Touch targets are at least 44px',
        'Navigation works on touch devices',
        'Forms are usable on mobile',
        'No horizontal scrolling required'
      ]
    },
    {
      id: 'accessibility-compliance',
      category: 'frontend',
      name: 'WCAG 2.1 AA Compliance',
      description: 'Keyboard navigation, screen readers, color contrast',
      status: 'complete',
      priority: 'critical',
      testInstructions: 'Test with keyboard only. Use screen reader. Check color contrast ratios. Verify ARIA labels.',
      validationCriteria: [
        'All interactive elements keyboard accessible',
        'Screen reader announces content correctly',
        'Color contrast meets 4.5:1 ratio',
        'Focus indicators visible and clear',
        'Skip links available for navigation'
      ]
    },
    {
      id: 'cross-browser-compatibility',
      category: 'frontend',
      name: 'Cross-Browser Compatibility',
      description: 'Works on Chrome, Edge, Safari, Firefox',
      status: 'complete',
      priority: 'high',
      testInstructions: 'Test core functionality on Chrome, Edge, Safari, Firefox. Verify consistent behavior.',
      validationCriteria: [
        'Core features work in all major browsers',
        'CSS renders consistently',
        'JavaScript functions properly',
        'No browser-specific errors',
        'Performance acceptable across browsers'
      ]
    },

    // MIDDLEWARE LAYER
    {
      id: 'authentication-endpoints',
      category: 'middleware',
      name: 'Authentication & Authorization',
      description: 'Role-based access with secure authentication',
      status: 'complete',
      priority: 'critical',
      testInstructions: 'Test login/logout, role permissions, token validation, OAuth flows.',
      validationCriteria: [
        'JWT tokens properly validated',
        'Role-based access enforced',
        'OAuth integration works',
        'Session management secure',
        'Password policies enforced'
      ]
    },
    {
      id: 'crud-operations',
      category: 'middleware',
      name: 'CRUD Operations',
      description: 'Children, classrooms, behavior logs CRUD works',
      status: 'complete',
      priority: 'critical',
      testInstructions: 'Create, read, update, delete child profiles, classrooms, behavior logs. Verify data persistence.',
      validationCriteria: [
        'All CRUD operations work correctly',
        'Data validation on create/update',
        'Proper error handling for failures',
        'Audit trails for all changes',
        'Data relationships maintained'
      ]
    },
    {
      id: 'ai-strategy-generation',
      category: 'middleware',
      name: 'AI Strategy Generation',
      description: 'Child and classroom strategy endpoints work',
      status: 'complete',
      priority: 'critical',
      testInstructions: 'Submit behavior descriptions. Verify AI generates appropriate strategies. Test edge cases.',
      validationCriteria: [
        'Strategies generated for all behavior types',
        'Response time under 5 seconds',
        'Strategies are contextually appropriate',
        'Error handling for AI failures',
        'Fallback strategies available'
      ]
    },
    {
      id: 'api-performance',
      category: 'middleware',
      name: 'API Performance (P95 < 500ms)',
      description: 'Core API endpoints respond within performance targets',
      status: 'complete',
      priority: 'high',
      testInstructions: 'Load test APIs with 100+ concurrent requests. Measure P95 response times.',
      validationCriteria: [
        'P95 response time under 500ms',
        'No timeouts under normal load',
        'Graceful degradation under stress',
        'Error rates under 1%',
        'Memory usage stable'
      ]
    },
    {
      id: 'concurrent-users',
      category: 'middleware',
      name: 'Concurrent Users (100+ educators)',
      description: 'System handles multiple concurrent educators',
      status: 'partial',
      priority: 'high',
      testInstructions: 'Simulate 100+ educators logging behaviors simultaneously. Monitor system performance.',
      validationCriteria: [
        'System handles 100+ concurrent users',
        'No data corruption under load',
        'Response times remain acceptable',
        'Error rates under 5%',
        'Database connections managed properly'
      ]
    },

    // BACKEND LAYER
    {
      id: 'database-schema',
      category: 'backend',
      name: 'Database Schema & Relationships',
      description: 'All tables, relationships, and constraints work',
      status: 'complete',
      priority: 'critical',
      testInstructions: 'Verify all tables exist. Test foreign key constraints. Validate data types and indexes.',
      validationCriteria: [
        'All required tables exist',
        'Foreign key relationships enforced',
        'Data types appropriate for fields',
        'Indexes on frequently queried columns',
        'Constraints prevent invalid data'
      ]
    },
    {
      id: 'data-encryption',
      category: 'backend',
      name: 'Data Encryption (Sensitive Fields)',
      description: 'Sensitive data encrypted at rest and in transit',
      status: 'complete',
      priority: 'critical',
      testInstructions: 'Verify behavioral descriptions, developmental notes encrypted. Test encryption/decryption.',
      validationCriteria: [
        'Sensitive fields encrypted in database',
        'Encryption/decryption works correctly',
        'Key management implemented',
        'HTTPS enforced for all traffic',
        'No sensitive data in logs'
      ]
    },
    {
      id: 'large-dataset-scaling',
      category: 'backend',
      name: 'Large Dataset Handling (10k+ records)',
      description: 'Database handles large datasets efficiently',
      status: 'partial',
      priority: 'high',
      testInstructions: 'Load 10k+ child records and 100k+ behavior logs. Test query performance and memory usage.',
      validationCriteria: [
        'Queries remain fast with large datasets',
        'Memory usage stays within limits',
        'Pagination works correctly',
        'Bulk operations complete successfully',
        'Database connections managed efficiently'
      ]
    },
    {
      id: 'backup-recovery',
      category: 'backend',
      name: 'Backup & Recovery',
      description: 'Data backup and recovery procedures work',
      status: 'pending',
      priority: 'high',
      testInstructions: 'Test database backup creation. Verify recovery from backup. Test point-in-time recovery.',
      validationCriteria: [
        'Automated backups configured',
        'Recovery procedures documented',
        'Backup integrity verified',
        'RTO/RPO targets met',
        'Disaster recovery plan exists'
      ]
    },

    // SECURITY LAYER
    {
      id: 'rbac-enforcement',
      category: 'security',
      name: 'Role-Based Access Control',
      description: 'RBAC prevents cross-classroom data leaks',
      status: 'complete',
      priority: 'critical',
      testInstructions: 'Test educator accessing other classrooms. Verify admin vs educator permissions. Test data isolation.',
      validationCriteria: [
        'Educators only access their classroom data',
        'Admin permissions properly scoped',
        'Database-level security enforced',
        'API endpoints validate permissions',
        'No cross-organization data leaks'
      ]
    },
    {
      id: 'ferpa-compliance',
      category: 'security',
      name: 'FERPA Compliance',
      description: 'Educational record protection and parental rights',
      status: 'complete',
      priority: 'critical',
      testInstructions: 'Test parent portal access. Verify educational record protection. Test data retention policies.',
      validationCriteria: [
        'Parent portal functional with secure access',
        'Educational records properly protected',
        'Audit trails for all record access',
        'Data retention policies enforced',
        'Parental rights procedures implemented'
      ]
    },
    {
      id: 'hipaa-compliance',
      category: 'security',
      name: 'HIPAA Compliance (PHI Protection)',
      description: 'Protected health information properly secured',
      status: 'partial',
      priority: 'critical',
      testInstructions: 'Test PHI detection and flagging. Verify specialized access controls. Test encryption.',
      validationCriteria: [
        'PHI automatically detected and flagged',
        'Specialized access controls for PHI',
        'PHI encrypted at rest and in transit',
        'Business Associate Agreements in place',
        'Breach notification procedures ready'
      ]
    },
    {
      id: 'vulnerability-scanning',
      category: 'security',
      name: 'Security Vulnerability Management',
      description: 'Regular vulnerability scanning and remediation',
      status: 'partial',
      priority: 'high',
      testInstructions: 'Run vulnerability scans. Test for common security issues. Verify input sanitization.',
      validationCriteria: [
        'Automated vulnerability scanning',
        'No critical security vulnerabilities',
        'Input sanitization prevents XSS/injection',
        'Security headers properly configured',
        'Dependency vulnerabilities addressed'
      ]
    },

    // PERFORMANCE LAYER
    {
      id: 'load-performance',
      category: 'performance',
      name: 'Page Load Performance',
      description: 'Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1',
      status: 'complete',
      priority: 'high',
      testInstructions: 'Measure Core Web Vitals. Test on slow networks. Verify performance budgets.',
      validationCriteria: [
        'Largest Contentful Paint < 2.5s',
        'First Input Delay < 100ms',
        'Cumulative Layout Shift < 0.1',
        'Time to Interactive < 3.5s',
        'Bundle size optimized'
      ]
    },
    {
      id: 'stress-testing',
      category: 'performance',
      name: 'Stress Testing (Large Classrooms)',
      description: 'UI handles 40+ children and 100+ behavior logs',
      status: 'partial',
      priority: 'medium',
      testInstructions: 'Load large datasets. Test UI responsiveness. Monitor memory usage.',
      validationCriteria: [
        'UI remains responsive with large datasets',
        'Memory usage stays within limits',
        'No performance degradation',
        'Pagination/virtualization works',
        'Search and filtering fast'
      ]
    },

    // SYSTEM-WIDE LAYER
    {
      id: 'end-to-end-workflows',
      category: 'system',
      name: 'Complete User Journeys',
      description: 'End-to-end workflow from signup to report export',
      status: 'complete',
      priority: 'critical',
      testInstructions: 'Complete full user journeys for all user types. Test multi-org scenarios.',
      validationCriteria: [
        'Educator journey: signup → onboarding → behavior logging → reports',
        'Admin journey: signup → org setup → invite educators → analytics',
        'Invited user journey: invitation → signup → onboarding → dashboard',
        'All workflows complete without errors',
        'Data flows correctly between steps'
      ]
    },
    {
      id: 'monitoring-observability',
      category: 'system',
      name: 'Monitoring & Observability',
      description: 'Comprehensive logging, metrics, and alerting',
      status: 'complete',
      priority: 'high',
      testInstructions: 'Verify error logging, performance metrics, audit trails. Test alerting thresholds.',
      validationCriteria: [
        'Structured logging for all components',
        'Performance metrics collected',
        'Error tracking and alerting',
        'Audit trails for compliance',
        'Real-time monitoring dashboard'
      ]
    },
    {
      id: 'deployment-readiness',
      category: 'system',
      name: 'Deployment & CI/CD',
      description: 'Build, migration, and deployment pipeline ready',
      status: 'complete',
      priority: 'high',
      testInstructions: 'Test build process. Verify migrations run cleanly. Test rollback procedures.',
      validationCriteria: [
        'Build process completes without errors',
        'Database migrations run successfully',
        'Environment configuration correct',
        'Rollback procedures documented',
        'Health checks implemented'
      ]
    }
  ];

  const categories = [
    { id: 'all', label: 'All Items', icon: BarChart3 },
    { id: 'frontend', label: 'Frontend', icon: Globe },
    { id: 'middleware', label: 'Middleware', icon: Database },
    { id: 'backend', label: 'Backend', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'system', label: 'System-Wide', icon: Users }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'partial':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-400" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'text-green-600';
      case 'partial':
        return 'text-yellow-600';
      case 'pending':
        return 'text-gray-500';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-500';
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

  const getFilteredItems = () => {
    if (selectedCategory === 'all') return checklistItems;
    return checklistItems.filter(item => item.category === selectedCategory);
  };

  const getCategoryStats = (category: string) => {
    const items = category === 'all' ? checklistItems : checklistItems.filter(i => i.category === category);
    return {
      total: items.length,
      complete: items.filter(i => i.status === 'complete').length,
      partial: items.filter(i => i.status === 'partial').length,
      pending: items.filter(i => i.status === 'pending').length,
      critical: items.filter(i => i.status === 'critical').length
    };
  };

  const overallStats = getCategoryStats('all');
  const completionPercentage = Math.round((overallStats.complete / overallStats.total) * 100);

  const toggleItemCheck = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">
          Production Launch Checklist
        </h1>
        <p className="text-gray-600 mb-6">
          Comprehensive validation checklist for production readiness
        </p>
        
        <div className="flex items-center justify-center space-x-8">
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${
              completionPercentage >= 90 ? 'text-green-600' : 
              completionPercentage >= 70 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {completionPercentage}%
            </div>
            <p className="text-sm text-gray-600">Complete</p>
          </div>
          
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${
              overallStats.critical === 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {overallStats.critical}
            </div>
            <p className="text-sm text-gray-600">Critical Issues</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {overallStats.complete}
            </div>
            <p className="text-sm text-gray-600">Items Complete</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
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
              {stats.total > 0 && (
                <div className={`text-xs ${
                  selectedCategory === category.id ? 'text-white' : 'text-gray-600'
                }`}>
                  {stats.complete}/{stats.total} complete
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

      {/* Checklist Items */}
      <div className="space-y-6">
        {getFilteredItems().map((item) => (
          <Card key={item.id} className={`p-6 ${
            item.status === 'critical' ? 'border-red-200 bg-red-50' :
            item.status === 'pending' ? 'border-yellow-200 bg-yellow-50' :
            item.status === 'partial' ? 'border-orange-200 bg-orange-50' :
            'border-green-200 bg-green-50'
          }`}>
            <div className="flex items-start space-x-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={checkedItems.has(item.id)}
                  onChange={() => toggleItemCheck(item.id)}
                  className="w-5 h-5 rounded border-[#E6E2DD] text-[#C44E38] focus:ring-[#C44E38]"
                />
                {getStatusIcon(item.status)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-[#1A1A1A]">
                      {item.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                      {item.category}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-4">{item.description}</p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-[#1A1A1A] mb-2">Test Instructions:</h4>
                    <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border">
                      {item.testInstructions}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-[#1A1A1A] mb-2">Validation Criteria:</h4>
                    <ul className="space-y-1">
                      {item.validationCriteria.map((criteria, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <div className="w-1.5 h-1.5 bg-[#C44E38] rounded-full mt-2 mr-2 flex-shrink-0" />
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {item.dependencies && item.dependencies.length > 0 && (
                    <div>
                      <h4 className="font-medium text-[#1A1A1A] mb-2">Dependencies:</h4>
                      <div className="flex flex-wrap gap-2">
                        {item.dependencies.map((dep, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {dep}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="p-8 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
            Production Readiness Summary
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {overallStats.complete}
              </div>
              <p className="text-sm text-gray-600">Complete</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {overallStats.partial}
              </div>
              <p className="text-sm text-gray-600">Partial</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-500 mb-1">
                {overallStats.pending}
              </div>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600 mb-1">
                {overallStats.critical}
              </div>
              <p className="text-sm text-gray-600">Critical</p>
            </div>
          </div>
          
          <div className={`text-xl font-semibold mb-4 ${
            completionPercentage >= 90 ? 'text-green-600' : 
            completionPercentage >= 70 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {completionPercentage >= 90 ? '✅ READY FOR PRODUCTION LAUNCH' :
             completionPercentage >= 70 ? '⚠️ CONDITIONAL LAUNCH APPROVAL' :
             '🚫 NOT READY FOR PRODUCTION'}
          </div>
          
          <p className="text-gray-700">
            {completionPercentage >= 90 ? 'All critical systems tested and validated. Production launch approved.' :
             completionPercentage >= 70 ? 'Core functionality ready. Launch with enhanced monitoring.' :
             'Critical issues must be resolved before production deployment.'}
          </p>
        </div>
      </Card>
    </div>
  );
};