import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = "", title, icon }) => (
  <div className={`bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm ${className}`}>
    {(title || icon) && (
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2 bg-white">
        {icon && <span className="text-red-600">{icon}</span>}
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
    )}
    <div className="p-5">
      {children}
    </div>
  </div>
);

interface BadgeProps {
  label: string;
  variant?: 'default' | 'outline' | 'accent' | 'brand';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', className = "" }) => {
  const styles = {
    default: "bg-gray-100 text-gray-700 border border-gray-200",
    outline: "bg-transparent text-gray-500 border border-gray-300",
    accent: "bg-gray-900 text-white border border-gray-900",
    brand: "bg-red-50 text-red-700 border border-red-100"
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${styles[variant]} ${className}`}>
      {label}
    </span>
  );
};

export const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-5">
    <div className="flex items-center gap-3 mb-1">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900">
        {title}
      </h2>
      <div className="h-px flex-grow bg-gray-200 mt-1"></div>
    </div>
    {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
  </div>
);






