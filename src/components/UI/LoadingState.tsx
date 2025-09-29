import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'md',
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <LoadingSpinner size={size} className="mb-4" />
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );
};

export const FullPageLoading: React.FC<{ message?: string }> = ({ 
  message = 'Loading your dashboard...' 
}) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-[#C44E38] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
          <LoadingSpinner size="lg" />
        </div>
        <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">
          {message}
        </h3>
        <p className="text-gray-600">
          This should only take a moment...
        </p>
      </div>
    </div>
  );
};