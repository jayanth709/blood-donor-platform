import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, StatCard } from '../../components/common/Card';
import { UrgencyBadge, StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState, LoadingSpinner } from '../../components/common/EmptyState';
import { emergencyRequestService } from '../../services/emergencyRequestService';
import { hospitalService } from '../../services/hospitalService';
import { EmergencyRequest } from '../../types';
import { 
  PlusCircle, 
  Flame, 
  AlertTriangle, 
  Users, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  MapPin, 
  Search,
  Building2
} from 'lucide-react';

export const HospitalDashboard: React.FC = () => {
  const { currentUser, hospitalProfile } = useAuth();
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [stats, setStats] = useState<any>({
    activeCount: 0,
    criticalCount: 0,
    completedCount: 0,
    totalResponses: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hospitalName = hospitalProfile?.hospitalName || currentUser?.name || 'Apollo Speciality Hospitals';
        const reqs = await emergencyRequestService.getRequests({ hospitalId: hospitalName });
        const st = await hospitalService.getHospitalStats(hospitalName);
        setRequests(reqs);
        setStats(st);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentUser, hospitalProfile]);

  const activeReqs = requests.filter(r => r.status !== 'FULFILLED' && r.status !== 'CANCELLED');

  return (
    <DashboardLayout
      title={hospitalProfile?.hospitalName || 'Hospital Emergency Portal'}
      subtitle="Trauma & Emergency Blood Response Operations"
      actions={
        <Link to="/hospital/create-request">
          <Button
            size="md"
            variant="danger"
            className="font-bold shadow-lg shadow-rose-900/10"
            leftIcon={<PlusCircle className="w-4 h-4 stroke-[2.5]" />}
          >
            + Create Emergency Request
          </Button>
        </Link>
      }
    >
      {/* Top Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Active Requests"
          value={stats.activeCount}
          subtitle="Currently dispatching / in progress"
          icon={<Clock className="w-5 h-5" />}
        />

        <StatCard
          title="Requiring Immediate Attention"
          value={stats.criticalCount}
          subtitle="Critical Level 1 trauma cases"
          icon={<Flame className="w-5 h-5" />}
          urgency={stats.criticalCount > 0}
        />

        <StatCard
          title="Donor Responses Logged"
          value={stats.totalResponses}
          subtitle="Across active & past cases"
          icon={<Users className="w-5 h-5" />}
        />

        <StatCard
          title="Completed Emergency Cases"
          value={stats.completedCount}
          subtitle="Successfully fulfilled & transfused"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
      </div>

      {/* Primary Section: Active Emergency Operations */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-600 fill-rose-600" />
              Active Emergency Blood Broadcasts
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live cases currently matching registered local donors and receiving responses
            </p>
          </div>

          <Link to="/hospital/active-requests">
            <Button size="sm" variant="ghost" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Manage All ({activeReqs.length})
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Loading hospital triage broadcasts..." />
        ) : activeReqs.length === 0 ? (
          <EmptyState
            title="No Active Emergency Broadcasts"
            description="Your medical facility currently has zero open emergency blood broadcasts. When an urgent transfusion is required, broadcast an emergency alert to nearby donors."
            actionLabel="+ Create Emergency Request"
            onAction={() => window.location.href = '/hospital/create-request'}
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Urgency & ID</th>
                    <th className="px-6 py-3.5">Blood Needed</th>
                    <th className="px-6 py-3.5">Units Status</th>
                    <th className="px-6 py-3.5">Location Area</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Responses</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeReqs.map(req => {
                    const isCritical = req.urgency === 'CRITICAL';
                    return (
                      <tr key={req._id} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <UrgencyBadge urgency={req.urgency} pulse={isCritical} />
                            <span className="font-mono font-bold text-slate-700">#{req._id}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-base font-black text-rose-700">{req.patientBloodGroup}</div>
                          <div className="text-[11px] text-slate-500">Whole Blood / PRBC</div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">
                            {req.fulfilledUnits} / {req.requiredUnits} Units
                          </div>
                          <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-full rounded-full"
                              style={{ width: `${Math.min(100, (req.fulfilledUnits / req.requiredUnits) * 100)}%` }}
                            />
                          </div>
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          <div className="font-semibold text-slate-800">{req.location.area}</div>
                          <div className="text-[11px] text-slate-500">{req.location.city}</div>
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge status={req.status} />
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {req.responsesCount?.accepted || 0} Accepted
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/hospital/matched-donors?requestId=${req._id}&bloodGroup=${encodeURIComponent(req.patientBloodGroup)}&city=${encodeURIComponent(req.location.city)}`}>
                              <Button size="sm" variant="outline" leftIcon={<Search className="w-3.5 h-3.5 text-rose-700" />}>
                                View Matched Donors
                              </Button>
                            </Link>
                            <Link to={`/hospital/requests/${req._id}`}>
                              <Button size="sm" variant="ghost">
                                Details
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
