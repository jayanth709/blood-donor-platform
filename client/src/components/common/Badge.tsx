import React from 'react';
import { UrgencyLevel, RequestStatus, ResponseStatus } from '../../types';
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, XCircle, Search, Flame } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'slate' | 'red' | 'emerald' | 'amber' | 'blue' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  className = ''
}) => {
  const variantStyles = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200'
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 font-medium',
    md: 'text-sm px-3 py-1 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const UrgencyBadge: React.FC<{ urgency: UrgencyLevel; pulse?: boolean }> = ({
  urgency,
  pulse = false
}) => {
  if (urgency === 'CRITICAL') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-red-600 text-white shadow-sm ${
          pulse ? 'animate-emergency' : ''
        }`}
      >
        <Flame className="w-3.5 h-3.5 fill-current" />
        CRITICAL EMERGENCY
      </span>
    );
  }

  if (urgency === 'HIGH') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
        High Priority
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
      <Clock className="w-3.5 h-3.5 text-slate-500" />
      Normal Priority
    </span>
  );
};

export const StatusBadge: React.FC<{ status: RequestStatus | ResponseStatus | string }> = ({ status }) => {
  switch (status) {
    case 'ACCEPTED':
    case 'FULFILLED':
    case 'verified':
    case 'active':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          {status === 'FULFILLED' ? 'Completed / Fulfilled' : status === 'ACCEPTED' ? 'Accepted' : status}
        </span>
      );

    case 'PENDING':
    case 'SEARCHING':
    case 'OPEN':
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
          <Search className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
          {status === 'SEARCHING' ? 'Searching Donors' : status === 'OPEN' ? 'Active / Open' : status}
        </span>
      );

    case 'RESPONSE_RECEIVED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          Response Received
        </span>
      );

    case 'REJECTED':
    case 'CANCELLED':
    case 'suspended':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          {status}
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {status}
        </span>
      );
  }
};
