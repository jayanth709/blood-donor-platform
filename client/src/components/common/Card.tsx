import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  headerAction?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  onClick,
  headerAction,
  title,
  subtitle
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-200 ${
        hover ? 'hover:shadow-md hover:border-slate-300 cursor-pointer' : ''
      } ${className}`}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            {title && <h3 className="text-base font-bold text-slate-800">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  urgency?: boolean;
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  urgency = false,
  className = '',
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-5 border transition-all duration-200 ${
        urgency
          ? 'bg-rose-50/60 border-rose-200 shadow-sm hover:shadow-rose-100'
          : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md'
      } ${onClick ? 'cursor-pointer hover:border-slate-400' : ''} ${className}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <div
          className={`p-2.5 rounded-lg ${
            urgency ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700'
          }`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <h3 className={`text-2xl font-extrabold tracking-tight ${urgency ? 'text-rose-950' : 'text-slate-900'}`}>
          {value}
        </h3>
        {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
};
