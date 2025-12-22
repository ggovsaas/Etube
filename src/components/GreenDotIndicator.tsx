'use client';

interface GreenDotIndicatorProps {
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function GreenDotIndicator({ 
  isOnline, 
  size = 'md',
  className = '' 
}: GreenDotIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  if (!isOnline) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full bg-green-500 border-2 border-white shadow-lg ${
          isOnline ? 'animate-pulse' : ''
        }`}
        title="Online"
      />
      {isOnline && (
        <div
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-green-500 opacity-75 animate-ping`}
        />
      )}
    </div>
  );
}


