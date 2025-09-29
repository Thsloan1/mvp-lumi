import React, { useEffect } from 'react';
import { X, AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { AppError } from '../../hooks/useErrorHandler';

interface ErrorToastProps {
  error: AppError;
  onDismiss: (errorId: string) => void;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({ error, onDismiss }) => {
  useEffect(() => {
    // Auto-dismiss non-critical errors after 5 seconds
    if (error.type !== 'auth' && error.type !== 'permission') {
      const timer = setTimeout(() => {
        onDismiss(error.id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, onDismiss]);

  const getErrorIcon = () => {
    switch (error.type) {
      case 'validation':
        return <AlertCircle className="w-5 h-5" />;
      case 'network':
        return <AlertTriangle className="w-5 h-5" />;
      case 'auth':
      case 'permission':
        return <AlertTriangle className="w-5 h-5" />;
      case 'subscription':
        return <Info className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getErrorStyles = () => {
    switch (error.type) {
      case 'validation':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-600'
        };
      case 'network':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: 'text-red-600'
        };
      case 'auth':
      case 'permission':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: 'text-red-600'
        };
      case 'subscription':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: 'text-gray-600'
        };
    }
  };

  const styles = getErrorStyles();

  return (
    <div className={`
      ${styles.bg} ${styles.border} border rounded-xl p-4 shadow-lg
      animate-in slide-in-from-right-full duration-300
    `}>
      <div className="flex items-start space-x-3">
        <div className={`${styles.icon} mt-0.5`}>
          {getErrorIcon()}
        </div>
        <div className="flex-1">
          <p className={`font-medium ${styles.text} mb-1`}>
            {error.message}
          </p>
          {error.details && (
            <p className={`text-sm ${styles.text} opacity-75`}>
              {error.details}
            </p>
          )}
          {error.context && process.env.NODE_ENV === 'development' && (
            <details className="mt-2">
              <summary className={`text-xs ${styles.text} cursor-pointer`}>
                Debug Info
              </summary>
              <pre className={`text-xs ${styles.text} mt-1 overflow-auto`}>
                {JSON.stringify(error.context, null, 2)}
              </pre>
            </details>
          )}
        </div>
        <button
          onClick={() => onDismiss(error.id)}
          className={`${styles.icon} hover:opacity-75 transition-opacity`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};