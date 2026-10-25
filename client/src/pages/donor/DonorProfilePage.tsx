import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { FormField, Input, Select } from '../../components/common/FormField';
import { Button } from '../../components/common/Button';
import { BLOOD_GROUPS, checkDonorEligibility } from '../../utils/bloodCompatibility';
import { BloodGroup } from '../../types';
import { 
  User, 
  Heart, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Edit3 
} from 'lucide-react';

export const DonorProfilePage: React.FC = () => {
  const { currentUser, donorProfile, updateDonorProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    bloodGroup: 'O+' as BloodGroup,
    dateOfBirth: '',
    weight: 65,
    lastDonationDate: '',
    hasChronicIllness: false,
    chronicIllnessDetails: '',
    street: '',
    area: '',
    city: '',
    pincode: ''
  });

  useEffect(() => {
    if (donorProfile && currentUser) {
      setForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        bloodGroup: donorProfile.bloodGroup || 'O+',
        dateOfBirth: donorProfile.dateOfBirth || '1998-05-15',
        weight: donorProfile.weight || 65,
        lastDonationDate: donorProfile.lastDonationDate || '',
        hasChronicIllness: donorProfile.hasChronicIllness || false,
        chronicIllnessDetails: donorProfile.chronicIllnessDetails || '',
        street: donorProfile.address.street || '',
        area: donorProfile.address.area || '',
        city: donorProfile.address.city || '',
        pincode: donorProfile.address.pincode || ''
      });
    }
  }, [donorProfile, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);

    try {
      await updateDonorProfile({
        bloodGroup: form.bloodGroup,
        dateOfBirth: form.dateOfBirth,
        weight: Number(form.weight),
        lastDonationDate: form.lastDonationDate || null,
        hasChronicIllness: form.hasChronicIllness,
        chronicIllnessDetails: form.chronicIllnessDetails,
        address: {
          street: form.street,
          area: form.area,
          city: form.city,
          pincode: form.pincode
        },
        city: form.city,
        pincode: form.pincode
      });

      setIsEditing(false);
      setSuccessMessage('Profile information saved and synchronized with regional emergency response dispatch.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const eligibility = checkDonorEligibility(
    form.weight,
    form.dateOfBirth || '1998-01-01',
    form.hasChronicIllness,
    form.lastDonationDate
  );

  return (
    <DashboardLayout
      title="My Donor Profile"
      subtitle="Manage your personal, clinical eligibility, and local response coordinates"
      actions={
        !isEditing ? (
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(false)}
          >
            Cancel Editing
          </Button>
        )
      }
    >
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Clinical Disclaimer Banner */}
      <div className="mb-8 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Medical Screening Policy:</span> The eligibility indicators on your profile are project-defined parameters designed to prevent unnecessary alerts. In all cases, actual donor screening (hemoglobin test, blood pressure, final compatibility cross-matching) is conducted on-site by certified physicians and technicians at the recipient hospital or blood bank.
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Personal Info */}
        <Card title="1. Personal Information" subtitle="Your official contact record">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Full Name" htmlFor="name" hint="Name registered with account">
              <Input
                id="name"
                name="name"
                value={form.name}
                disabled
                className="bg-slate-50"
              />
            </FormField>

            <FormField label="Email Address" htmlFor="email">
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                disabled
                className="bg-slate-50"
                leftIcon={<Mail className="w-4 h-4" />}
              />
            </FormField>

            <FormField label="Phone Number" htmlFor="phone">
              <Input
                id="phone"
                name="phone"
                value={form.phone}
                disabled
                className="bg-slate-50"
                leftIcon={<Phone className="w-4 h-4" />}
              />
            </FormField>

            <FormField label="Date of Birth" htmlFor="dateOfBirth">
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
                disabled={!isEditing}
                leftIcon={<Calendar className="w-4 h-4" />}
              />
            </FormField>
          </div>
        </Card>

        {/* Section 2: Blood Information & Eligibility */}
        <Card title="2. Blood Information & Medical Eligibility" subtitle="Used to match compatibility during emergency alerts">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Blood Group" htmlFor="bloodGroup" required>
              <Select
                id="bloodGroup"
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
                disabled={!isEditing}
              >
                {BLOOD_GROUPS.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </Select>
            </FormField>

            <FormField label="Body Weight (kg)" htmlFor="weight" required hint="Must be >= 50 kg">
              <Input
                id="weight"
                name="weight"
                type="number"
                value={form.weight}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </FormField>

            <FormField label="Last Whole Blood Donation Date" htmlFor="lastDonationDate" hint="90 days required between donations">
              <Input
                id="lastDonationDate"
                name="lastDonationDate"
                type="date"
                value={form.lastDonationDate || ''}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </FormField>
          </div>

          {/* Project Eligibility Result Card */}
          <div className="mt-5 p-4 rounded-xl border bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-600">Platform Eligibility Screening:</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                eligibility.isEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {eligibility.isEligible ? 'Eligible for Emergency Dispatch' : 'Temporarily Ineligible'}
              </span>
            </div>
            {!eligibility.isEligible && (
              <ul className="mt-2 text-xs text-rose-700 list-disc list-inside space-y-1">
                {eligibility.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {/* Section 3: Location */}
        <Card title="3. Location & Area Coordinates" subtitle="Used for local area emergency proximity without external GPS trackers">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormField label="Street Address" htmlFor="street">
                <Input
                  id="street"
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </FormField>
            </div>

            <FormField label="Area / Neighborhood" htmlFor="area" required>
              <Input
                id="area"
                name="area"
                value={form.area}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="e.g. Anna Nagar"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="City" htmlFor="city" required>
                <Input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Chennai"
                />
              </FormField>

              <FormField label="Pincode" htmlFor="pincode" required>
                <Input
                  id="pincode"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="600040"
                />
              </FormField>
            </div>
          </div>
        </Card>

        {/* Save / Cancel bar when editing */}
        {isEditing && (
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-end gap-3 sticky bottom-4">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
            >
              Save Profile Changes
            </Button>
          </div>
        )}
      </form>
    </DashboardLayout>
  );
};
