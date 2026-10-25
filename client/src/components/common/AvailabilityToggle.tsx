import React from 'react';
import { Check, Power } from 'lucide-react';

interface AvailabilityToggleProps {
  isAvailable: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AvailabilityToggle: React.FC<AvailabilityToggleProps> = ({
  isAvailable,
  onToggle,
  isLoading = false,
  className = '',
  size = 'md'
}) => {
  return (
    <div
      onClick={() => !isLoading && onToggle()}
      className={`group relative inline-flex items-center gap-3 p-1.5 rounded-full cursor-pointer select-none transition-all duration-300 border ${
        isAvailable
          ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60'
          : 'bg-slate-200/70 border-slate-300 hover:border-slate-400'
      } ${className}`}
      role="switch"
      aria-checked={isAvailable}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (!isLoading) onToggle();
        }
      }}
    >
      {/* Switch Knob */}
      <div
        className={`flex items-center justify-center rounded-full transition-transform duration-300 shadow-md ${
          size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'
        } ${
          isAvailable
            ? 'translate-x-0 bg-emerald-600 text-white'
            : 'translate-x-0 bg-slate-500 text-white'
        }`}
      >
        {isAvailable ? (
          <Check className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} stroke-[3]`} />
        ) : (
          <Power className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
        )}
      </div>

      {/* Status Text & Status Beacon */}
      <div className="flex items-center gap-2 pr-3">
        <span
          className={`font-bold tracking-wide uppercase transition-colors ${
            size === 'sm' ? 'text-xs' : 'text-sm'
          } ${isAvailable ? 'text-emerald-800' : 'text-slate-600'}`}
        >
          {isAvailable ? 'Available to Donate' : 'Unavailable'}
        </span>
        <span
          className={`w-2 h-2 rounded-full ${
            isAvailable ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
          }`}
        />
      </div>
    </div>
  );
};
