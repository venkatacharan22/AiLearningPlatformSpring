import React from 'react';

const ProgressBar = ({ 
  progress, 
  className = '', 
  showPercentage = true, 
  size = 'medium',
  color = 'primary' 
}) => {
  const sizeClasses = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-3'
  };

  const colorClasses = {
    primary: 'bg-primary-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600',
    blue: 'bg-blue-600'
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div 
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
      {showPercentage && (
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
