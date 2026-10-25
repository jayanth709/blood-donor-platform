import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatusBadge, UrgencyBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState, LoadingSpinner } from '../../components/common/EmptyState';
import { emergencyRequestService } from '../../services/emergencyRequestService';
import { EmergencyRequest } from '../../types';
import { History, ArrowRight } from 'lucide-react';

export const HospitalHistoryPage: React.FC = () => {
  const { currentUser, hospitalProfile } = useAuth();
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const hospitalName = hospitalProfile?.hospitalName || currentUser?.name || 'Apollo Speciality Hospitals';
        const reqs = await emergencyRequestService.getRequests({ hospitalId: hospitalName });
        // Filter to fulfilled or cancelled
        setRequests(reqs.filter(r => r.status === 'FULFILLED' || r.status === 'CANCELLED'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [currentUser, hospitalProfile]);

  return (
    <DashboardLayout
      title="Completed Request Archives"
      subtitle="Historical record of fulfilled and resolved emergency blood dispatches"
    >
      {isLoading ? (
        <LoadingSpinner message="Loading historical hospital records..." />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<History className="w-6 h-6" />}
          title="No Archived Requests Yet"
          description="Completed and closed emergency dispatches will be archived here for retrospective medical auditing."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">ID</th>
                <th className="px-6 py-3.5">Blood Group</th>
                <th className="px-6 py-3.5">Units Fulfilled</th>
                <th className="px-6 py-3.5">Urgency</th>
                <th className="px-6 py-3.5">Area</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Final Status</th>
                <th className="px-6 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map(req => (
                <tr key={req._id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-mono font-bold text-slate-800">
                    #{req._id}
                  </td>
                  <td className="px-6 py-4 font-black text-rose-700 text-sm">
                    {req.patientBloodGroup}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {req.fulfilledUnits} / {req.requiredUnits} Units
                  </td>
                  <td className="px-6 py-4">
                    <UrgencyBadge urgency={req.urgency} />
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {req.location.area}, {req.location.city}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/hospital/requests/${req._id}`}>
                      <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Review
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};
