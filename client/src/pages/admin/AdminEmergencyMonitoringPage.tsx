import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { UrgencyBadge, StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar, FilterPanel } from '../../components/common/SearchBar';
import { EmptyState, LoadingSpinner } from '../../components/common/EmptyState';
import { emergencyRequestService } from '../../services/emergencyRequestService';
import { EmergencyRequest } from '../../types';
import { BLOOD_GROUPS } from '../../utils/bloodCompatibility';
import { Activity, Flame, MapPin, Users, Clock } from 'lucide-react';

export const AdminEmergencyMonitoringPage: React.FC = () => {
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await emergencyRequestService.getRequests({
          bloodGroup: bloodGroupFilter,
          urgency: urgencyFilter,
          status: statusFilter,
          city: cityFilter
        });
        setRequests(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, [bloodGroupFilter, urgencyFilter, statusFilter, cityFilter]);

  const filtered = requests.filter(r => {
    if (search) {
      const q = search.toLowerCase();
      const matchHospital = r.hospital.name.toLowerCase().includes(q);
      const matchArea = r.location.area.toLowerCase().includes(q);
      const matchId = r._id.toLowerCase().includes(q);
      if (!matchHospital && !matchArea && !matchId) return false;
    }
    return true;
  });

  return (
    <DashboardLayout
      title="Regional Emergency Monitoring Dashboard"
      subtitle="Real-time multi-hospital trauma telemetry, donor response tracking, and fulfillment audit"
    >
      <div className="space-y-4 mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by hospital name, area, or request ID..."
        />

        <FilterPanel onReset={() => {
          setSearch('');
          setBloodGroupFilter('ALL');
          setUrgencyFilter('ALL');
          setStatusFilter('ALL');
          setCityFilter('ALL');
        }}>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Blood Group</label>
            <select
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="ALL">All Blood Groups</option>
              {BLOOD_GROUPS.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Urgency</label>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="ALL">All Urgencies</option>
              <option value="CRITICAL">Critical Emergency</option>
              <option value="HIGH">High Priority</option>
              <option value="NORMAL">Normal</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="SEARCHING">Searching</option>
              <option value="RESPONSE_RECEIVED">Response Received</option>
              <option value="FULFILLED">Fulfilled</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">City Jurisdiction</label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="ALL">All Cities</option>
              <option value="Chennai">Chennai</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
            </select>
          </div>
        </FilterPanel>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Scanning regional emergency channels..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Activity className="w-6 h-6" />}
          title="No Emergencies Recorded"
          description="There are currently no emergency alerts matching your selected query parameters."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Request ID</th>
                  <th className="px-5 py-3.5">Hospital Center</th>
                  <th className="px-5 py-3.5">Blood Needed</th>
                  <th className="px-5 py-3.5">Volume</th>
                  <th className="px-5 py-3.5">Urgency</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Responses</th>
                  <th className="px-5 py-3.5">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(req => {
                  const isCritical = req.urgency === 'CRITICAL';
                  return (
                    <tr key={req._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-4 font-mono font-bold text-slate-800">
                        #{req._id}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{req.hospital.name}</div>
                        <div className="text-[11px] text-slate-400">{req.hospital.phone}</div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-base font-black text-rose-700">{req.patientBloodGroup}</span>
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-800">
                        {req.fulfilledUnits} / {req.requiredUnits} Units
                      </td>

                      <td className="px-5 py-4">
                        <UrgencyBadge urgency={req.urgency} pulse={isCritical} />
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        <div className="font-medium text-slate-800">{req.location.area}</div>
                        <div className="text-[11px] text-slate-400">{req.location.city}</div>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={req.status} />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Users className="w-3.5 h-3.5 text-rose-600" />
                          <span>{req.responsesCount?.total || 0}</span>
                          <span className="text-[11px] text-emerald-700 font-normal">
                            ({req.responsesCount?.accepted || 0} accepted)
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
