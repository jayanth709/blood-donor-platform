import React from 'react';
import { Search, X, Filter } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search records...',
  className = ''
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 transition"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

interface FilterPanelProps {
  children: React.ReactNode;
  onReset?: () => void;
  title?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  children,
  onReset,
  title = 'Filters'
}) => {
  return (
    <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>{title}</span>
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="text-xs text-rose-700 hover:text-rose-900 font-semibold transition"
          >
            Reset All
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {children}
      </div>
    </div>
  );
};
