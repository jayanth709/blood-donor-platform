import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { UrgencyBadge, StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { RequestTimeline } from '../../components/common/Timeline';
import { LoadingSpinner, EmptyState } from '../../components/common/EmptyState';
import { ConfirmationDialog } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { emergencyRequestService } from '../../services/emergencyRequestService';
import { EmergencyRequest, DonorResponse, RequestStatus } from '../../types';
import { 
  ArrowLeft, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Phone, 
  Users, 
  Calendar,
  Clock
} from 'lucide-react';

export const HospitalRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [request, setRequest] = useState<EmergencyRequest | null>(null);
  const [responses, setResponses] = useState<DonorResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Status update modals
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    targetStatus: RequestStatus;
    title: string;
    message: string;
  }>({
    isOpen: false,
    targetStatus: 'FULFILLED',
    title: '',
    message: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        const req = await emergencyRequestService.getRequestById(id);
        const resps = await emergencyRequestService.getResponsesForRequest(id);
        setRequest(req);
        setResponses(resps);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!request) return;
    setIsUpdating(true);
    try {
      const updated = await emergencyRequestService.updateStatus(request._id, actionModal.targetStatus);
      setRequest(updated);
      setActionModal(prev => ({ ...prev, isOpen: false }));
      showToast({
        type: actionModal.targetStatus === 'FULFILLED' ? 'success' : 'warning',
        title: 'Status Updated',
        message: `Emergency request status updated to ${actionModal.targetStatus}`
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Emergency Request Tracking">
        <LoadingSpinner message="Loading emergency dispatch data..." />
      </DashboardLayout>
    );
  }

  if (!request) {
    return (
      <DashboardLayout title="Request Not Found">
        <EmptyState
          title="Emergency Alert Not Found"
          description="The requested emergency alert could not be retrieved from the active ledger."
          actionLabel="Back to Active Requests"
          onAction={() => window.location.href = '/hospital/active-requests'}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`Emergency Request Tracking #${request._id}`}
      subtitle={`Created on ${new Date(request.createdAt).toLocaleString()}`}
      actions={
        <div className="flex items-center gap-2">
          <Link to="/hospital/active-requests">
            <Button size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back to Requests
            </Button>
          </Link>
          <Link to={`/hospital/matched-donors?requestId=${request._id}&bloodGroup=${encodeURIComponent(request.patientBloodGroup)}&city=${encodeURIComponent(request.location.city)}`}>
            <Button size="sm" variant="primary" leftIcon={<Search className="w-3.5 h-3.5" />}>
              View Matched Donors
            </Button>
          </Link>
        </div>
      }
    >
      {/* Visual Request Progression Timeline */}
      <Card title="Emergency Response Progression" subtitle="Live dispatch trajectory" className="mb-6">
        <RequestTimeline
          currentStatus={request.status}
          createdAt={request.createdAt}
          responseCount={responses.length}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left 2 Cols: Transfusion Request Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Clinical Emergency Specifications">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
              <UrgencyBadge urgency={request.urgency} pulse={request.urgency === 'CRITICAL'} />
              <StatusBadge status={request.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Blood Group</span>
                <div className="text-2xl font-black text-rose-700 mt-1">{request.patientBloodGroup}</div>
                <p className="text-slate-500 mt-0.5">Compatible whole blood</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Volume Needed</span>
                <div className="text-2xl font-black text-slate-800 mt-1">{request.requiredUnits} Units</div>
                <p className="text-slate-500 mt-0.5">Fulfilled: {request.fulfilledUnits} units</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Reception Point</span>
                <div className="text-sm font-bold text-slate-800 mt-1">{request.location.area}</div>
                <p className="text-slate-500 mt-0.5">{request.location.city}</p>
              </div>
            </div>

            {request.patientCaseDetails && (
              <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block mb-1">Clinical Case Context:</span>
                {request.patientCaseDetails}
              </div>
            )}

            {/* Hospital Operational Actions: Mark Completed or Cancel */}
            {request.status !== 'FULFILLED' && request.status !== 'CANCELLED' && (
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Close or Complete Emergency</h4>
                  <p className="text-[11px] text-slate-500">Update request status once required units are collected</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-rose-700 hover:bg-rose-50"
                    onClick={() => setActionModal({
                      isOpen: true,
                      targetStatus: 'CANCELLED',
                      title: 'Cancel Emergency Request',
                      message: 'Are you sure you wish to cancel this request? Donors will no longer see it as active.'
                    })}
                  >
                    Cancel Alert
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => setActionModal({
                      isOpen: true,
                      targetStatus: 'FULFILLED',
                      title: 'Mark Emergency Completed / Fulfilled',
                      message: 'Confirm that all required units have been secured and transfused for this patient.'
                    })}
                  >
                    Mark as Fulfilled
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Live Donor Responses Table */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-700" />
              <span>Donor Responses for this Case ({responses.length})</span>
            </h3>

            {responses.length === 0 ? (
              <EmptyState
                icon={<Clock className="w-6 h-6" />}
                title="Awaiting Donor Responses"
                description="Regional donors have received the broadcast. Responses will appear here immediately as donors confirm or decline."
                actionLabel="View Matched Donors"
                onAction={() => window.location.href = `/hospital/matched-donors?requestId=${request._id}&bloodGroup=${encodeURIComponent(request.patientBloodGroup)}&city=${encodeURIComponent(request.location.city)}`}
              />
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3">Donor Name</th>
                      <th className="px-5 py-3">Blood Group</th>
                      <th className="px-5 py-3">Location Area</th>
                      <th className="px-5 py-3">Response</th>
                      <th className="px-5 py-3">Responded Time</th>
                      <th className="px-5 py-3">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {responses.map((resp) => (
                      <tr key={resp._id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3.5 font-bold text-slate-800">
                          {resp.donor.name}
                        </td>
                        <td className="px-5 py-3.5 font-black text-rose-700">
                          {resp.donorProfile?.bloodGroup || 'O+'}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {resp.donorProfile?.address.area || request.location.area}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            resp.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {resp.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400">
                          {new Date(resp.respondedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-5 py-3.5">
                          <a href={`tel:${resp.donor.phone}`} className="inline-flex items-center gap-1 font-bold text-rose-700 hover:underline">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{resp.donor.phone}</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Facility Coordinates */}
        <div className="space-y-6">
          <Card title="Emergency Response Desk" subtitle="Liaison reception point">
            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Facility</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{request.hospital.name}</p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Direct Blood Hotline</span>
                <p className="text-sm font-bold text-rose-700 mt-0.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{request.hospitalProfile?.emergencyPhone || request.hospital.phone}</span>
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Physical Address</span>
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
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationDialog
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleUpdateStatus}
        title={actionModal.title}
        message={actionModal.message}
        variant={actionModal.targetStatus === 'FULFILLED' ? 'success' : 'danger'}
        isLoading={isUpdating}
      />
    </DashboardLayout>
  );
};
