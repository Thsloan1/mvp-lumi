import React, { useState } from 'react';
import { ArrowLeft, BarChart3, TrendingUp, Users, Download, Calendar, Filter } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Select } from '../UI/Select';
import { useAppContext } from '../../context/AppContext';

export const OrganizationAnalytics: React.FC = () => {
  const { setCurrentView } = useAppContext();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('all');

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  const metricOptions = [
    { value: 'all', label: 'All Metrics' },
    { value: 'behavior', label: 'Behavior Strategies' },
    { value: 'classroom', label: 'Classroom Management' },
    { value: 'engagement', label: 'Educator Engagement' },
    { value: 'resources', label: 'Resource Usage' }
  ];

  // Mock analytics data
  const analyticsData = {
    totalStrategies: behaviorLogs.length + classroomLogs.length,
    totalEducators: 12,
    avgConfidence: behaviorLogs.length > 0 ? 
      behaviorLogs.reduce((sum, log) => sum + (log.confidenceRating || 0), 0) / behaviorLogs.length : 0,
    resourceDownloads: 156,
    trends: {
      strategiesGrowth: '+23%',
      engagementGrowth: '+15%',
      confidenceGrowth: '+12%'
    },
    topEducators: [
      { name: 'Sarah Johnson', strategies: 45, confidence: 8.2 },
      { name: 'Mike Chen', strategies: 38, confidence: 7.9 },
      { name: 'Lisa Rodriguez', strategies: 34, confidence: 8.1 }
    ],
    topStrategies: [
      { name: 'Connection Before Direction', usage: 89, success: 8.5 },
      { name: 'First-Then Structure', usage: 67, success: 8.2 },
      { name: 'Quiet Partnership', usage: 45, success: 8.7 }
    ],
    behaviorTrends: [
      { category: 'Transitions', count: 78, trend: '+12%' },
      { category: 'Circle Time', count: 56, trend: '+8%' },
      { category: 'Free Play', count: 43, trend: '-5%' },
      { category: 'Meal Time', count: 34, trend: '+15%' }
    ]
  };

  const overviewCards = [
    {
      title: 'Total Strategies Generated',
      value: analyticsData.totalStrategies.toString(),
      trend: analyticsData.trends.strategiesGrowth,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Educators',
      value: analyticsData.totalEducators.toString(),
      trend: analyticsData.trends.engagementGrowth,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Average Confidence',
      value: `${analyticsData.avgConfidence}/10`,
      trend: analyticsData.trends.confidenceGrowth,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Resource Downloads',
      value: analyticsData.resourceDownloads.toString(),
      trend: '+28%',
      icon: Download,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('admin-dashboard')}
            icon={ArrowLeft}
            className="mb-6 -ml-2"
          >
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
                Organization Analytics
              </h1>
              <p className="text-gray-600">
                Insights and trends across your educator team
              </p>
            </div>
            <div className="flex space-x-3">
              <Select
                value={timeRange}
                onChange={setTimeRange}
                options={timeRangeOptions}
              />
              <Button variant="outline" icon={Download}>
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overviewCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${card.bgColor} rounded-xl p-3`}>
                    <IconComponent className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#1A1A1A]">{card.value}</p>
                    <p className="text-xs text-green-600 font-medium">{card.trend}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{card.title}</p>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Performing Educators */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
              Top Performing Educators
            </h3>
            
            <div className="space-y-4">
              {analyticsData.topEducators.map((educator, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-[#F8F6F4] rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-[#1A1A1A]">{educator.name}</p>
                      <p className="text-sm text-gray-600">
                        {educator.strategies} strategies • {educator.confidence}/10 avg confidence
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      {Array.from({length: Math.floor(educator.confidence / 2)}).map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Most Used Strategies */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
              Most Used Strategies
            </h3>
            
            <div className="space-y-4">
              {analyticsData.topStrategies.map((strategy, index) => (
                <div key={index} className="p-4 bg-[#F8F6F4] rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-[#1A1A1A]">{strategy.name}</p>
                    <span className="text-sm font-medium text-[#C44E38]">
                      {strategy.usage} uses
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 bg-[#E6E2DD] rounded-full h-2 mr-3">
                      <div 
                        className="bg-[#C44E38] h-2 rounded-full"
                        style={{ width: `${(strategy.usage / 89) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">
                      {strategy.success}/10 success
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Behavior Trends */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
              Behavior Context Trends
            </h3>
            
            <div className="space-y-4">
              {analyticsData.behaviorTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#1A1A1A]">{trend.category}</p>
                    <p className="text-sm text-gray-600">{trend.count} logged behaviors</p>
                  </div>
                  <div className="text-right">
                    <span className={`
                      text-sm font-medium
                      ${trend.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}
                    `}>
                      {trend.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Export Options */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
              Export & Reports
            </h3>
            
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start" icon={Download}>
                Export Educator Activity Report
              </Button>
              <Button variant="outline" className="w-full justify-start" icon={Download}>
                Export Strategy Usage Report
              </Button>
              <Button variant="outline" className="w-full justify-start" icon={Download}>
                Export Confidence Trends
              </Button>
              <Button variant="outline" className="w-full justify-start" icon={Download}>
                Export Complete Analytics
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-[#F8F6F4] rounded-xl">
              <p className="text-sm text-gray-700">
                Reports include anonymized data to protect educator and child privacy while providing valuable insights.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};