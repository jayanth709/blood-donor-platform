import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { EmptyState, LoadingSpinner } from '../../components/common/EmptyState';
import { emergencyRequestService } from '../../services/emergencyRequestService';
import { MatchedDonor, BloodGroup } from '../../types';
import { BLOOD_GROUPS } from '../../utils/bloodCompatibility';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft,
  Filter,
  Info,
  Calendar
} from 'lucide-react';

export const MatchedDonorsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRequestId = searchParams.get('requestId') || '';
  const initialBloodGroup = (searchParams.get('bloodGroup') as BloodGroup) || 'O+';
  const initialCity = searchParams.get('city') || 'Chennai';

  const [targetBloodGroup, setTargetBloodGroup] = useState<BloodGroup>(initialBloodGroup);
  const [targetCity, setTargetCity] = useState(initialCity);
  const [targetArea, setTargetArea] = useState('');
  const [donors, setDonors] = useState<MatchedDonor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMatches = async (bg: BloodGroup, city: string, area?: string) => {
    setIsLoading(true);
    try {
      const results = await emergencyRequestService.getMatchedDonors(bg, city, area);
      setDonors(results);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(targetBloodGroup, targetCity, targetArea);
  }, [targetBloodGroup, targetCity, targetArea]);

  return (
    <DashboardLayout
      title="Registered Suitable Donors Matching"
      subtitle="Deterministic matching based on clinical blood compatibility, voluntary availability, and municipal jurisdiction"
      actions={
        <div className="flex items-center gap-2">
          {initialRequestId && (
            <Link to={`/hospital/requests/${initialRequestId}`}>
              <Button size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Back to Request #{initialRequestId}
              </Button>
            </Link>
          )}
          <Link to="/hospital/active-requests">
            <Button size="sm" variant="ghost">
              All Requests
            </Button>
          </Link>
        </div>
      }
    >
      {/* Criteria Filter Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
          <Filter className="w-4 h-4 text-rose-700" />
          <span>Active Match Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Recipient Patient Blood Group
            </label>
            <select
              value={targetBloodGroup}
              onChange={(e) => setTargetBloodGroup(e.target.value as BloodGroup)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-800 focus:border-rose-600 focus:outline-none"
            >
              {BLOOD_GROUPS.map(bg => (
                <option key={bg} value={bg}>Patient Needs: {bg}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              City / Metro Jurisdiction
            </label>
            <input
              type="text"
              value={targetCity}
              onChange={(e) => setTargetCity(e.target.value)}
              placeholder="e.g. Chennai"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:border-rose-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Filter by Specific Area (Optional)
            </label>
            <input
              type="text"
              value={targetArea}
              onChange={(e) => setTargetArea(e.target.value)}
              placeholder="e.g. Anna Nagar, Adyar"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:border-rose-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Transparent Match Logic Explainer */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 mb-6 flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Transparent Matching Protocol:</strong> Matching is strictly rule-based: donors must be registered, possess clinically compatible red blood cells with recipient <strong>{targetBloodGroup}</strong>, satisfy eligibility criteria (age 18-65, weight &ge; 50 kg, no acute conditions), and be located within <strong>{targetCity}</strong>. No GPS tracking or approximate algorithms are used.
        </div>
      </div>

      {/* Donors List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Suitable Donors Found ({donors.length})
          </h3>
          <span className="text-xs text-slate-500">
            All donors below meet clinical compatibility rules
          </span>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Scanning registered donor registry..." />
        ) : donors.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title="No Suitable Donors Found"
            description={`No available registered donors currently match compatible blood groups for ${targetBloodGroup} in ${targetCity}. Consider expanding the search area or checking for universal O- donors.`}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {donors.map(donor => (
              <div
                key={donor.donorId}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Header row */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex flex-col items-center justify-center text-rose-800">
                      <span className="text-base font-black leading-none">{donor.bloodGroup}</span>
                      <span className="text-[9px] uppercase font-bold text-slate-400 mt-0.5">Blood</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{donor.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {donor.suitabilityLabel}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          donor.isAvailable ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {donor.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    donor.status === 'Accepted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : donor.status === 'Pending Response'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {donor.status}
                  </span>
                </div>

                {/* Match Reason */}
                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Matching Basis: </span>
                  {donor.matchReason}
                </div>

                {/* Donor Details Grid */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{donor.address.area}, {donor.address.city}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Weight: {donor.weight} kg (Age: {donor.age})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Last: {donor.lastDonationDate || 'Not recorded'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                    <span>Pin: {donor.address.pincode}</span>
                  </div>
                </div>

                {/* Contact Action Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-rose-700" />
                    <span>{donor.phone}</span>
                  </div>

                  <a href={`tel:${donor.phone}`}>
                    <Button size="sm" variant="outline">
                      Direct Call
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
