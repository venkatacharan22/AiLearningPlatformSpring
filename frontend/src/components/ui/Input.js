import React, { forwardRef } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

const Input = forwardRef(({ 
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  containerClassName = '',
  type = 'text',
  ...props 
}, ref) => {
  const baseClasses = 'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  const normalClasses = 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  const errorClasses = 'border-red-300 focus:border-red-500 focus:ring-red-500 pr-10';
  const iconPadding = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';
  const sizePadding = 'px-3 py-2 text-sm';

  const inputClasses = `${baseClasses} ${error ? errorClasses : normalClasses} ${iconPadding} ${sizePadding} ${className}`;

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-sm">
              {leftIcon}
            </span>
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          {...props}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
          </div>
        )}
        {rightIcon && !error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-sm">
              {rightIcon}
            </span>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
