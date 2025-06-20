import React from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  dismissible = false, 
  onDismiss,
  className = '',
  icon = true,
  ...props 
}) => {
  const typeConfig = {
    success: {
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      textColor: 'text-green-800 dark:text-green-200',
      iconColor: 'text-green-600 dark:text-green-400',
      icon: CheckCircleIcon
    },
    error: {
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-800 dark:text-red-200',
      iconColor: 'text-red-600 dark:text-red-400',
      icon: XCircleIcon
    },
    warning: {
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      icon: ExclamationTriangleIcon
    },
    info: {
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-800 dark:text-blue-200',
      iconColor: 'text-blue-600 dark:text-blue-400',
      icon: InformationCircleIcon
    }
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <div 
      className={`rounded-lg border p-4 ${config.bgColor} ${config.borderColor} ${className}`}
      role="alert"
      {...props}
    >
      <div className="flex items-start">
        {icon && (
          <div className="flex-shrink-0">
            <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
          </div>
        )}
        <div className={`${icon ? 'ml-3' : ''} flex-1`}>
          {title && (
            <h3 className={`text-sm font-medium ${config.textColor} mb-1`}>
              {title}
            </h3>
          )}
          {message && (
            <div className={`text-sm ${config.textColor} ${title ? 'opacity-90' : ''}`}>
              {message}
            </div>
          )}
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              className={`inline-flex rounded-md p-1.5 ${config.textColor} hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-current`}
              onClick={onDismiss}
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
