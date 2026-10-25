import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatusBadge, UrgencyBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState, LoadingSpinner } from '../../components/common/EmptyState';
import { donorService } from '../../services/donorService';
import { DonorResponse } from '../../types';
import { CheckSquare, ArrowRight, Hospital, Calendar, Clock } from 'lucide-react';

export const DonorResponsesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [responses, setResponses] = useState<DonorResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResponses = async () => {
      if (!currentUser) return;
      try {
        const resps = await donorService.getMyResponses(currentUser.id);
        setResponses(resps);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResponses();
  }, [currentUser]);

  return (
    <DashboardLayout
      title="My Emergency Responses"
      subtitle="History and status of emergency requests you have responded to"
    >
      {isLoading ? (
        <LoadingSpinner message="Loading your emergency response ledger..." />
      ) : responses.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-6 h-6" />}
          title="No Responses Logged Yet"
          description="You haven't responded to any hospital emergency alerts yet. Compatible alerts will appear on your dashboard when hospital requests arise."
          actionLabel="View Active Requests"
          onAction={() => window.location.href = '/donor/requests'}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Request ID</th>
                  <th className="px-6 py-3.5">Hospital Center</th>
                  <th className="px-6 py-3.5">Blood Needed</th>
                  <th className="px-6 py-3.5">My Decision</th>
                  <th className="px-6 py-3.5">Response Time</th>
                  <th className="px-6 py-3.5">Request Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {responses.map((resp) => {
                  const req = resp.request;
                  return (
                    <tr key={resp._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-mono font-bold text-slate-800">
                        #{resp.requestId}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{req?.hospital.name || 'Medical Center'}</div>
                        <div className="text-[11px] text-slate-500">{req?.location.area}, {req?.location.city}</div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-black text-rose-700 text-sm">
                          {resp.donorProfile?.bloodGroup || req?.patientBloodGroup || 'O+'}
                        </span>
                        <div className="text-[11px] text-slate-500">{req?.requiredUnits} units</div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold ${
                            resp.status === 'ACCEPTED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {resp.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(resp.respondedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(resp.respondedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={req?.status || 'OPEN'} />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link to={`/donor/requests/${resp.requestId}`}>
                          <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
