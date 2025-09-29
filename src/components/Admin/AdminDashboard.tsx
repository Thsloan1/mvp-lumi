import React, { useState, useEffect } from 'react';
import { Users, Plus, Settings, BarChart3, Mail, Crown, Shield, TrendingUp } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';

interface OrganizationStats {
  totalEducators: number;
  activeSeats: number;
  maxSeats: number;
  pendingInvitations: number;
  totalBehaviorLogs: number;
  totalClassroomLogs: number;
}

export const AdminDashboard: React.FC = () => {
  const { currentUser, setCurrentView } = useAppContext();
  const [stats, setStats] = useState<OrganizationStats>({
    totalEducators: 0,
    activeSeats: 0,
    maxSeats: 0,
    pendingInvitations: 0,
    totalBehaviorLogs: 0,
    totalClassroomLogs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizationStats();
  }, []);

  const fetchOrganizationStats = async () => {
    try {
      // Mock data - in real implementation, this would fetch from API
      setStats({
        totalEducators: 12,
        activeSeats: 12,
        maxSeats: 15,
        pendingInvitations: 3,
        totalBehaviorLogs: 156,
        totalClassroomLogs: 89
      });
    } catch (error) {
      console.error('Error fetching organization stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Invite Educators',
      description: 'Add new team members to your organization',
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      action: () => setCurrentView('invite-educators-modal')
    },
    {
      title: 'Manage Team',
      description: 'View and manage your educator team',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      action: () => setCurrentView('manage-educators')
    },
    {
      title: 'Organization Settings',
      description: 'Configure billing and organization preferences',
      icon: Settings,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      action: () => setCurrentView('organization-settings')
    },
    {
      title: 'Analytics & Reports',
      description: 'View organization-wide insights and trends',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      action: () => setCurrentView('organization-analytics')
    }
  ];

  const statCards = [
    {
      title: 'Active Educators',
      value: `${stats.activeSeats}/${stats.maxSeats}`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: '+2 this month'
    },
    {
      title: 'Pending Invitations',
      value: stats.pendingInvitations.toString(),
      icon: Mail,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      trend: 'Awaiting response'
    },
    {
      title: 'Behavior Strategies',
      value: stats.totalBehaviorLogs.toString(),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: '+23 this week'
    },
    {
      title: 'Classroom Challenges',
      value: stats.totalClassroomLogs.toString(),
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: '+12 this week'
    }
  ];

  const seatUtilization = (stats.activeSeats / stats.maxSeats) * 100;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#F8F6F4] border-b border-[#E6E2DD]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-[#C44E38] rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-[#1A1A1A]">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-gray-600">
                Welcome back, {currentUser?.fullName?.split(' ')[0]}. Here's your organization overview.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => setCurrentView('invite-educators-modal')}
                icon={Plus}
                size="lg"
              >
                Invite Educators
              </Button>
              <Button
                onClick={() => setCurrentView('organization-settings')}
                variant="secondary"
                icon={Settings}
                size="lg"
              >
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bgColor} rounded-xl p-3`}>
                    <IconComponent className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#1A1A1A]">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{stat.trend}</p>
              </Card>
            );
          })}
        </div>

        {/* Seat Utilization Alert */}
        {seatUtilization > 80 && (
          <Card className="p-6 mb-8 bg-yellow-50 border-yellow-200">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  Seat Limit Warning
                </h3>
                <p className="text-yellow-800 mb-4">
                  You're using {stats.activeSeats} of {stats.maxSeats} educator seats ({Math.round(seatUtilization)}% capacity). 
                  Consider upgrading your plan to add more educators.
                </p>
                <Button size="sm" variant="outline">
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                Quick Actions
              </h3>
              <div className="space-y-4">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <Button
                      key={index}
                      onClick={action.action}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <div className={`${action.bgColor} rounded-lg p-2 mr-3`}>
                        <IconComponent className={`w-4 h-4 ${action.color}`} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-[#1A1A1A]">{action.title}</p>
                        <p className="text-xs text-gray-600">{action.description}</p>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Recent Activity & Insights */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Organization Overview */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                  Organization Overview
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-[#1A1A1A] mb-3">Subscription Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Plan:</span>
                        <span className="font-medium text-[#1A1A1A]">Pro Plan</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Seats Used:</span>
                        <span className="font-medium text-[#1A1A1A]">{stats.activeSeats}/{stats.maxSeats}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="text-green-600 font-medium">Active</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-[#1A1A1A] mb-3">Usage This Month</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Strategies Generated:</span>
                        <span className="font-medium text-[#1A1A1A]">245</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Family Notes:</span>
                        <span className="font-medium text-[#1A1A1A]">89</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Resources Downloaded:</span>
                        <span className="font-medium text-[#1A1A1A]">156</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Recent Educator Activity */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                  Recent Educator Activity
                </h3>
                
                <div className="space-y-4">
                  {[
                    { name: 'Sarah Johnson', action: 'Generated behavior strategy', time: '2 hours ago', type: 'behavior' },
                    { name: 'Mike Chen', action: 'Downloaded transition toolkit', time: '4 hours ago', type: 'resource' },
                    { name: 'Lisa Rodriguez', action: 'Completed reflection prompt', time: '6 hours ago', type: 'reflection' },
                    { name: 'David Kim', action: 'Created family communication note', time: '1 day ago', type: 'family' },
                    { name: 'Emma Thompson', action: 'Logged classroom challenge', time: '1 day ago', type: 'classroom' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-[#F8F6F4] rounded-xl">
                      <div className={`
                        w-2 h-2 rounded-full
                        ${activity.type === 'behavior' ? 'bg-blue-500' :
                          activity.type === 'resource' ? 'bg-green-500' :
                          activity.type === 'reflection' ? 'bg-purple-500' :
                          activity.type === 'family' ? 'bg-orange-500' : 'bg-red-500'}
                      `} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#1A1A1A]">
                          {activity.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {activity.action}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Organization Growth Promotion */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                Growing Your Team?
              </h3>
              <p className="text-gray-600">
                Add more educators to your organization and unlock team collaboration features.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => setCurrentView('invite-educators-modal')}
                icon={Plus}
              >
                Invite Educators
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentView('upgrade-subscription')}
              >
                Upgrade Plan
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};