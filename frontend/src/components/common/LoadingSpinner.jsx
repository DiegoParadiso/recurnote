import React from 'react';

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Cargando...', 
  className = '',
  showText = true 
}) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]}`}></div>
      {showText && text && (
        <p className={`mt-2 text-gray-600 ${textSizes[size]}`}>{text}</p>
      )}
    </div>
  );
}
