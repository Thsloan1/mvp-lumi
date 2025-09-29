import React, { useState } from 'react';
import { User, Plus, Search, Filter, Calendar, FileText, TrendingUp } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { useAppContext } from '../../context/AppContext';
import { Child } from '../../types';

export const ChildProfilesManager: React.FC = () => {
  const { children, setChildren, behaviorLogs, setCurrentView } = useAppContext();
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
                Child Profiles
              </h1>
              <p className="text-gray-600">
                Manage individual child profiles and track behavior patterns
              </p>
            </div>
            <Button
              onClick={() => setShowNewChildForm(true)}
              icon={Plus}
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
            />
          </div>
        </div>

        {/* New Child Form */}
        {showNewChildForm && (
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
              Add New Child
            </h3>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <Input
                label="Child's Name"
                value={newChildData.name}
                onChange={(value) => setNewChildData(prev => ({ ...prev, name: value }))}
                placeholder="Enter child's name"
                required
              />
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  Grade/Age Band
                </label>
                <select
                  value={newChildData.gradeBand}
                  onChange={(e) => setNewChildData(prev => ({ ...prev, gradeBand: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-[#E6E2DD] focus:outline-none focus:ring-2 focus:ring-[#C44E38] focus:border-[#C44E38]"
                >
                  <option value="Infants (<2 years old)">Infants (&lt;2 years old)</option>
                  <option value="Toddlers (2-3 years old)">Toddlers (2-3 years old)</option>
                  <option value="Preschool (4-5 years old)">Preschool (4-5 years old)</option>
                  <option value="Transitional Kindergarten (4-5 years old)">Transitional Kindergarten (4-5 years old)</option>
                  <option value="Kindergarten">Kindergarten</option>
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
                <span className="text-sm">Has IEP</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newChildData.hasIFSP}
                  onChange={(e) => setNewChildData(prev => ({ ...prev, hasIFSP: e.target.checked }))}
                  className="rounded border-[#E6E2DD] text-[#C44E38] focus:ring-[#C44E38]"
                />
                <span className="text-sm">Has IFSP</span>
              </label>
            </div>

            <div className="flex space-x-3">
              <Button onClick={handleCreateChild}>
                Create Child Profile
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowNewChildForm(false)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Children Grid */}
        {filteredChildren.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#F8F6F4] rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">
              No children found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try adjusting your search' : 'Add your first child to get started'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setShowNewChildForm(true)}
                icon={Plus}
              >
                Add First Child
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChildren.map((child) => {
              const behaviorCount = getChildBehaviorCount(child.id);
              const lastBehaviorDate = getLastBehaviorDate(child.id);
              
              return (
                <Card key={child.id} className="p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#1A1A1A]">
                          {child.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {child.gradeBand}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {child.hasIEP && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          IEP
                        </span>
                      )}
                      {child.hasIFSP && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          IFSP
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Behavior Logs:</span>
                      <span className="font-medium text-[#1A1A1A]">{behaviorCount}</span>
                    </div>
                    {lastBehaviorDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Last Entry:</span>
                        <span className="font-medium text-[#1A1A1A]">
                          {lastBehaviorDate.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {child.developmentalNotes && (
                      <div className="text-sm">
                        <span className="text-gray-600">Notes:</span>
                        <p className="text-[#1A1A1A] mt-1 line-clamp-2">
                          {child.developmentalNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        // Navigate to child profile view
                        console.log('View profile for', child.name);
                      }}
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={FileText}
                      onClick={() => {
                        // Navigate to behavior log for this child
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

        {/* LumiEd Integration for Child Profiles */}
        <LumiEdIntegration 
          context="child-profile"
          className="mt-8"
        />
      </div>
    </div>
  );
};