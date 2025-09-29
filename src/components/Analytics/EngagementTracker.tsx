import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Download, Search, Eye } from 'lucide-react';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';
import { EngagementMetrics } from '../../types';

export const EngagementTracker: React.FC = () => {
  const { currentUser, behaviorLogs, classroomLogs } = useAppContext();
  const [metrics, setMetrics] = useState<EngagementMetrics[]>([]);

  // Mock engagement data - in real app this would come from analytics service
  useEffect(() => {
    const mockMetrics: EngagementMetrics[] = [
      {
        id: '1',
        userId: currentUser?.id || '',
        action: 'strategy_use',
        metadata: { strategy: 'Connection Before Direction', confidence: 8 },
        timestamp: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        id: '2',
        userId: currentUser?.id || '',
        resourceId: 'tantrum-support',
        action: 'download',
        metadata: { resourceType: 'strategy' },
        timestamp: new Date(Date.now() - 172800000) // 2 days ago
      },
      {
        id: '3',
        userId: currentUser?.id || '',
        action: 'search',
        metadata: { query: 'transition strategies', resultsCount: 5 },
        timestamp: new Date(Date.now() - 259200000) // 3 days ago
      }
    ];
    setMetrics(mockMetrics);
  }, [currentUser]);

  const getEngagementStats = () => {
    const totalStrategiesUsed = behaviorLogs.length + classroomLogs.length;
    const resourceDownloads = metrics.filter(m => m.action === 'download').length;
    const searchQueries = metrics.filter(m => m.action === 'search').length;
    const avgConfidence = behaviorLogs.reduce((sum, log) => sum + (log.confidenceRating || 0), 0) / (behaviorLogs.length || 1);

    return {
      totalStrategiesUsed,
      resourceDownloads,
      searchQueries,
      avgConfidence: Math.round(avgConfidence * 10) / 10
    };
  };

  const stats = getEngagementStats();

  const engagementCards = [
    {
      title: 'Strategies Used',
      value: stats.totalStrategiesUsed.toString(),
      icon: TrendingUp,
      color: 'text-[#C44E38]',
      bgColor: 'bg-[#C44E38] bg-opacity-10'
    },
    {
      title: 'Resources Downloaded',
      value: stats.resourceDownloads.toString(),
      icon: Download,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Library Searches',
      value: stats.searchQueries.toString(),
      icon: Search,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Avg Confidence',
      value: `${stats.avgConfidence}/10`,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Your Engagement Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {engagementCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                    <p className="text-xl font-bold text-[#1A1A1A]">{card.value}</p>
                  </div>
                  <div className={`${card.bgColor} rounded-lg p-2`}>
                    <IconComponent className={`w-5 h-5 ${card.color}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h4 className="font-semibold text-[#1A1A1A] mb-4">Recent Activity</h4>
        <div className="space-y-3">
          {metrics.slice(0, 5).map((metric, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-[#F8F6F4] rounded-lg">
              <div className="w-8 h-8 bg-[#C44E38] bg-opacity-10 rounded-full flex items-center justify-center">
                {metric.action === 'strategy_use' && <TrendingUp className="w-4 h-4 text-[#C44E38]" />}
                {metric.action === 'download' && <Download className="w-4 h-4 text-blue-600" />}
                {metric.action === 'search' && <Search className="w-4 h-4 text-green-600" />}
                {metric.action === 'view' && <Eye className="w-4 h-4 text-purple-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1A1A1A]">
                  {metric.action === 'strategy_use' && 'Used strategy'}
                  {metric.action === 'download' && 'Downloaded resource'}
                  {metric.action === 'search' && 'Searched library'}
                  {metric.action === 'view' && 'Viewed resource'}
                </p>
                <p className="text-xs text-gray-600">
                  {new Date(metric.timestamp).toLocaleDateString()}
                </p>
              </div>
              {metric.metadata && (
                <div className="text-xs text-gray-500">
                  {metric.metadata.strategy && `"${metric.metadata.strategy}"`}
                  {metric.metadata.query && `"${metric.metadata.query}"`}
                  {metric.metadata.confidence && `Confidence: ${metric.metadata.confidence}/10`}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};