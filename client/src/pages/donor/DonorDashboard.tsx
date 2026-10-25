import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, StatCard } from '../../components/common/Card';
import { AvailabilityToggle } from '../../components/common/AvailabilityToggle';
import { UrgencyBadge, StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState, LoadingSpinner } from '../../components/common/EmptyState';
import { donorService } from '../../services/donorService';
import { EmergencyRequest, DonorResponse } from '../../types';
import { 
  Heart, 
  Flame, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Activity,
  History,
  Info
} from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const { currentUser, donorProfile, toggleAvailability } = useAuth();
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [responses, setResponses] = useState<DonorResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const activeEmergencies = requests.filter(r => r.status !== 'FULFILLED' && r.status !== 'CANCELLED');
  const criticalCount = activeEmergencies.filter(r => r.urgency === 'CRITICAL').length;
  const acceptedResponses = responses.filter(r => r.status === 'ACCEPTED');

  return (
    <DashboardLayout
      title={`Welcome back, ${currentUser?.name || 'Donor'}`}
      subtitle="Donor Emergency Response Command Center"
      actions={
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Live Status:</span>
          {donorProfile && (
            <AvailabilityToggle
              isAvailable={donorProfile.isAvailable}
              onToggle={toggleAvailability}
            />
          )}
        </div>
      }
    >
      {/* Important Alert Notice if Unavailable */}
      {donorProfile && !donorProfile.isAvailable && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Availability is currently paused:</strong> You are marked as unavailable. Toggle availability ON when you are ready to receive local hospital alerts.
            </span>
          </div>
          <Button size="sm" variant="outline" onClick={toggleAvailability}>
            Set Available Now
          </Button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Blood Group Card */}
        <div className="bg-gradient-to-br from-rose-900 to-rose-700 text-white rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-200">My Blood Group</span>
            <Heart className="w-5 h-5 text-rose-200 fill-current" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black">{donorProfile?.bloodGroup || 'O+'}</span>
            <span className="text-xs text-rose-200 font-medium">Whole Blood</span>
          </div>
          <p className="text-[11px] text-rose-100 mt-2">
            Total lifetime donations: <strong>{donorProfile?.totalDonations || 0} units</strong>
          </p>
        </div>

        {/* Availability Card */}
        <StatCard
          title="Availability Status"
          value={donorProfile?.isAvailable ? 'ACTIVE' : 'PAUSED'}
          subtitle={donorProfile?.isAvailable ? 'Ready for hospital calls' : 'Not accepting alerts'}
          icon={<Activity className="w-5 h-5" />}
        />

        {/* Critical Emergencies */}
        <StatCard
          title="Active Emergencies"
          value={activeEmergencies.length}
          subtitle={`${criticalCount} critical trauma alert(s)`}
          icon={<Flame className="w-5 h-5" />}
          urgency={criticalCount > 0}
        />

        {/* My Accepted Responses */}
        <StatCard
          title="My Responses"
          value={responses.length}
          subtitle={`${acceptedResponses.length} active commitment(s)`}
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
      </div>

      {/* Main Grid: Live Emergency Alerts & Donation History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Emergency Requests */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-600 fill-rose-600" />
                Compatible Emergency Requests
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Hospital emergency cases matching your blood compatibility & locality
              </p>
            </div>
            <Link to="/donor/requests">
              <Button size="sm" variant="ghost" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View All
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner message="Scanning regional emergency alerts..." />
          ) : activeEmergencies.length === 0 ? (
            <EmptyState
              title="No Active Emergencies in Your Area"
              description="There are currently no urgent requests matching your blood group in your municipal zone. Keep your availability active to receive future hospital alerts."
            />
          ) : (
            <div className="space-y-3.5">
              {activeEmergencies.slice(0, 3).map((req) => {
                const myResp = responses.find(r => r.requestId === req._id);
                return (
                  <div
                    key={req._id}
                    className={`p-5 rounded-xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md ${
                      req.urgency === 'CRITICAL' ? 'border-l-4 border-l-red-600' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <UrgencyBadge urgency={req.urgency} pulse={req.urgency === 'CRITICAL'} />
                        <span className="text-xs font-bold text-slate-500">#{req._id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {myResp ? (
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            myResp.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            My Response: {myResp.status}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Awaiting Response
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase">Hospital</div>
                        <div className="text-sm font-bold text-slate-800 truncate">{req.hospital.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{req.location.area}, {req.location.city}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase">Required Units</div>
                        <div className="text-sm font-black text-rose-700">
                          {req.requiredUnits} Units ({req.patientBloodGroup})
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Fulfilled: {req.fulfilledUnits} / {req.requiredUnits}
                        </div>
                      </div>

                      <div className="flex sm:justify-end items-center">
                        <Link to={`/donor/requests/${req._id}`} className="w-full sm:w-auto">
                          <Button size="sm" variant={req.urgency === 'CRITICAL' ? 'danger' : 'primary'} className="w-full">
                            View & Respond
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {req.patientCaseDetails && (
                      <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2">
                        <strong>Clinical Case:</strong> {req.patientCaseDetails}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Quick Profile Summary & Recent Responses */}
        <div className="space-y-6">
          {/* Quick Profile Card */}
          <Card title="Donor Profile Overview" subtitle="Verified platform record">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Contact:</span>
                <span className="font-semibold text-slate-800">{currentUser?.phone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Local Area:</span>
                <span className="font-semibold text-slate-800">
                  {donorProfile?.address.area}, {donorProfile?.address.city}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Last Donation:</span>
                <span className="font-semibold text-slate-800">
                  {donorProfile?.lastDonationDate || 'Not recorded'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Weight & Health:</span>
                <span className="font-semibold text-slate-800">{donorProfile?.weight} kg (Eligible)</span>
              </div>
            </div>

            <Link to="/donor/profile" className="block mt-4">
              <Button size="sm" variant="outline" className="w-full">
                Edit Profile Details
              </Button>
            </Link>
          </Card>

          {/* Clinical Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Info className="w-3.5 h-3.5 text-slate-600" />
              <span>Hospital Screening Notice</span>
            </div>
            <p>
              Eligibility listed on your dashboard is based on self-reported registration criteria. The receiving hospital's licensed medical team performs mandatory pre-transfusion blood typing, hemoglobin test, and final health check before donation.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
