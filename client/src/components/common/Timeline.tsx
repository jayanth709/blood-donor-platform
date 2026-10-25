import React from 'react';
import { RequestStatus } from '../../types';
import { Check, Clock, Search, CheckCircle2, XCircle } from 'lucide-react';

interface RequestTimelineProps {
  currentStatus: RequestStatus;
  createdAt: string;
  responseCount?: number;
  className?: string;
}

export const RequestTimeline: React.FC<RequestTimelineProps> = ({
  currentStatus,
  createdAt,
  responseCount = 0,
  className = ''
}) => {
  const isCancelled = currentStatus === 'CANCELLED';

  const steps = [
    {
      id: 'CREATED',
      label: 'Request Created',
      desc: new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: <Clock className="w-4 h-4" />
    },
    {
      id: 'SEARCHING',
      label: 'Searching Donors',
      desc: 'Filtering compatible & nearby donors',
      icon: <Search className="w-4 h-4" />
    },
    {
      id: 'RESPONSE_RECEIVED',
      label: 'Responses Received',
      desc: responseCount > 0 ? `${responseCount} donor response(s) logged` : 'Awaiting donor confirmations',
      icon: <Check className="w-4 h-4" />
    },
    {
      id: 'FULFILLED',
      label: isCancelled ? 'Request Cancelled' : 'Emergency Completed',
      desc: isCancelled ? 'Closed without transfusion' : 'Required units coordinated & fulfilled',
      icon: isCancelled ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />
    }
  ];

  const getStepIndex = (status: RequestStatus) => {
    switch (status) {
      case 'OPEN':
      case 'SEARCHING':
        return 1;
      case 'RESPONSE_RECEIVED':
        return 2;
      case 'FULFILLED':
      case 'CANCELLED':
        return 3;
      default:
        return 0;
    }
  };

  const activeIndex = getStepIndex(currentStatus);

  return (
    <div className={`w-full py-4 ${className}`}>
      <div className="flex items-center justify-between relative">
        {/* Connecting progress track line */}
        <div className="absolute top-5 left-6 right-6 h-0.5 bg-slate-200 -z-0">
          <div
            className={`h-full transition-all duration-500 ${
              isCancelled ? 'bg-rose-500' : 'bg-emerald-600'
            }`}
            style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center text-center px-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : isCurrent
                    ? isCancelled
                      ? 'bg-rose-600 border-rose-600 text-white shadow-md ring-4 ring-rose-100'
                      : 'bg-white border-rose-600 text-rose-600 shadow-md ring-4 ring-rose-100'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {step.icon}
              </div>
              <span
                className={`text-xs mt-2 font-bold ${
                  isCurrent ? 'text-slate-900 font-extrabold' : isDone ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
              <span className="text-[10px] text-slate-500 max-w-[90px] truncate sm:max-w-none">
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
