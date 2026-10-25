import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { FormField, Input } from '../../components/common/FormField';
import { Button } from '../../components/common/Button';
import { 
  Building2, 
  Phone, 
  Mail, 
  ShieldCheck, 
  MapPin, 
  Edit3, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const HospitalProfilePage: React.FC = () => {
  const { currentUser, hospitalProfile, updateHospitalProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    hospitalName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    contactPerson: '',
    emergencyPhone: '',
    street: '',
    area: '',
    city: '',
    pincode: ''
  });

  useEffect(() => {
    if (hospitalProfile && currentUser) {
      setForm({
        hospitalName: hospitalProfile.hospitalName || currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        licenseNumber: hospitalProfile.licenseNumber || 'TN-CHE-MED-2018-0912',
        contactPerson: hospitalProfile.contactPerson || 'Blood Bank In-Charge',
        emergencyPhone: hospitalProfile.emergencyPhone || '+91 44 2829 0200',
        street: hospitalProfile.address.street || '',
        area: hospitalProfile.address.area || '',
        city: hospitalProfile.address.city || '',
        pincode: hospitalProfile.address.pincode || ''
      });
    }
  }, [hospitalProfile, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateHospitalProfile({
        hospitalName: form.hospitalName,
        licenseNumber: form.licenseNumber,
        contactPerson: form.contactPerson,
        emergencyPhone: form.emergencyPhone,
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
      setSuccessMessage('Hospital profile and emergency response hotline updated successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="Hospital Facility Profile"
      subtitle="Institutional accreditation and emergency reception coordination details"
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
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
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

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        <Card title="1. Facility Information & License" subtitle="Verified healthcare registry data">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormField label="Hospital / Healthcare Institution Name" htmlFor="hospitalName" required>
                <Input
                  id="hospitalName"
                  name="hospitalName"
                  value={form.hospitalName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </FormField>
            </div>

            <FormField label="Clinical Registration License" htmlFor="licenseNumber" required>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                value={form.licenseNumber}
                onChange={handleChange}
                disabled={!isEditing}
                leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
                required
              />
            </FormField>

            <FormField label="Institutional Email" htmlFor="email">
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
          </div>
        </Card>

        <Card title="2. Emergency Triage Contact Desk" subtitle="Lines used to coordinate incoming blood donors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Emergency Contact Person / In-Charge" htmlFor="contactPerson" required>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={form.contactPerson}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </FormField>

            <FormField label="24/7 Emergency Blood Hotline" htmlFor="emergencyPhone" required hint="Dispatched to donors on alert acceptance">
              <Input
                id="emergencyPhone"
                name="emergencyPhone"
                value={form.emergencyPhone}
                onChange={handleChange}
                disabled={!isEditing}
                leftIcon={<Phone className="w-4 h-4 text-rose-700" />}
                required
              />
            </FormField>
          </div>
        </Card>

        <Card title="3. Facility Location" subtitle="Emergency reception and blood bank arrival address">
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

            <FormField label="Area / Zone" htmlFor="area" required>
              <Input
                id="area"
                name="area"
                value={form.area}
                onChange={handleChange}
                disabled={!isEditing}
                required
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
                  required
                />
              </FormField>

              <FormField label="Pincode" htmlFor="pincode" required>
                <Input
                  id="pincode"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </FormField>
            </div>
          </div>
        </Card>

        {isEditing && (
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-end gap-3 sticky bottom-4">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Save Hospital Information
            </Button>
          </div>
        )}
      </form>
    </DashboardLayout>
  );
};
