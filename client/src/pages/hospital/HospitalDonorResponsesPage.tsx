import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState, LoadingSpinner } from '../../components/common/EmptyState';
import { emergencyRequestService } from '../../services/emergencyRequestService';
import { DonorResponse } from '../../types';
import { Phone, Users, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';

export const HospitalDonorResponsesPage: React.FC = () => {
  const { currentUser, hospitalProfile } = useAuth();
  const [responses, setResponses] = useState<DonorResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const hospitalName = hospitalProfile?.hospitalName || currentUser?.name || 'Apollo Speciality Hospitals';
        const resps = await emergencyRequestService.getAllHospitalResponses(hospitalName);
        setResponses(resps);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResponses();
  }, [currentUser, hospitalProfile]);

  const filtered = responses.filter(r => {
    if (search) {
      const q = search.toLowerCase();
      const matchDonor = r.donor.name.toLowerCase().includes(q);
      const matchBlood = (r.donorProfile?.bloodGroup || '').toLowerCase().includes(q);
      const matchReq = r.requestId.toLowerCase().includes(q);
      return matchDonor || matchBlood || matchReq;
    }
    return true;
  });

  return (
    <DashboardLayout
      title="Donor Emergency Response Ledger"
      subtitle="Track all registered donor decisions and arrival commitments across your hospital alerts"
    >
      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by donor name, blood group, or request ID..."
        />
      </div>

      {isLoading ? (
        <LoadingSpinner message="Querying hospital response ledger..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No Responses Found"
          description="When donors accept or decline your emergency broadcasts, their responses and arrival updates will be tracked here."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Donor Name</th>
                  <th className="px-6 py-3.5">Blood Group</th>
                  <th className="px-6 py-3.5">Linked Request</th>
                  <th className="px-6 py-3.5">Location Area</th>
                  <th className="px-6 py-3.5">Response Decision</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Donor Contact</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(resp => (
                  <tr key={resp._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{resp.donor.name}</div>
                      <div className="text-[11px] text-slate-400">{resp.donor.email}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-base font-black text-rose-700">
                        {resp.donorProfile?.bloodGroup || 'O+'}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-slate-800">
                      #{resp.requestId}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {resp.donorProfile?.address.area || 'Metro Area'}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold ${
                        resp.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {resp.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      <div>{new Date(resp.respondedAt).toLocaleDateString()}</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(resp.respondedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <a href={`tel:${resp.donor.phone}`} className="inline-flex items-center gap-1 font-bold text-rose-700 hover:underline">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{resp.donor.phone}</span>
                      </a>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link to={`/hospital/requests/${resp.requestId}`}>
                        <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                          Case
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
