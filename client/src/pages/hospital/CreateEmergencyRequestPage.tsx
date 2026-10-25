import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { FormField, Input, Select } from '../../components/common/FormField';
import { Button } from '../../components/common/Button';
import { ConfirmationDialog } from '../../components/common/Modal';
import { BLOOD_GROUPS } from '../../utils/bloodCompatibility';
import { BloodGroup, UrgencyLevel, EmergencyRequest } from '../../types';
import { emergencyRequestService } from '../../services/emergencyRequestService';
import { 
  Flame, 
  AlertTriangle, 
  MapPin, 
  CheckCircle2, 
  ArrowLeft, 
  Search, 
  Clock, 
  ShieldAlert,
  Loader2 
} from 'lucide-react';

export const CreateEmergencyRequestPage: React.FC = () => {
  const { currentUser, hospitalProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Real backend returns flat fields: street, area, city, pincode (NOT nested address object)
  const [formData, setFormData] = useState({
    patientBloodGroup: 'O+' as BloodGroup,
    requiredUnits: 2,
    urgency: 'CRITICAL' as UrgencyLevel,
    patientCaseDetails: '',
    street: (hospitalProfile as any)?.street || '',
    area: (hospitalProfile as any)?.area || '',
    city: (hospitalProfile as any)?.city || 'Chennai',
    pincode: (hospitalProfile as any)?.pincode || ''
  });

  // When hospitalProfile loads from the API, auto-fill the location fields
  useEffect(() => {
    if (hospitalProfile) {
      const p = hospitalProfile as any;
      setFormData(prev => ({
        ...prev,
        street:  p.street  || prev.street,
        area:    p.area    || prev.area,
        city:    p.city    || prev.city,
        pincode: p.pincode || prev.pincode,
      }));
    }
  }, [hospitalProfile]);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<EmergencyRequest | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientBloodGroup || !formData.requiredUnits || !formData.area || !formData.city) {
      showToast({
        type: 'error',
        title: 'Missing Required Fields',
        message: 'Please complete all required fields before broadcasting.'
      });
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleConfirmBroadcast = async () => {
    setIsSubmitting(true);
    try {
      // Use real hospitalService — sends to Express backend → saved in SQLite
      const { hospitalService } = await import('../../services/hospitalService');
      const result = await hospitalService.createEmergencyRequest({
        patient_blood_group: formData.patientBloodGroup,
        required_units: Number(formData.requiredUnits),
        urgency: formData.urgency,
        patient_case_details: formData.patientCaseDetails || undefined,
        street: formData.street || undefined,
        area: formData.area,
        city: formData.city,
        pincode: formData.pincode
      });

      // Backend returns { success, data: newRequest, matchingDonors, matchedDonorList }
      const newReq = result.data;
      setCreatedRequest(newReq);
      setIsConfirmModalOpen(false);

      showToast({
        type: 'success',
        title: '🩸 Emergency Request Broadcasted',
        message: `${result.matchingDonors} compatible donor(s) found in ${formData.city}. Request saved to database.`
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Broadcast Failed',
        message: err.message || 'Could not broadcast emergency. Is the backend running?'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // After successful creation — show confirmation screen
  // Real backend shape: { id, patient_blood_group, required_units, urgency, area, city, status }
  if (createdRequest) {
    const req = createdRequest as any;
    return (
      <DashboardLayout title="Emergency Dispatch Broadcast Initiated">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            REQUEST SAVED TO DATABASE & BROADCASTED
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Searching For Suitable Registered Donors...
          </h2>

          <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Emergency alert for{' '}
            <strong className="text-rose-700">
              {req.required_units} Units of {req.patient_blood_group}
            </strong>{' '}
            is now live in the database. Compatible and available donors in{' '}
            <strong>{req.area}, {req.city}</strong> are being matched.
          </p>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-left max-w-md mx-auto space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Request ID:</span>
              <span className="font-mono text-slate-700 text-[10px]">{req.id?.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Urgency Level:</span>
              <span className="font-bold text-rose-700">{req.urgency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Reception Point:</span>
              <span className="font-semibold text-slate-800">{req.area}, {req.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-bold text-sky-700">{req.status}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/hospital/active-requests" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full font-bold shadow-md shadow-rose-900/10" leftIcon={<Search className="w-4 h-4" />}>
                View Active Requests
              </Button>
            </Link>
            <Link to="/hospital/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Create Emergency Blood Request"
      subtitle="Broadcast an immediate clinical need to nearby eligible donors"
      actions={
        <Link to="/hospital/dashboard">
          <Button size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Dashboard
          </Button>
        </Link>
      }
    >
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleInitialSubmit} className="space-y-6">
          {/* Section 1: Transfusion Requirements */}
          <Card title="1. Clinical Transfusion Requirements" subtitle="Specify required blood parameters and urgency">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Patient Blood Group" htmlFor="patientBloodGroup" required>
                <Select
                  id="patientBloodGroup"
                  name="patientBloodGroup"
                  value={formData.patientBloodGroup}
                  onChange={handleChange}
                  required
                >
                  {BLOOD_GROUPS.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Units Required" htmlFor="requiredUnits" required hint="Whole blood or PRBC units">
                <Input
                  id="requiredUnits"
                  name="requiredUnits"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.requiredUnits}
                  onChange={handleChange}
                  required
                >
                </Input>
              </FormField>

              <FormField label="Clinical Urgency" htmlFor="urgency" required>
                <Select
                  id="urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  required
                >
                  <option value="CRITICAL">CRITICAL (Immediate Trauma / OT)</option>
                  <option value="HIGH">HIGH (Within 4-6 Hours)</option>
                  <option value="NORMAL">NORMAL (Scheduled Surgery)</option>
                </Select>
              </FormField>
            </div>

            {/* Urgency Highlight Notification */}
            <div className={`mt-4 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              formData.urgency === 'CRITICAL'
                ? 'bg-red-50 border-red-200 text-red-950'
                : formData.urgency === 'HIGH'
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <Flame className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                formData.urgency === 'CRITICAL' ? 'text-red-600' : 'text-slate-400'
              }`} />
              <div>
                <strong>{formData.urgency} Urgency Protocol: </strong>
                {formData.urgency === 'CRITICAL'
                  ? 'All available donors within the municipality will receive high-priority alerts with an emergency response prompt.'
                  : formData.urgency === 'HIGH'
                  ? 'Donors within the primary local zone will be notified with 4-hour response ETA requests.'
                  : 'Standard scheduled reserve matching will be initiated for suitable donors.'}
              </div>
            </div>

            <div className="mt-4">
              <FormField label="Clinical Case Details & Notes" htmlFor="patientCaseDetails" hint="e.g. Trauma ICU, postpartum hemorrhage, scheduled open heart surgery">
                <textarea
                  id="patientCaseDetails"
                  name="patientCaseDetails"
                  rows={3}
                  value={formData.patientCaseDetails}
                  onChange={handleChange}
                  placeholder="Provide brief non-sensitive clinical context (e.g. Polytrauma road accident victim admitted to Trauma OT)..."
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-rose-600 focus:ring-1 focus:ring-rose-600 focus:outline-none"
                />
              </FormField>
            </div>
          </Card>

          {/* Section 2: Reception Location Point */}
          <Card title="2. Emergency Reception Point" subtitle="Where the donor should report upon acceptance">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <FormField label="Hospital Department / Street Address" htmlFor="street">
                  <Input
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="e.g. Emergency Blood Bank, 1st Floor, Main Block"
                  />
                </FormField>
              </div>

              <FormField label="Area / Zone" htmlFor="area" required>
                <Input
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="Thousand Lights"
                  required
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="City" htmlFor="city" required>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Chennai"
                    required
                  />
                </FormField>

                <FormField label="Pincode" htmlFor="pincode" required>
                  <Input
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="600006"
                    required
                  />
                </FormField>
              </div>
            </div>
          </Card>

          {/* Submit Actions */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Broadcasting will immediately alert registered compatible donors in this jurisdiction.
            </p>

            <Button
              type="submit"
              variant={formData.urgency === 'CRITICAL' ? 'danger' : 'primary'}
              size="lg"
              className="font-bold shadow-md shadow-rose-900/10"
              leftIcon={<Flame className="w-4 h-4 fill-current" />}
            >
              Broadcast Emergency Request
            </Button>
          </div>
        </form>
      </div>

      {/* Confirmation Dialog before broadcast */}
      <ConfirmationDialog
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmBroadcast}
        title="Confirm Emergency Broadcast"
        message={`Confirm emergency dispatch for ${formData.requiredUnits} Units of ${formData.patientBloodGroup} (${formData.urgency} urgency) at ${formData.area}, ${formData.city}?`}
        confirmLabel="Confirm & Broadcast Alert"
        variant="danger"
        isLoading={isSubmitting}
      />
    </DashboardLayout>
  );
};
