import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { UrgencyBadge, StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar, FilterPanel } from '../../components/common/SearchBar';
import { EmptyState, LoadingSpinner } from '../../components/common/EmptyState';
import { donorService } from '../../services/donorService';
import { EmergencyRequest, DonorResponse, UrgencyLevel } from '../../types';
import { Flame, MapPin, Clock, Hospital, ArrowRight, AlertCircle } from 'lucide-react';

export const DonorEmergencyRequestsPage: React.FC = () => {
  const { currentUser, donorProfile } = useAuth();
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [responses, setResponses] = useState<DonorResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (currentUser) {
          const reqs = await donorService.getEmergencyRequestsForDonor(donorProfile?.bloodGroup);
          const resps = await donorService.getMyResponses(currentUser.id);
          setRequests(reqs);
          setResponses(resps);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentUser, donorProfile]);

  const filteredRequests = requests.filter(req => {
    if (urgencyFilter !== 'ALL' && req.urgency !== urgencyFilter) return false;
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchHospital = req.hospital.name.toLowerCase().includes(q);
      const matchLocation = req.location.area.toLowerCase().includes(q) || req.location.city.toLowerCase().includes(q);
      const matchId = req._id.toLowerCase().includes(q);
      if (!matchHospital && !matchLocation && !matchId) return false;
    }
    return true;
  });

  return (
    <DashboardLayout
      title="Regional Emergency Blood Requests"
      subtitle="Live trauma and emergency hospital alerts filtered by blood group compatibility"
    >
      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by hospital name, area, or request ID..."
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
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Request Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open / Active</option>
              <option value="SEARCHING">Searching</option>
              <option value="RESPONSE_RECEIVED">Response Received</option>
            </select>
          </div>
        </FilterPanel>
      </div>

      {/* Requests Feed */}
      {isLoading ? (
        <LoadingSpinner message="Querying regional trauma emergency dispatch..." />
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          title="No Emergency Requests Found"
          description="There are currently no active emergency requests matching your search or filters."
        />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(req => {
            const myResp = responses.find(r => r.requestId === req._id);
            const isCritical = req.urgency === 'CRITICAL';

            return (
              <div
                key={req._id}
                className={`bg-white rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
                  isCritical ? 'border-l-4 border-l-red-600' : 'border-slate-200'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <UrgencyBadge urgency={req.urgency} pulse={isCritical} />
                    <span className="text-xs font-bold text-slate-500">#{req._id}</span>
                    <span className="text-xs text-slate-400">
                      Logged {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div>
                    {myResp ? (
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        myResp.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        My Response: {myResp.status}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                        Pending Your Response
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Hospital Center</span>
                    <h3 className="text-sm font-bold text-slate-800 truncate mt-0.5">{req.hospital.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{req.location.area}, {req.location.city} ({req.location.pincode})</span>
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Required Blood</span>
                    <div className="text-lg font-black text-rose-700 mt-0.5">
                      {req.patientBloodGroup} <span className="text-xs font-semibold text-slate-500">({req.requiredUnits} Units)</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Fulfilled: {req.fulfilledUnits} of {req.requiredUnits}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Request Status</span>
                    <div className="mt-1">
                      <StatusBadge status={req.status} />
                    </div>
                  </div>

                  <div className="flex md:justify-end">
                    <Link to={`/donor/requests/${req._id}`} className="w-full md:w-auto">
                      <Button
                        size="md"
                        variant={isCritical ? 'danger' : 'primary'}
                        className="w-full"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        {myResp ? 'View Details' : 'Respond to Emergency'}
                      </Button>
                    </Link>
                  </div>
                </div>

                {req.patientCaseDetails && (
                  <div className="mt-3.5 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-700">Clinical Case Notes: </span>
                    {req.patientCaseDetails}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};
