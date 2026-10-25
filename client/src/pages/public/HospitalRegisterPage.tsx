import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FormField, Input } from '../../components/common/FormField';
import { Button } from '../../components/common/Button';
import { HeartHandshake, Building2, Mail, Phone, MapPin, ShieldCheck, AlertCircle } from 'lucide-react';

export const HospitalRegisterPage: React.FC = () => {
  const { registerHospital } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    hospitalName: '',
    email: '',
    phone: '',
    password: '',
    licenseNumber: '',
    contactPerson: '',
    emergencyPhone: '',
    street: '',
    area: 'Greams Road',
    city: 'Chennai',
    pincode: '600006'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.hospitalName || !formData.email || !formData.licenseNumber || !formData.emergencyPhone) {
      setError('Please provide mandatory hospital and emergency contact details.');
      return;
    }

    setIsLoading(true);
    try {
      await registerHospital(formData);
      navigate('/hospital/dashboard');
    } catch (err: any) {
      setError(err.message || 'Hospital onboarding failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 selection:bg-rose-100 selection:text-rose-900">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-6 border-b border-slate-100 bg-gradient-to-r from-slate-100/60 via-slate-50 to-white">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-8 h-8 rounded-lg bg-rose-700 text-white flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <span className="text-base font-extrabold text-slate-900">
              Blood<span className="text-rose-700">Link</span> Emergency
            </span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Hospital & Blood Bank Onboarding
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Connect your clinical facility to instantly broadcast blood emergencies to nearby compatible donors.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Institution Credentials */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-rose-700" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                1. Institutional Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <FormField label="Official Hospital / Medical Center Name" htmlFor="hospitalName" required>
                  <Input
                    id="hospitalName"
                    name="hospitalName"
                    value={formData.hospitalName}
                    onChange={handleChange}
                    placeholder="e.g. Apollo Speciality Hospitals"
                    required
                  />
                </FormField>
              </div>

              <FormField label="Clinical Registration / License Number" htmlFor="licenseNumber" required hint="State health department registry ID">
                <Input
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="e.g. TN-CHE-MED-2018-0912"
                  leftIcon={<ShieldCheck className="w-4 h-4" />}
                  required
                />
              </FormField>

              <FormField label="Official Hospital Email" htmlFor="email" required>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="emergency@apollohospitals.org"
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />
              </FormField>

              <FormField label="Hospital Admin Password" htmlFor="password" required>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </FormField>

              <FormField label="General Telephone" htmlFor="phone" required>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 44 2829 0200"
                  leftIcon={<Phone className="w-4 h-4" />}
                  required
                />
              </FormField>
            </div>
          </div>

          {/* Section 2: Emergency Contact Liaison */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Phone className="w-4 h-4 text-rose-700" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                2. Emergency Response Desk & Contact Person
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Blood Bank / Triage In-Charge Person" htmlFor="contactPerson" required>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="e.g. Dr. K. Senthil Kumar (Blood Bank In-Charge)"
                  required
                />
              </FormField>

              <FormField label="24/7 Emergency Blood Hotline Phone" htmlFor="emergencyPhone" required hint="Direct line donors will call on emergency alert">
                <Input
                  id="emergencyPhone"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  placeholder="+91 44 2829 0200 / +91 98400 11223"
                  required
                />
              </FormField>
            </div>
          </div>

          {/* Section 3: Hospital Facility Location */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-rose-700" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                3. Facility Address (Emergency Reception Point)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <FormField label="Street Address" htmlFor="street">
                  <Input
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="No. 21, Greams Lane, Off Greams Road"
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
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Existing healthcare facility?{' '}
              <Link to="/login" className="text-rose-700 font-bold hover:underline">
                Access hospital portal
              </Link>
            </p>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full sm:w-auto font-bold shadow-md shadow-rose-900/10"
              isLoading={isLoading}
            >
              Complete Hospital Onboarding
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
