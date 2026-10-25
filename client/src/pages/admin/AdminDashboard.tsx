import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, StatCard } from '../../components/common/Card';
import { UrgencyBadge, StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/EmptyState';
import { adminService } from '../../services/adminService';
import { emergencyRequestService } from '../../services/emergencyRequestService';
import { EmergencyRequest } from '../../types';
import { 
  Users, 
  Building2, 
  Flame, 
  CheckCircle2, 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({
    totalDonors: 0,
    availableDonors: 0,
    totalHospitals: 0,
    verifiedHospitals: 0,
    activeRequests: 0,
    criticalEmergencies: 0,
    completedRequests: 0
  });
  const [recentRequests, setRecentRequests] = useState<EmergencyRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const s = await adminService.getPlatformStats();
        const reqs = await emergencyRequestService.getRequests();
        setStats(s);
        setRecentRequests(reqs.slice(0, 5));
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  return (
    <DashboardLayout
      title="Platform Administrative Monitoring & Oversight"
      subtitle="State healthcare emergency blood dispatch system oversight"
      actions={
        <div className="flex items-center gap-2">
          <Link to="/admin/monitoring">
            <Button size="sm" variant="danger" leftIcon={<Flame className="w-3.5 h-3.5 fill-current" />}>
              Monitor Emergencies
            </Button>
          </Link>
          <Link to="/admin/donors">
            <Button size="sm" variant="outline" leftIcon={<Users className="w-3.5 h-3.5" />}>
              Manage Donors
            </Button>
          </Link>
        </div>
      }
    >
      {/* Platform Real-Data Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Registered Donors"
          value={stats.totalDonors}
          subtitle={`${stats.availableDonors} currently marked Available`}
          icon={<Users className="w-5 h-5" />}
        />

        <StatCard
          title="Enrolled Hospital Centers"
          value={stats.totalHospitals}
          subtitle={`${stats.verifiedHospitals} verified medical facilities`}
          icon={<Building2 className="w-5 h-5" />}
        />

        <StatCard
          title="Active Emergency Alerts"
          value={stats.activeRequests}
          subtitle={`${stats.criticalEmergencies} critical trauma cases`}
          icon={<Flame className="w-5 h-5" />}
          urgency={stats.criticalEmergencies > 0}
        />

        <StatCard
          title="Completed Transfusion Cases"
          value={stats.completedRequests}
          subtitle="Fulfilled emergency requirements"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
      </div>

      {/* Real-time System Monitoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Emergency Monitoring Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-700" />
                Live Emergency Feed
              </h2>
              <p className="text-xs text-slate-500">Cross-hospital dispatch activity across all municipal zones</p>
            </div>
            <Link to="/admin/monitoring">
              <Button size="sm" variant="ghost" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Full Monitor
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner message="Querying platform telemetry..." />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3">ID & Urgency</th>
                    <th className="px-5 py-3">Hospital</th>
                    <th className="px-5 py-3">Blood Needed</th>
                    <th className="px-5 py-3">City Area</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentRequests.map(req => (
                    <tr key={req._id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <UrgencyBadge urgency={req.urgency} />
                          <span className="font-mono font-bold text-slate-800">#{req._id}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-800">{req.hospital.name}</td>
                      <td className="px-5 py-3.5 font-black text-rose-700">
                        {req.patientBloodGroup} ({req.requiredUnits} Units)
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {req.location.area}, {req.location.city}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={req.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Col: Administrative Status & Health Protocol Audit */}
        <div className="space-y-6">
          <Card title="Administrative Oversight" subtitle="Security & verification standards">
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-800">Role-Based Access Control</h4>
                  <p className="text-slate-500 mt-0.5">Strict authorization barriers between Donors, Hospitals, and State Admins.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <Users className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-800">Donor Account Governance</h4>
                  <p className="text-slate-500 mt-0.5">Inspect donor records and pause suspicious or non-responsive accounts instantly.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <Building2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-800">Hospital Accreditation</h4>
                  <p className="text-slate-500 mt-0.5">Validate clinical license numbers before enabling broadcast authority.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
