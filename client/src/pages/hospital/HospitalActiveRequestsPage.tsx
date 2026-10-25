import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { UrgencyBadge, StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar, FilterPanel } from '../../components/common/SearchBar';
import { EmptyState, LoadingSpinner } from '../../components/common/EmptyState';
import { emergencyRequestService } from '../../services/emergencyRequestService';
import { EmergencyRequest } from '../../types';
import { PlusCircle, Search, ArrowRight, MapPin, Flame } from 'lucide-react';

export const HospitalActiveRequestsPage: React.FC = () => {
  const { currentUser, hospitalProfile } = useAuth();
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const hospitalName = hospitalProfile?.hospitalName || currentUser?.name || 'Apollo Speciality Hospitals';
        const reqs = await emergencyRequestService.getRequests({ hospitalId: hospitalName });
        setRequests(reqs);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, [currentUser, hospitalProfile]);

  const filtered = requests.filter(req => {
    if (urgencyFilter !== 'ALL' && req.urgency !== urgencyFilter) return false;
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!req._id.toLowerCase().includes(q) && !req.patientBloodGroup.toLowerCase().includes(q) && !req.location.area.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <DashboardLayout
      title="Hospital Emergency Requests Registry"
      subtitle="Manage, track, and coordinate active blood transfusion dispatches"
      actions={
        <Link to="/hospital/create-request">
          <Button size="md" variant="danger" leftIcon={<PlusCircle className="w-4 h-4 stroke-[2.5]" />}>
            + Create Emergency Request
          </Button>
        </Link>
      }
    >
      <div className="space-y-4 mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by Request ID, Blood group, or area..."
        />

        <FilterPanel onReset={() => { setUrgencyFilter('ALL'); setStatusFilter('ALL'); setSearch(''); }}>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Urgency Level</label>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="ALL">All Urgencies</option>
              <option value="CRITICAL">Critical Emergency</option>
              <option value="HIGH">High Priority</option>
              <option value="NORMAL">Normal Priority</option>
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
        </FilterPanel>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Fetching hospital requests ledger..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Requests Match Filter"
          description="Adjust your search filters or create a new emergency request."
          actionLabel="+ Create Request"
          onAction={() => window.location.href = '/hospital/create-request'}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3.5">ID & Created</th>
                  <th className="px-6 py-3.5">Blood Group</th>
                  <th className="px-6 py-3.5">Required Volume</th>
                  <th className="px-6 py-3.5">Urgency</th>
                  <th className="px-6 py-3.5">Location Area</th>
                  <th className="px-6 py-3.5">Progress</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(req => {
                  return (
                    <tr key={req._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-slate-800">#{req._id}</span>
                        <div className="text-[11px] text-slate-400">
                          {new Date(req.createdAt).toLocaleDateString()} {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-base font-black text-rose-700">{req.patientBloodGroup}</span>
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-800">
                        {req.fulfilledUnits} of {req.requiredUnits} Units
                      </td>

                      <td className="px-6 py-4">
                        <UrgencyBadge urgency={req.urgency} />
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        <div className="font-medium text-slate-800">{req.location.area}</div>
                        <div className="text-[11px] text-slate-400">{req.location.city}</div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-slate-700">
                          {req.responsesCount?.accepted || 0} Accepted
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={req.status} />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/hospital/matched-donors?requestId=${req._id}&bloodGroup=${encodeURIComponent(req.patientBloodGroup)}&city=${encodeURIComponent(req.location.city)}`}>
                            <Button size="sm" variant="outline" leftIcon={<Search className="w-3.5 h-3.5 text-rose-700" />}>
                              Matches
                            </Button>
                          </Link>
                          <Link to={`/hospital/requests/${req._id}`}>
                            <Button size="sm" variant="ghost">
                              Manage
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
    </DashboardLayout>
  );
};
