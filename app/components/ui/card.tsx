import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`bg-white shadow-sm rounded-lg p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
