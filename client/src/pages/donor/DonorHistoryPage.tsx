import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { EmptyState, LoadingSpinner } from '../../components/common/EmptyState';
import { donorService } from '../../services/donorService';
import { DonationHistoryItem } from '../../types';
import { Heart, Calendar, Hospital, CheckCircle2, Award, Clock } from 'lucide-react';

export const DonorHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<DonationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await donorService.getDonationHistory();
        setHistory(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const totalUnits = history.reduce((acc, curr) => acc + curr.unitsDonated, 0);

  return (
    <DashboardLayout
      title="Verified Donation History"
      subtitle="Complete chronological record of your past voluntary blood donations"
    >
      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-rose-900 to-rose-700 text-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-rose-200">Total Donated</span>
            <Award className="w-5 h-5 text-rose-200" />
          </div>
          <div className="text-3xl font-black mt-2">{totalUnits} Units</div>
          <p className="text-xs text-rose-100 mt-1">~{totalUnits * 3} lives directly impacted</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs uppercase font-bold tracking-wider text-slate-400">Total Sessions</div>
          <div className="text-3xl font-black text-slate-800 mt-2">{history.length} Events</div>
          <p className="text-xs text-slate-500 mt-1">Whole blood donations</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs uppercase font-bold tracking-wider text-slate-400">Next Eligible Date</div>
          <div className="text-2xl font-black text-emerald-700 mt-2">Immediately Eligible</div>
          <p className="text-xs text-slate-500 mt-1">90+ days elapsed since last donation</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading historical donation archives..." />
      ) : history.length === 0 ? (
        <EmptyState
          title="No Historical Donations Logged"
          description="Your verified donations will appear here once confirmed by hospital blood banks."
        />
      ) : (
        <div className="space-y-6">
          <Card title="Donation Timeline" subtitle="Hospital verified records">
            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-rose-200">
              {history.map((item) => (
                <div key={item._id} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-[19px] sm:-left-[27px] top-1 w-6 h-6 rounded-full bg-rose-600 border-4 border-white shadow flex items-center justify-center text-white">
                    <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                  </div>

                  <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl p-4 sm:p-5 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-rose-700 text-white">
                          {item.bloodGroup}
                        </span>
                        <span className="text-sm font-bold text-slate-900">{item.hospitalName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(item.donatedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
                      <p className="italic text-slate-600 font-medium">"{item.remarks}"</p>
                      <div className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <span>Units Donated:</span>
                        <span className="text-rose-700 font-bold">{item.unitsDonated} Unit (Whole Blood)</span>
                      </div>
                    </div>

                    {item.requestId && (
                      <div className="mt-2.5 text-[11px] text-slate-400 font-mono">
                        Linked Emergency Alert Ref: #{item.requestId}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};
