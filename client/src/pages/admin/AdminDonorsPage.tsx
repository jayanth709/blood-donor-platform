import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { SearchBar, FilterPanel } from '../../components/common/SearchBar';
import { Modal } from '../../components/common/Modal';
import { EmptyState, LoadingSpinner } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { adminService } from '../../services/adminService';
import { DonorProfile, BloodGroup } from '../../types';
import { BLOOD_GROUPS } from '../../utils/bloodCompatibility';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Eye, 
  Power 
} from 'lucide-react';

export const AdminDonorsPage: React.FC = () => {
  const { showToast } = useToast();
  const [donors, setDonors] = useState<DonorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected donor for view modal
  const [selectedDonor, setSelectedDonor] = useState<DonorProfile | null>(null);

  const fetchDonors = async () => {
    try {
      const data = await adminService.getAllDonors({
        search,
        bloodGroup: bloodGroupFilter,
        status: statusFilter
      });
      setDonors(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [search, bloodGroupFilter, statusFilter]);

  const handleToggleStatus = async (donor: DonorProfile) => {
    try {
      const updated = await adminService.toggleDonorAccountStatus(donor._id);
      setDonors(prev => prev.map(d => d._id === updated._id ? updated : d));
      showToast({
        type: updated.user.isActive ? 'success' : 'warning',
        title: updated.user.isActive ? 'Account Activated' : 'Account Suspended',
        message: `${donor.user.name}'s account status has been updated.`
      });
    } catch (e: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: e.message || 'Could not update donor status.'
      });
    }
  };

  return (
    <DashboardLayout
      title="Registered Donors Directory & Governance"
      subtitle="Verify, manage, and monitor all voluntary blood donors in the platform registry"
    >
      <div className="space-y-4 mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by donor name, email, city, or area..."
        />

        <FilterPanel onReset={() => { setSearch(''); setBloodGroupFilter('ALL'); setStatusFilter('ALL'); }}>
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
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Availability & Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="available">Available to Donate</option>
              <option value="unavailable">Paused / Unavailable</option>
              <option value="active">Active Accounts</option>
              <option value="suspended">Suspended Accounts</option>
            </select>
          </div>
        </FilterPanel>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Querying platform donor registry..." />
      ) : donors.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No Registered Donors Found"
          description="No donor records matched your filter criteria."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Donor Name & Contact</th>
                  <th className="px-5 py-3.5">Blood Group</th>
                  <th className="px-5 py-3.5">Location Area</th>
                  <th className="px-5 py-3.5">Availability</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5">Registered</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donors.map(donor => {
                  const isActive = donor.user.isActive !== false;
                  return (
                    <tr key={donor._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{donor.user.name}</div>
                        <div className="text-[11px] text-slate-400">{donor.user.email} • {donor.user.phone}</div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-base font-black text-rose-700">{donor.bloodGroup}</span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        <div className="font-medium text-slate-800">{donor.address.area}</div>
                        <div className="text-[11px] text-slate-400">{donor.city} ({donor.pincode})</div>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-xs ${
                          donor.isAvailable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${donor.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {donor.isAvailable ? 'Available' : 'Paused'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {donor.createdAt ? new Date(donor.createdAt).toLocaleDateString() : 'Active'}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedDonor(donor)}
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Details
                          </Button>
                          <Button
                            size="sm"
                            variant={isActive ? 'outline' : 'success'}
                            onClick={() => handleToggleStatus(donor)}
                          >
                            {isActive ? 'Suspend' : 'Activate'}
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

      {/* Donor Detailed Inspection Modal */}
      {selectedDonor && (
        <Modal
          isOpen={Boolean(selectedDonor)}
          onClose={() => setSelectedDonor(null)}
          title={`Donor Inspection: ${selectedDonor.user.name}`}
          subtitle={`Platform ID: ${selectedDonor._id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold">Blood Group</span>
                <div className="text-xl font-black text-rose-700 mt-0.5">{selectedDonor.bloodGroup}</div>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold">Total Platform Donations</span>
                <div className="text-xl font-black text-slate-800 mt-0.5">{selectedDonor.totalDonations} Units</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Contact & Coordinates</h4>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>Email: <strong className="text-slate-900">{selectedDonor.user.email}</strong></div>
                <div>Phone: <strong className="text-slate-900">{selectedDonor.user.phone}</strong></div>
                <div>Address: {selectedDonor.address.street || 'Registered Residence'}, {selectedDonor.address.area}</div>
                <div>City & Pincode: {selectedDonor.city} - {selectedDonor.pincode}</div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Clinical Screening Metadata</h4>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>Recorded Weight: {selectedDonor.weight} kg</div>
                <div>Date of Birth: {selectedDonor.dateOfBirth} (Age: {selectedDonor.age || 26})</div>
                <div>Last Whole Blood Donation: {selectedDonor.lastDonationDate || 'None on record'}</div>
                <div>Chronic Conditions: {selectedDonor.hasChronicIllness ? 'Disclosed' : 'None disclosed'}</div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedDonor(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};
