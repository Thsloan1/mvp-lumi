import React, { useState } from 'react';
import { BarChart3, Download, Filter, Calendar, TrendingUp, Users, Heart, FileText } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Select } from '../UI/Select';
import { useAppContext } from '../../context/AppContext';

export const DataReports: React.FC = () => {
  const { behaviorLogs, classroomLogs, children, currentUser } = useAppContext();
  const [selectedReport, setSelectedReport] = useState<'child' | 'classroom' | 'overview'>('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [selectedChild, setSelectedChild] = useState('');

  const reportTypes = [
    { value: 'overview', label: 'Overview', icon: BarChart3 },
    { value: 'child', label: 'Child Reports', icon: Users },
    { value: 'classroom', label: 'Classroom Reports', icon: Heart }
  ];

  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  const childOptions = children.map(child => ({
    value: child.id,
    label: child.name
  }));

  // Calculate overview statistics
  const getOverviewStats = () => {
    const totalBehaviors = behaviorLogs.length;
    const totalClassroom = classroomLogs.length;
    const avgConfidence = behaviorLogs.reduce((sum, log) => sum + (log.confidenceRating || 0), 0) / (behaviorLogs.length || 1);
    const strategiesUsed = behaviorLogs.filter(log => log.selectedStrategy).length;
    
    return {
      totalBehaviors,
      totalClassroom,
      avgConfidence: Math.round(avgConfidence * 10) / 10,
      strategiesUsed
    };
  };

  // Get behavior trends by context
  const getBehaviorTrends = () => {
    const contextCounts: Record<string, number> = {};
    behaviorLogs.forEach(log => {
      contextCounts[log.context] = (contextCounts[log.context] || 0) + 1;
    });
    
    return Object.entries(contextCounts)
      .map(([context, count]) => ({ context, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Get severity distribution
  const getSeverityDistribution = () => {
    const severityCounts = { low: 0, medium: 0, high: 0 };
    behaviorLogs.forEach(log => {
      severityCounts[log.severity]++;
    });
    
    return severityCounts;
  };

  // Get child-specific data
  const getChildData = (childId: string) => {
    const childLogs = behaviorLogs.filter(log => log.childId === childId);
    const child = children.find(c => c.id === childId);
    
    return {
      child,
      totalLogs: childLogs.length,
      contexts: [...new Set(childLogs.map(log => log.context))],
      avgConfidence: childLogs.reduce((sum, log) => sum + (log.confidenceRating || 0), 0) / (childLogs.length || 1),
      recentLogs: childLogs.slice(-5).reverse()
    };
  };

  const stats = getOverviewStats();
  const behaviorTrends = getBehaviorTrends();
  const severityDistribution = getSeverityDistribution();

  const renderOverviewReport = () => (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Behaviors</p>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.totalBehaviors}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Classroom Challenges</p>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.totalClassroom}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Confidence</p>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.avgConfidence}/10</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Strategies Used</p>
              <p className="text-2xl font-bold text-[#1A1A1A]">{stats.strategiesUsed}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Behavior Context Trends */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Behavior Context Trends
        </h3>
        
        <div className="space-y-4">
          {behaviorTrends.slice(0, 6).map((trend, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                </div>
                <span className="font-medium text-[#1A1A1A]">
                  {trend.context.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-32 bg-[#E6E2DD] rounded-full h-2">
                  <div 
                    className="bg-[#C44E38] h-2 rounded-full"
                    style={{ width: `${(trend.count / Math.max(...behaviorTrends.map(t => t.count))) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-[#1A1A1A] w-8">
                  {trend.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Severity Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Behavior Severity Distribution
        </h3>
        
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-green-600">{severityDistribution.low}</span>
            </div>
            <p className="font-medium text-[#1A1A1A]">Low</p>
            <p className="text-sm text-gray-600">Minor disruptions</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-yellow-600">{severityDistribution.medium}</span>
            </div>
            <p className="font-medium text-[#1A1A1A]">Medium</p>
            <p className="text-sm text-gray-600">Moderate challenges</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-red-600">{severityDistribution.high}</span>
            </div>
            <p className="font-medium text-[#1A1A1A]">High</p>
            <p className="text-sm text-gray-600">Significant disruptions</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderChildReport = () => {
    if (!selectedChild) {
      return (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">
            Select a Child
          </h3>
          <p className="text-gray-600">
            Choose a child from the dropdown to view their detailed report
          </p>
        </Card>
      );
    }

    const childData = getChildData(selectedChild);
    
    return (
      <div className="space-y-8">
        {/* Child Overview */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#1A1A1A]">
                  {childData.child?.name}
                </h3>
                <p className="text-gray-600">{childData.child?.gradeBand}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#1A1A1A]">{childData.totalLogs}</p>
              <p className="text-sm text-gray-600">Total logs</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-[#1A1A1A] mb-2">Common Contexts</h4>
              <div className="space-y-1">
                {childData.contexts.slice(0, 3).map((context, index) => (
                  <span key={index} className="inline-block px-2 py-1 bg-[#F8F6F4] text-xs rounded-full mr-1">
                    {context.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-[#1A1A1A] mb-2">Avg Confidence</h4>
              <p className="text-lg font-semibold text-[#C44E38]">
                {Math.round(childData.avgConfidence * 10) / 10}/10
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-[#1A1A1A] mb-2">Special Needs</h4>
              <div className="flex space-x-2">
                {childData.child?.hasIEP && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">IEP</span>
                )}
                {childData.child?.hasIFSP && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">IFSP</span>
                )}
                {!childData.child?.hasIEP && !childData.child?.hasIFSP && (
                  <span className="text-sm text-gray-600">None</span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Behavior Logs */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
            Recent Behavior Logs
          </h3>
          
          <div className="space-y-4">
            {childData.recentLogs.map((log, index) => (
              <div key={index} className="p-4 bg-[#F8F6F4] rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`
                      w-3 h-3 rounded-full
                      ${log.severity === 'low' ? 'bg-green-500' :
                        log.severity === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}
                    `} />
                    <span className="text-sm font-medium text-[#1A1A1A]">
                      {log.context.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  {log.behaviorDescription}
                </p>
                {log.selectedStrategy && (
                  <p className="text-xs text-blue-600">
                    Strategy: {log.selectedStrategy.substring(0, 80)}...
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  const renderClassroomReport = () => (
    <div className="space-y-8">
      {/* Classroom Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Classroom Management Overview
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-blue-600">{classroomLogs.length}</span>
            </div>
            <p className="font-medium text-[#1A1A1A]">Total Challenges</p>
            <p className="text-sm text-gray-600">Logged this period</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-green-600">
                {classroomLogs.filter(log => log.selectedStrategy).length}
              </span>
            </div>
            <p className="font-medium text-[#1A1A1A]">Strategies Applied</p>
            <p className="text-sm text-gray-600">From generated suggestions</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-purple-600">
                {Math.round((classroomLogs.reduce((sum, log) => sum + (log.confidenceSelfRating || 0), 0) / (classroomLogs.length || 1)) * 10) / 10}
              </span>
            </div>
            <p className="font-medium text-[#1A1A1A]">Avg Confidence</p>
            <p className="text-sm text-gray-600">Self-rating out of 10</p>
          </div>
        </div>
      </Card>

      {/* Recent Classroom Challenges */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Recent Classroom Challenges
        </h3>
        
        <div className="space-y-4">
          {classroomLogs.slice(-5).reverse().map((log, index) => (
            <div key={index} className="p-4 bg-[#F8F6F4] rounded-xl">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`
                    w-3 h-3 rounded-full
                    ${log.severity === 'low' ? 'bg-green-500' :
                      log.severity === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}
                  `} />
                  <span className="text-sm font-medium text-[#1A1A1A]">
                    {log.context.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(log.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                {log.challengeDescription}
              </p>
              {log.selectedStrategy && (
                <p className="text-xs text-blue-600">
                  Strategy: {log.selectedStrategy.substring(0, 80)}...
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
                Data & Reports
              </h1>
              <p className="text-gray-600">
                Visual insights into your classroom behavior patterns and strategies
              </p>
            </div>
            <div className="flex space-x-3">
              <Select
                value={dateRange}
                onChange={setDateRange}
                options={dateRangeOptions}
              />
              <Button variant="outline" icon={Download}>
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Report Type Tabs */}
        <div className="border-b border-[#E6E2DD] mb-8">
          <nav className="flex space-x-8">
            {reportTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setSelectedReport(type.value as any)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${selectedReport === type.value
                      ? 'border-[#C44E38] text-[#C44E38]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Child Report Filter */}
        {selectedReport === 'child' && (
          <div className="mb-8">
            <div className="max-w-md">
              <Select
                label="Select Child"
                value={selectedChild}
                onChange={setSelectedChild}
                options={childOptions}
                placeholder="Choose a child to view their report"
              />
            </div>
          </div>
        )}

        {/* Report Content */}
        <div>
          {selectedReport === 'overview' && renderOverviewReport()}
          {selectedReport === 'child' && renderChildReport()}
          {selectedReport === 'classroom' && renderClassroomReport()}
        </div>
      </div>
    </div>
  );
};