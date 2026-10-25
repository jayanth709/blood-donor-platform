import React from 'react';
import { Inbox, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h4 className="text-base font-bold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button size="sm" variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export const LoadingSpinner: React.FC<{ message?: string; className?: string }> = ({
  message = 'Loading platform data...',
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 gap-3 ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-rose-700" />
      <span className="text-xs font-semibold text-slate-500">{message}</span>
    </div>
  );
};

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-rose-50 border border-rose-200 rounded-xl text-center">
      <AlertCircle className="w-8 h-8 text-rose-600 mb-2" />
      <h4 className="text-sm font-bold text-rose-900">An Error Occurred</h4>
      <p className="text-xs text-rose-700 mt-1 max-w-md">{message}</p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="mt-3">
          Try Again
        </Button>
      )}
    </div>
  );
};
