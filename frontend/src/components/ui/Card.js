import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = false, 
  padding = 'md',
  background = 'white',
  border = true,
  shadow = 'sm',
  ...props 
}) => {
  const baseClasses = 'rounded-xl transition-all duration-200';
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    transparent: 'bg-white/10 backdrop-blur-lg',
    gradient: 'bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-lg'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const borderClasses = border ? 'border border-gray-200 dark:border-white/20' : '';
  const hoverClasses = hover ? 'hover:shadow-lg hover:scale-105 cursor-pointer' : '';

  const classes = `${baseClasses} ${paddingClasses[padding]} ${backgroundClasses[background]} ${shadowClasses[shadow]} ${borderClasses} ${hoverClasses} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b border-gray-200 dark:border-white/20 pb-4 mb-4 ${className}`}>
    {children}
  </div>
);

const CardBody = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={`border-t border-gray-200 dark:border-white/20 pt-4 mt-4 ${className}`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
