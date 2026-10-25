import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { UrgencyBadge, StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConfirmationDialog } from '../../components/common/Modal';
import { RequestTimeline } from '../../components/common/Timeline';
import { LoadingSpinner } from '../../components/common/EmptyState';
import { emergencyRequestService } from '../../services/emergencyRequestService';
import { donorService } from '../../services/donorService';
import { EmergencyRequest, DonorResponse } from '../../types';
import { 
  Hospital, 
  MapPin, 
  Phone, 
  Clock, 
  Heart, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft,
  ShieldCheck,
  Send
} from 'lucide-react';

export const DonorRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, donorProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [request, setRequest] = useState<EmergencyRequest | null>(null);
  const [myResponse, setMyResponse] = useState<DonorResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals for confirmation
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [responseNotes, setResponseNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !currentUser) return;
      try {
        const req = await emergencyRequestService.getRequestById(id);
        setRequest(req);

        const resps = await donorService.getMyResponses(currentUser.id);
        const existing = resps.find(r => r.requestId === id);
        if (existing) {
          setMyResponse(existing);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, currentUser]);

  const handleConfirmResponse = async (status: 'ACCEPTED' | 'REJECTED') => {
    if (!request || !currentUser || !donorProfile) return;
    setIsSubmitting(true);

    try {
      const resp = await donorService.respondToRequest(
        request._id,
        {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone,
          bloodGroup: donorProfile.bloodGroup,
          area: donorProfile.address.area,
          city: donorProfile.address.city,
          pincode: donorProfile.address.pincode
        },
        status,
        responseNotes || (status === 'ACCEPTED' ? 'Donor accepted and is proceeding to facility.' : 'Donor unable to attend this emergency.')
      );

      setMyResponse(resp);
      setIsAcceptModalOpen(false);
      setIsRejectModalOpen(false);

      showToast({
        type: status === 'ACCEPTED' ? 'success' : 'info',
        title: status === 'ACCEPTED' ? 'Emergency Request Accepted' : 'Request Declined',
        message: status === 'ACCEPTED'
          ? 'Your acceptance and contact details have been sent directly to the hospital blood bank.'
          : 'You declined this emergency alert.'
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: err.message || 'Could not record response.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Emergency Request Detail">
        <LoadingSpinner message="Retrieving emergency trauma record..." />
      </DashboardLayout>
    );
  }

  if (!request) {
    return (
      <DashboardLayout title="Request Not Found">
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
          <h2 className="text-base font-bold text-slate-800">Emergency Alert Expired or Removed</h2>
          <p className="text-xs text-slate-500 mt-1">This request ID does not exist in the active registry.</p>
          <Link to="/donor/requests" className="mt-4 inline-block">
            <Button size="sm" variant="outline">Return to Requests List</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isCritical = request.urgency === 'CRITICAL';

  return (
    <DashboardLayout
      title={`Emergency Request #${request._id}`}
      subtitle={`Created on ${new Date(request.createdAt).toLocaleString()}`}
      actions={
        <Link to="/donor/requests">
          <Button size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Requests
          </Button>
        </Link>
      }
    >
      {/* Response Status Banner */}
      {myResponse && (
        <div
          className={`mb-6 p-4 rounded-xl border flex items-center justify-between ${
            myResponse.status === 'ACCEPTED'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-3">
            {myResponse.status === 'ACCEPTED' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Current Response Status: {myResponse.status}
              </h4>
              <p className="text-xs opacity-90 mt-0.5">
                Responded on {new Date(myResponse.respondedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Notes: {myResponse.responseNotes}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-white/80 border">
            {myResponse.status}
          </span>
        </div>
      )}

      {/* Progress Timeline Tracker */}
      <Card title="Emergency Response Progression" subtitle="Live tracking from creation to fulfillment" className="mb-6">
        <RequestTimeline
          currentStatus={request.status}
          createdAt={request.createdAt}
          responseCount={request.responsesCount?.total || 1}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Comprehensive Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Emergency Case Information" subtitle="Official hospital triage declaration">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
              <UrgencyBadge urgency={request.urgency} pulse={isCritical} />
              <StatusBadge status={request.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 uppercase font-semibold">Patient Blood Group Needed</span>
                <div className="text-2xl font-black text-rose-700 mt-1">{request.patientBloodGroup}</div>
                <p className="text-slate-500 mt-1">Whole Blood / Packed Red Blood Cells</p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 uppercase font-semibold">Emergency Volume</span>
                <div className="text-2xl font-black text-slate-800 mt-1">{request.requiredUnits} Units</div>
                <p className="text-slate-500 mt-1">Fulfilled: {request.fulfilledUnits} units so far</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Clinical Case Details</h4>
              <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed font-normal">
                {request.patientCaseDetails || 'Immediate emergency medical transfusion requested by hospital department.'}
              </p>
            </div>

            {/* Response CTA Action Box */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Your Emergency Action</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Confirm your readiness to travel to the facility for screening and donation.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full sm:w-auto text-rose-700 hover:bg-rose-50"
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={myResponse?.status === 'REJECTED'}
                  >
                    Reject Request
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full sm:w-auto font-bold shadow-md shadow-rose-900/10"
                    onClick={() => setIsAcceptModalOpen(true)}
                    disabled={myResponse?.status === 'ACCEPTED'}
                  >
                    Accept Request
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Col: Hospital Liaison & Direct Navigation Coordinates */}
        <div className="space-y-6">
          <Card title="Hospital & Blood Bank Details" subtitle="Emergency Reception Desk">
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Medical Facility</span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">{request.hospital.name}</h4>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Emergency Hotline</span>
                <p className="text-sm font-bold text-rose-700 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{request.hospitalProfile?.emergencyPhone || request.hospital.phone}</span>
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Blood Bank Liaison</span>
                <p className="text-slate-700 font-medium mt-0.5">
                  {request.hospitalProfile?.contactPerson || 'Emergency Triage Desk'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Facility Address</span>
                <p className="text-slate-700 mt-0.5 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>
                    {request.location.street && `${request.location.street}, `}
                    {request.location.area}, {request.location.city} - {request.location.pincode}
                  </span>
                </p>
              </div>
            </div>
          </Card>

          {/* Hospital screening reminder disclaimer */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>Hospital Verification Protocol</span>
            </div>
            <p>
              Accepting this request indicates your willingness to proceed to the hospital blood bank. Final donor verification and medical cross-matching is conducted upon your arrival.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal: ACCEPT */}
      <ConfirmationDialog
        isOpen={isAcceptModalOpen}
        onClose={() => setIsAcceptModalOpen(false)}
        onConfirm={() => handleConfirmResponse('ACCEPTED')}
        title="Confirm Emergency Acceptance"
        message={`Are you sure you want to accept this request for ${request.hospital.name}? Your phone number (${currentUser?.phone}) and ETA will be transmitted directly to the trauma coordinator.`}
        confirmLabel="Yes, I Will Donate"
        variant="success"
        isLoading={isSubmitting}
      />

      {/* Confirmation Modal: REJECT */}
      <ConfirmationDialog
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={() => handleConfirmResponse('REJECTED')}
        title="Decline Emergency Request"
        message="Are you sure you wish to decline? The platform will immediately query other registered donors in the local area."
        confirmLabel="Decline Request"
        variant="danger"
        isLoading={isSubmitting}
      />
    </DashboardLayout>
  );
};
