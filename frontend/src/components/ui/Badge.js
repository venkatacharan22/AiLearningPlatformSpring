import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-cyan-100 text-cyan-800',
    purple: 'bg-purple-100 text-purple-800',
    pink: 'bg-pink-100 text-pink-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    // Dark variants
    'default-dark': 'bg-gray-800 text-gray-100',
    'primary-dark': 'bg-blue-800 text-blue-100',
    'success-dark': 'bg-green-800 text-green-100',
    'warning-dark': 'bg-yellow-800 text-yellow-100',
    'danger-dark': 'bg-red-800 text-red-100',
    // Gradient variants
    'gradient-blue': 'bg-gradient-to-r from-blue-500 to-purple-600 text-white',
    'gradient-green': 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
    'gradient-red': 'bg-gradient-to-r from-red-500 to-pink-600 text-white',
    'gradient-yellow': 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

// Predefined difficulty badges
export const DifficultyBadge = ({ difficulty, ...props }) => {
  const difficultyConfig = {
    'BEGINNER': { variant: 'success', text: 'Beginner' },
    'EASY': { variant: 'success', text: 'Easy' },
    'INTERMEDIATE': { variant: 'warning', text: 'Intermediate' },
    'MEDIUM': { variant: 'warning', text: 'Medium' },
    'ADVANCED': { variant: 'danger', text: 'Advanced' },
    'HARD': { variant: 'danger', text: 'Hard' },
    'EXPERT': { variant: 'purple', text: 'Expert' }
  };

  const config = difficultyConfig[difficulty?.toUpperCase()] || { variant: 'default', text: difficulty };

  return (
    <Badge variant={config.variant} {...props}>
      {config.text}
    </Badge>
  );
};

// Predefined status badges
export const StatusBadge = ({ status, ...props }) => {
  const statusConfig = {
    'ACTIVE': { variant: 'success', text: 'Active' },
    'INACTIVE': { variant: 'default', text: 'Inactive' },
    'PENDING': { variant: 'warning', text: 'Pending' },
    'COMPLETED': { variant: 'success', text: 'Completed' },
    'IN_PROGRESS': { variant: 'primary', text: 'In Progress' },
    'FAILED': { variant: 'danger', text: 'Failed' },
    'CANCELLED': { variant: 'default', text: 'Cancelled' },
    'PUBLISHED': { variant: 'success', text: 'Published' },
    'DRAFT': { variant: 'warning', text: 'Draft' }
  };

  const config = statusConfig[status?.toUpperCase()] || { variant: 'default', text: status };

  return (
    <Badge variant={config.variant} {...props}>
      {config.text}
    </Badge>
  );
};

export default Badge;
