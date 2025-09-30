import React, { useState } from 'react';
import { MessageCircle, Star, Send, X, AlertCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { useAppContext } from '../../context/AppContext';
import { safeLocalStorageGet, safeLocalStorageSet } from '../../utils/jsonUtils';

interface TestUserFeedbackWidgetProps {
  module: string;
  onClose?: () => void;
}

export const TestUserFeedbackWidget: React.FC<TestUserFeedbackWidgetProps> = ({
  module,
  onClose
}) => {
  const { currentView, toast } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    feedback: '',
    suggestions: '',
    priority: 'medium',
    category: 'general',
    testerInfo: {
      name: '',
      role: '',
      accessCode: ''
    }
  });

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'critical', label: 'Critical Issue' }
  ];

  const categoryOptions = [
    { value: 'general', label: 'General Feedback' },
    { value: 'usability', label: 'Usability Issue' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'content', label: 'Content/Clinical Review' },
    { value: 'performance', label: 'Performance Issue' }
  ];

  const handleSubmitFeedback = () => {
    if (!feedbackData.rating || !feedbackData.feedback.trim()) {
      toast.error('Missing Information', 'Please provide a rating and feedback');
      return;
    }

    const feedback = {
      id: Date.now().toString(),
      module,
      currentView,
      rating: feedbackData.rating,
      feedback: feedbackData.feedback,
      suggestions: feedbackData.suggestions,
      priority: feedbackData.priority,
      category: feedbackData.category,
      testerName: feedbackData.testerInfo.name || 'Anonymous',
      role: feedbackData.testerInfo.role || 'tester',
      accessCode: feedbackData.testerInfo.accessCode,
      submittedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Save to localStorage
    const existingFeedback = safeLocalStorageGet('lumi_test_feedback', []);
    existingFeedback.push(feedback);
    safeLocalStorageSet('lumi_test_feedback', existingFeedback);

    // Log feedback notification (would send email in production)
    console.log('📧 Feedback notification would be sent:', feedback);

    // Update test user feedback count
    const testUsers = safeLocalStorageGet('lumi_test_users', []);
    const updatedUsers = testUsers.map((user: any) => 
      user.accessCode === feedbackData.testerInfo.accessCode 
        ? { ...user, feedbackSubmitted: (user.feedbackSubmitted || 0) + 1, lastActive: new Date().toISOString() }
        : user
    );
    safeLocalStorageSet('lumi_test_users', updatedUsers);

    toast.success('Feedback Submitted', 'Thank you for your input!');
    
    // Reset form
    setFeedbackData({
      rating: 0,
      feedback: '',
      suggestions: '',
      priority: 'medium',
      category: 'general',
      testerInfo: { name: '', role: '', accessCode: '' }
    });
    setIsOpen(false);
    
    if (onClose) onClose();
  };

  // Check if user is a test user
  const testUsers = safeLocalStorageGet('lumi_test_users', []);
  const isTestUser = testUsers.length > 0;

  if (!isTestUser) {
    return null;
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
          icon={MessageCircle}
          size="sm"
        >
          Submit Feedback
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 w-[400px]">
      <Card className="p-6 bg-green-50 border-green-200 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-green-900">
              Test Feedback
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-green-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Tester Info */}
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <h4 className="font-medium text-green-900 mb-2 text-sm">Tester Information</h4>
            <div className="space-y-2">
              <Input
                label="Your Name"
                value={feedbackData.testerInfo.name}
                onChange={(value) => setFeedbackData(prev => ({
                  ...prev,
                  testerInfo: { ...prev.testerInfo, name: value }
                }))}
                placeholder="Enter your name"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Code
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={feedbackData.testerInfo.accessCode}
                    onChange={(value) => setFeedbackData(prev => ({
                      ...prev,
                      testerInfo: { ...prev.testerInfo, accessCode: value }
                    }))}
                    placeholder="Enter your access code"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use this code to identify your feedback submissions
                </p>
              </div>
            </div>
          </div>

          {/* Module & Rating */}
          <div>
            <label className="block text-sm font-medium text-green-900 mb-2">
              Rating for: {module || currentView}
            </label>
            <div className="flex items-center space-x-1 mb-3">
              {Array.from({length: 5}).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFeedbackData(prev => ({ ...prev, rating: i + 1 }))}
                  className="focus:outline-none"
                >
                  <Star 
                    className={`w-6 h-6 transition-colors ${
                      i < feedbackData.rating 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300 hover:text-yellow-300'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <Input
            label="Feedback"
            type="textarea"
            value={feedbackData.feedback}
            onChange={(value) => setFeedbackData(prev => ({ ...prev, feedback: value }))}
            placeholder="Share your thoughts on this module..."
            rows={3}
          />

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-2">
            <Select
              label="Category"
              value={feedbackData.category}
              onChange={(value) => setFeedbackData(prev => ({ ...prev, category: value }))}
              options={categoryOptions}
            />
            <Select
              label="Priority"
              value={feedbackData.priority}
              onChange={(value) => setFeedbackData(prev => ({ ...prev, priority: value }))}
              options={priorityOptions}
            />
          </div>

          {/* Suggestions */}
          <Input
            label="Suggestions (Optional)"
            type="textarea"
            value={feedbackData.suggestions}
            onChange={(value) => setFeedbackData(prev => ({ ...prev, suggestions: value }))}
            placeholder="Any specific improvements or ideas..."
            rows={2}
          />

          <Button
            onClick={handleSubmitFeedback}
            disabled={!feedbackData.rating || !feedbackData.feedback.trim()}
            className="w-full"
            icon={Send}
          >
            Submit Feedback
          </Button>
        </div>
      </Card>
    </div>
  );
};