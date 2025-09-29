import React from 'react';
import { ErrorToast } from './ErrorToast';
import { useErrorHandler } from '../../hooks/useErrorHandler';

export const ErrorToastContainer: React.FC = () => {
  const { errors, removeError } = useErrorHandler();

  if (errors.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {errors.map((error) => (
        <ErrorToast
          key={error.id}
          error={error}
          onDismiss={removeError}
        />
      ))}
    </div>
  );
};