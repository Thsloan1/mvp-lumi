import React, { useId } from 'react';
import { AlertCircle } from 'lucide-react';

interface AccessibleInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  rows?: number;
  min?: number;
  max?: number;
  maxLength?: number;
  autoComplete?: string;
  'aria-describedby'?: string;
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
  disabled = false,
  className = '',
  rows,
  min,
  max,
  maxLength,
  autoComplete,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  const inputId = useId();
  const errorId = useId();
  const helperId = useId();

  const inputClasses = `
    w-full px-4 py-3 rounded-xl border border-[#E6E2DD] 
    focus:outline-none focus:ring-2 focus:ring-[#C44E38] focus:border-[#C44E38]
    transition-all duration-200 bg-white
    ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
    ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}
    ${className}
  `;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const describedBy = [
    error ? errorId : null,
    helperText ? helperId : null,
    ariaDescribedBy
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-2">
      <label 
        htmlFor={inputId}
        className="block text-sm font-medium text-[#1A1A1A]"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={inputId}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows || 4}
          maxLength={maxLength}
          className={inputClasses}
          aria-describedby={describedBy}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          maxLength={maxLength}
          autoComplete={autoComplete}
          className={inputClasses}
          aria-describedby={describedBy}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
      )}
      
      {helperText && !error && (
        <p id={helperId} className="text-sm text-gray-600">
          {helperText}
        </p>
      )}
      
      {error && (
        <div id={errorId} className="flex items-start space-x-2" role="alert">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
};