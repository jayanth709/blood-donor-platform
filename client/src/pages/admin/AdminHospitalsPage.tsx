import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/common/Button';
import { SearchBar, FilterPanel } from '../../components/common/SearchBar';
import { Modal } from '../../components/common/Modal';
import { EmptyState, LoadingSpinner } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { adminService } from '../../services/adminService';
import { HospitalProfile } from '../../types';
import { Building2, Search, ShieldCheck, ShieldAlert, Phone, Mail, MapPin, Eye } from 'lucide-react';

export const AdminHospitalsPage: React.FC = () => {
  const { showToast } = useToast();
  const [hospitals, setHospitals] = useState<HospitalProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [selectedHospital, setSelectedHospital] = useState<HospitalProfile | null>(null);

  const fetchHospitals = async () => {
    try {
      const data = await adminService.getAllHospitals({
        search,
        verification: verificationFilter
      });
      setHospitals(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [search, verificationFilter]);

  const handleToggleVerification = async (h: HospitalProfile) => {
    try {
      const updated = await adminService.toggleHospitalVerification(h._id);
      setHospitals(prev => prev.map(item => item._id === updated._id ? updated : item));
      showToast({
        type: updated.verificationStatus === 'verified' ? 'success' : 'warning',
        title: updated.verificationStatus === 'verified' ? 'Facility Verified' : 'Facility Set to Pending',
        message: `${h.hospitalName} verification status updated.`
      });
    } catch (e: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: e.message || 'Could not update verification status.'
      });
    }
  };

  return (
    <DashboardLayout
      title="Medical Facilities & Hospital Accreditation"
      subtitle="Accredit and govern authorized hospitals permitted to broadcast emergency blood calls"
    >
      <div className="space-y-4 mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by hospital name, license number, or city..."
        />

        <FilterPanel onReset={() => { setSearch(''); setVerificationFilter('ALL'); }}>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Verification Status</label>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="ALL">All Facilities</option>
              <option value="verified">Verified & Active</option>
              <option value="pending">Pending Accreditation</option>
            </select>
          </div>
        </FilterPanel>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Querying hospital accreditation registry..." />
      ) : hospitals.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-6 h-6" />}
          title="No Hospitals Found"
          description="No medical centers matched your filter parameters."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Hospital Name</th>
                  <th className="px-5 py-3.5">City & Area</th>
                  <th className="px-5 py-3.5">Emergency Hotline</th>
                  <th className="px-5 py-3.5">Accreditation License</th>
                  <th className="px-5 py-3.5">Verification</th>
                  <th className="px-5 py-3.5">Onboarded</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hospitals.map(h => {
                  const isVerified = h.verificationStatus === 'verified';
                  return (
                    <tr key={h._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{h.hospitalName}</div>
                        <div className="text-[11px] text-slate-400">{h.contactPerson}</div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        <div className="font-semibold text-slate-800">{h.address.area}</div>
                        <div className="text-[11px] text-slate-400">{h.city} ({h.pincode})</div>
                      </td>

                      <td className="px-5 py-4 font-bold text-rose-700">
                        {h.emergencyPhone}
                      </td>

                      <td className="px-5 py-4 font-mono text-[11px] text-slate-600">
                        {h.licenseNumber}
                      </td>

                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isVerified ? 'Verified' : 'Pending Review'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {h.createdAt ? new Date(h.createdAt).toLocaleDateString() : 'Active'}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedHospital(h)}
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Details
                          </Button>
                          <Button
                            size="sm"
                            variant={isVerified ? 'outline' : 'success'}
                            onClick={() => handleToggleVerification(h)}
                          >
                            {isVerified ? 'Revoke' : 'Accredit'}
                          </Button>
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

      {/* Hospital Detailed Inspection Modal */}
      {selectedHospital && (
        <Modal
          isOpen={Boolean(selectedHospital)}
          onClose={() => setSelectedHospital(null)}
          title={`Facility File: ${selectedHospital.hospitalName}`}
          subtitle={`License ID: ${selectedHospital.licenseNumber}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Triage Contact Person:</span>
                <span className="font-bold text-slate-900">{selectedHospital.contactPerson}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Emergency Hotline:</span>
                <span className="font-bold text-rose-700">{selectedHospital.emergencyPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Accreditation Status:</span>
                <span className="font-bold text-emerald-700 uppercase">{selectedHospital.verificationStatus}</span>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Reception Coordinates</h4>
              <p className="text-slate-600">
                {selectedHospital.address.street && `${selectedHospital.address.street}, `}
                {selectedHospital.address.area}, {selectedHospital.city} - {selectedHospital.pincode}
              </p>
            </div>

            <div className="pt-4 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedHospital(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};
