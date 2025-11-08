'use client';

import { ContrastIcon } from './ContrastIcon';

interface LoadingSpinnerProps {
  size?: number;
  showText?: boolean;
  text?: string;
  color?: string;
}

export const LoadingSpinner = ({ 
  size = 32, 
  showText = false, 
  text = "Loading...",
  color 
}: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div 
        className="animate-spin"
        style={{
          color: color || 'currentColor'
        }}
      >
        <ContrastIcon size={size} />
      </div>
      {showText && (
        <p style={{ 
          color: color || 'currentColor',
          fontSize: '14px'
        }}>
          {text}
        </p>
      )}
    </div>
  );
};
