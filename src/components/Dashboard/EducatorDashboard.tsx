import React from 'react';
import { Heart, Users, FileText, BarChart3, Plus, Calendar, BookOpen, TrendingUp, User } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';
import { EngagementTracker } from '../Analytics/EngagementTracker';
import { AnalyticsEngine, ChildInsight, ClassroomInsight, UnifiedInsight } from '../../utils/analyticsEngine';

export const EducatorDashboard: React.FC = () => {
  const { 
    currentUser, 
    behaviorLogs, 
    behaviorLogsLoading,
    classroomLogs, 
    classroomLogsLoading,
    children, 
    childrenLoading,
    classrooms, 
    classroomsLoading,
    setCurrentView 
  } = useAppContext();

  // Generate unified insights
  const currentClassroom = classrooms[0]; // For MVP, use first classroom
  const childInsights = children.map(child => 
    AnalyticsEngine.generateChildInsights(child.id, behaviorLogs, child)
  ).filter(insight => insight.totalLogs > 0);

  const classroomInsight = currentClassroom 
    ? AnalyticsEngine.generateClassroomInsights(
        currentClassroom.id, 
        behaviorLogs, 
        classroomLogs, 
        children, 
        currentClassroom
      )
    : null;

  const unifiedInsights = AnalyticsEngine.generateUnifiedInsights(
    behaviorLogs,
    classroomLogs,
    children,
    classrooms
  );

  const stats = [
    {
      label: 'Behaviors Logged',
      value: behaviorLogs.length.toString(),
      icon: Heart,
      color: 'text-[#C44E38]'
    },
    {
      label: 'Classroom Challenges',
      value: classroomLogs.length.toString(),
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'Family Notes',
      value: behaviorLogs.filter(log => log.aiResponse?.familyScript).length.toString(),
      icon: FileText,
      color: 'text-green-600'
    },
    {
      label: 'This Week',
      value: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      icon: Calendar,
      color: 'text-purple-600'
    }
  ];

  const recentActivity = [
    ...behaviorLogs.slice(-3).map(log => ({
      type: 'behavior',
      description: log.behaviorDescription,
      time: new Date(log.createdAt).toLocaleDateString(),
      severity: log.severity
    })),
    ...classroomLogs.slice(-2).map(log => ({
      type: 'classroom',
      description: log.challengeDescription,
      time: new Date(log.createdAt).toLocaleDateString(),
      severity: log.severity
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#F8F6F4] border-b border-[#E6E2DD]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
                Welcome back, {currentUser?.fullName?.split(' ')[0]}
              </h1>
              <p className="text-gray-600">
                Ready to support your students today? Let's see what's happening.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => setCurrentView('behavior-log')}
                icon={Heart}
                size="lg"
              >
                Strategy for Challenging Behavior
              </Button>
              <Button
                onClick={() => setCurrentView('classroom-log')}
                variant="secondary"
                icon={Users}
                size="lg"
              >
                Strategy for the Whole Class
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-[#1A1A1A]">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} bg-opacity-10 rounded-xl p-3`}>
                    <IconComponent className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Sticky Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
          <Button
            onClick={() => setCurrentView('behavior-log')}
            icon={Heart}
            size="lg"
            className="shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
            Strategy for Challenging Behavior
          </Button>
          <Button
            onClick={() => setCurrentView('classroom-log')}
            variant="secondary"
            icon={Users}
            size="lg"
            className="shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
            Strategy for the Whole Class
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                  Quick Actions
                </h3>
                <div className="space-y-4">
                  <Button
                    onClick={() => setCurrentView('child-profiles')}
                    variant="outline"
                    className="w-full justify-start"
                    icon={User}
                  >
                    Child Profiles
                  </Button>
                  <Button
                    onClick={() => setCurrentView('classroom-profile')}
                    variant="outline"
                    className="w-full justify-start"
                    icon={Users}
                  >
                    Classroom Profile
                  </Button>
                  <Button
                    onClick={() => setCurrentView('reports')}
                    variant="outline"
                    className="w-full justify-start"
                    icon={BarChart3}
                  >
                    View Data and Reports
                  </Button>
                  <Button
                    onClick={() => setCurrentView('library')}
                    variant="outline"
                    className="w-full justify-start"
                    icon={BookOpen}
                  >
                    Resource Library
                  </Button>
                  <Button
                    onClick={() => setCurrentView('family-notes')}
                    variant="outline"
                    className="w-full justify-start"
                    icon={FileText}
                  >
                    Family Notes
                  </Button>
                </div>
              </Card>

              {/* Child Insights Feed */}
              {childInsights.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
                    Child Insights
                  </h3>
                  <div className="space-y-4">
                    {childInsights.slice(0, 3).map((insight) => (
                      <div key={insight.childId} className="p-4 bg-[#F8F6F4] rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-[#1A1A1A]">{insight.childName}</p>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {insight.totalLogs} logs
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Most frequent: {insight.patterns.mostFrequentContext.replace(/_/g, ' ')}
                        </p>
                        {insight.patterns.effectiveStrategies.length > 0 && (
                          <p className="text-xs text-green-600">
                            Effective: {insight.patterns.effectiveStrategies[0].substring(0, 40)}...
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => setCurrentView('reports')}
                    variant="ghost"
                    size="sm"
                    className="w-full mt-4"
                  >
                    View All Child Reports
                  </Button>
                </Card>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Unified Insights */}
              {unifiedInsights.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                    Unified Insights
                  </h3>
                  <div className="space-y-4">
                    {unifiedInsights.map((insight, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-[#1A1A1A]">{insight.pattern}</h4>
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-medium
                            ${insight.classroomLevel.severity === 'high' ? 'bg-red-100 text-red-700' :
                              insight.classroomLevel.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'}
                          `}>
                            {insight.classroomLevel.severity} severity
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm font-medium text-blue-900">Child Level:</p>
                            <p className="text-sm text-blue-700">
                              {insight.childLevel.affectedChildren} children, {insight.childLevel.frequency} incidents
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-900">Classroom Level:</p>
                            <p className="text-sm text-green-700">
                              {insight.classroomLevel.affectedClassrooms} classrooms affected
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          <strong>Recommendations:</strong> {insight.recommendations.slice(0, 2).join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Classroom Climate Feed */}
              {classroomInsight && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                    Classroom Climate Insights
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-[#1A1A1A] mb-3">Group Climate Score</h4>
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl font-bold text-[#C44E38]">
                          {classroomInsight.groupClimate.score}/10
                        </div>
                        <div className="flex-1">
                          <div className="w-full bg-[#E6E2DD] rounded-full h-2">
                            <div 
                              className="bg-[#C44E38] h-2 rounded-full"
                              style={{ width: `${classroomInsight.groupClimate.score * 10}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {classroomInsight.groupClimate.transitionChallenges}% transition challenges
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#1A1A1A] mb-3">Top Stressors</h4>
                      <div className="space-y-1">
                        {classroomInsight.groupClimate.topStressors.slice(0, 3).map((stressor, index) => (
                          <div key={index} className="text-sm text-gray-700 flex items-center">
                            <div className="w-2 h-2 bg-[#C44E38] rounded-full mr-2" />
                            {stressor}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                  Recent Activity
                </h3>
                
                {recentActivity.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[#F8F6F4] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-[#C44E38]" />
                    </div>
                    <h4 className="text-lg font-medium text-[#1A1A1A] mb-2">
                      Ready to get started?
                    </h4>
                    <p className="text-gray-600 mb-6">
                      Log your first behavior or classroom challenge to see personalized strategies.
                    </p>
                    <Button
                      onClick={() => setCurrentView('behavior-log')}
                      icon={Plus}
                    >
                      Log First Behavior
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-[#F8F6F4] rounded-xl">
                        <div className={`
                          w-2 h-2 rounded-full mt-2
                          ${activity.severity === 'high' ? 'bg-red-500' :
                            activity.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}
                        `} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-[#C44E38] uppercase tracking-wide">
                              {activity.type === 'behavior' ? 'Child Behavior' : 'Classroom Challenge'}
                            </span>
                            <span className="text-xs text-gray-500">{activity.time}</span>
                          </div>
                          <p className="text-sm text-[#1A1A1A] line-clamp-2">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
              
              {/* Engagement Analytics */}
              <EngagementTracker />
            </div>
          </div>
        </div>
        
        {/* Resource Library Promotion */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-[#F8F6F4] to-white border-[#C44E38] border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                Explore Our Resource Library
              </h3>
              <p className="text-gray-600">
                Access curated strategies, family handouts, and implementation guides
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => setCurrentView('library')}
                icon={BookOpen}
              >
                Browse Resources
              </Button>
              <Button
                onClick={() => setCurrentView('lumied-upsell')}
                variant="outline"
                icon={TrendingUp}
              >
                Upgrade to LumiEd
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};