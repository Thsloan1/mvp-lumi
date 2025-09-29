import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  selected?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  selected = false
}) => {
  const baseClasses = 'bg-[#F8F6F4] rounded-2xl border border-[#E6E2DD] transition-all duration-200';
  const hoverClasses = hoverable ? 'hover:shadow-md hover:border-[#C44E38] cursor-pointer' : '';
  const selectedClasses = selected ? 'border-[#C44E38] ring-2 ring-[#C44E38]/20' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`
        ${baseClasses}
        ${hoverClasses}
        ${selectedClasses}
        ${clickableClasses}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};