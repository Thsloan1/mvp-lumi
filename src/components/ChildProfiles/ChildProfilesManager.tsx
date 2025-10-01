import React, { useState } from 'react';
import { User, Plus, Search, Filter, Calendar, FileText, TrendingUp, Heart, BarChart3 } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { EmptyState } from '../UI/EmptyState';
import { useAppContext } from '../../context/AppContext';
import { Child } from '../../types';

export const ChildProfilesManager: React.FC = () => {
  const { children, setChildren, behaviorLogs, setCurrentView, createChild } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChildForm, setShowNewChildForm] = useState(false);
  const [newChildData, setNewChildData] = useState({
    name: '',
    gradeBand: 'Preschool (4-5 years old)',
    developmentalNotes: '',
    hasIEP: false,
    hasIFSP: false
  });

  const filteredChildren = children.filter(child =>
    child.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getChildBehaviorCount = (childId: string) => {
    return behaviorLogs.filter(log => log.childId === childId).length;
  };

  const getLastBehaviorDate = (childId: string) => {
    const childLogs = behaviorLogs.filter(log => log.childId === childId);
    if (childLogs.length === 0) return null;
    return new Date(Math.max(...childLogs.map(log => new Date(log.createdAt).getTime())));
  };

  const handleCreateChild = () => {
    if (newChildData.name.trim()) {
      const childData = {
        name: newChildData.name.trim(),
        gradeBand: newChildData.gradeBand,
        developmentalNotes: newChildData.developmentalNotes,
        hasIEP: newChildData.hasIEP,
        hasIFSP: newChildData.hasIFSP
      };
      
      createChild(childData)
        .then(() => {
          setNewChildData({
            name: '',
            gradeBand: 'Preschool (4-5 years old)',
            developmentalNotes: '',
            hasIEP: false,
            hasIFSP: false
          });
          setShowNewChildForm(false);
        })
        .catch(error => {
          console.error('Failed to create child:', error);
        });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F4]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
                Child Profiles
              </h1>
              <p className="text-[#615E59]">
                Manage individual child profiles and track behavior patterns
              </p>
            </div>
            <Button
              onClick={() => setShowNewChildForm(true)}
              icon={Plus}
              className="bg-[#C44E38] hover:bg-[#A63D2A] text-white shadow-sm"
            >
              Add New Child
            </Button>
          </div>

          {/* Search */}
          <div className="max-w-md">
            <Input
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search children..."
              className="bg-white border-[#E6E2DD] focus:border-[#C44E38] focus:ring-[#C44E38]"
            />
          </div>
        </div>

        {/* New Child Form */}
        {showNewChildForm && (
          <Card className="p-8 mb-8 bg-white border-[#E6E2DD] shadow-sm">
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6">
              Add New Child
            </h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Input
                label="Child's Name"
                value={newChildData.name}
                onChange={(value) => setNewChildData(prev => ({ ...prev, name: value }))}
                placeholder="Enter child's name"
                required
                className="bg-white border-[#E6E2DD] focus:border-[#C44E38] focus:ring-[#C44E38]"
              />
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  Grade/Age Band
                </label>
                <select
                  value={newChildData.gradeBand}
                  onChange={(e) => setNewChildData(prev => ({ ...prev, gradeBand: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-[#E6E2DD] focus:outline-none focus:ring-2 focus:ring-[#C44E38] focus:border-[#C44E38] bg-white"
                >
                  <option value="Infants (<2 years old)">Infants (&lt;2 years old)</option>
                  <option value="Toddlers (2-3 years old)">Toddlers (2-3 years old)</option>
                  <option value="Preschool (4-5 years old)">Preschool (4-5 years old)</option>
                  <option value="Transitional Kindergarten (4-5 years old)">TK (4-5 years old)</option>
                  <option value="Transition/Post-Secondary (18+ years old)">Post-Secondary (18+)</option>
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <Input
                label="Developmental Notes (Optional)"
                type="textarea"
                value={newChildData.developmentalNotes}
                onChange={(value) => setNewChildData(prev => ({ ...prev, developmentalNotes: value }))}
                placeholder="Any relevant developmental information..."
                rows={3}
                className="bg-white border-[#E6E2DD] focus:border-[#C44E38] focus:ring-[#C44E38]"
              />
            </div>

            <div className="flex items-center space-x-6 mb-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newChildData.hasIEP}
                  onChange={(e) => setNewChildData(prev => ({ ...prev, hasIEP: e.target.checked }))}
                  className="rounded border-[#E6E2DD] text-[#C44E38] focus:ring-[#C44E38]"
                />
                <span className="text-sm text-[#1A1A1A]">Has IEP</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newChildData.hasIFSP}
                  onChange={(e) => setNewChildData(prev => ({ ...prev, hasIFSP: e.target.checked }))}
                  className="rounded border-[#E6E2DD] text-[#C44E38] focus:ring-[#C44E38]"
                />
                <span className="text-sm text-[#1A1A1A]">Has IFSP</span>
              </label>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={handleCreateChild}
                className="bg-[#C44E38] hover:bg-[#A63D2A] text-white"
              >
                Create Child Profile
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowNewChildForm(false)}
                className="text-[#615E59] hover:text-[#1A1A1A]"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Children Grid */}
        {filteredChildren.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-white rounded-2xl border border-[#E6E2DD] flex items-center justify-center mx-auto mb-6 shadow-sm">
              <User className="w-10 h-10 text-[#C44E38]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">
              {searchQuery ? 'No children found' : 'No children added yet'}
            </h3>
            <p className="text-[#615E59] mb-8 max-w-md mx-auto">
              {searchQuery ? 
                'Try adjusting your search to find the child you\'re looking for.' : 
                'Add your first child to start tracking behaviors and getting personalized strategies.'
              }
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setShowNewChildForm(true)}
                icon={Plus}
                className="bg-[#C44E38] hover:bg-[#A63D2A] text-white px-8"
              >
                Add Your First Child
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChildren.map((child) => {
              const behaviorCount = getChildBehaviorCount(child.id);
              const lastBehaviorDate = getLastBehaviorDate(child.id);
              
              return (
                <Card 
                  key={child.id} 
                  className="p-6 bg-white border-[#E6E2DD] hover:shadow-lg hover:border-[#C44E38] transition-all duration-200 cursor-pointer group"
                  onClick={() => setCurrentView(`child-profile-detail-${child.id}`)}
                >
                  {/* Child Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[#C44E38] bg-opacity-10 rounded-full flex items-center justify-center group-hover:bg-[#C44E38] group-hover:bg-opacity-20 transition-colors duration-200">
                        <User className="w-6 h-6 text-[#C44E38]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#1A1A1A] group-hover:text-[#C44E38] transition-colors duration-200">
                          {child.name}
                        </h3>
                        <p className="text-sm text-[#615E59]">
                          {child.gradeBand}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {child.hasIEP && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                          IEP
                        </span>
                      )}
                      {child.hasIFSP && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          IFSP
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-[#C44E38]" />
                        <span className="text-sm text-[#615E59]">Behavior Logs</span>
                      </div>
                      <span className="text-lg font-bold text-[#1A1A1A]">{behaviorCount}</span>
                    </div>
                    
                    {lastBehaviorDate && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-[#615E59]">Last Entry</span>
                        </div>
                        <span className="text-sm font-medium text-[#1A1A1A]">
                          {lastBehaviorDate.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    {child.developmentalNotes && (
                      <div className="pt-2 border-t border-[#E6E2DD]">
                        <p className="text-xs text-[#615E59] mb-1">Developmental Notes:</p>
                        <p className="text-sm text-[#1A1A1A] line-clamp-2 leading-relaxed">
                          {child.developmentalNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-[#C44E38] hover:bg-[#A63D2A] text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentView(`child-profile-detail-${child.id}`);
                      }}
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Heart}
                      className="border-[#E6E2DD] text-[#615E59] hover:border-[#C44E38] hover:text-[#C44E38]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentView('behavior-log');
                      }}
                    >
                      Log Behavior
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};