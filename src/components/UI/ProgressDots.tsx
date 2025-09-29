import React from 'react';

interface ProgressDotsProps {
  total: number;
  current: number;
  className?: string;
}

export const ProgressDots: React.FC<ProgressDotsProps> = ({
  total,
  current,
  className = ''
}) => {
  return (
    <div className={`flex justify-center space-x-2 ${className}`}>
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={`
            h-2 w-2 rounded-full transition-all duration-300
            ${index <= current 
              ? 'bg-[#C44E38]' 
              : 'bg-[#E6E2DD]'
            }
          `}
        />
      ))}
    </div>
  );
};