import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BloodGroup } from '../../types';
import { BLOOD_GROUPS } from '../../utils/bloodCompatibility';
import { FormField, Input, Select } from '../../components/common/FormField';
import { Button } from '../../components/common/Button';
import { HeartHandshake, User, Mail, Phone, Calendar, Weight, MapPin, AlertCircle, Check } from 'lucide-react';

export const DonorRegisterPage: React.FC = () => {
  const { registerDonor } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    bloodGroup: 'O+' as BloodGroup,
    dateOfBirth: '1998-05-15',
    weight: 65,
    hasChronicIllness: false,
    chronicIllnessDetails: '',
    street: '',
    area: 'Anna Nagar',
    city: 'Chennai',
    pincode: '600040'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.email || !formData.phone || !formData.city || !formData.pincode) {
      setError('Please provide all mandatory details marked with an asterisk.');
      return;
    }

    if (formData.weight < 45) {
      setError('Donor weight must be at least 45 kg to register on the platform.');
      return;
    }

    setIsLoading(true);
    try {
      await registerDonor(formData);
      navigate('/donor/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 selection:bg-rose-100 selection:text-rose-900">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-6 border-b border-slate-100 bg-gradient-to-r from-rose-50/50 via-slate-50 to-white">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-8 h-8 rounded-lg bg-rose-700 text-white flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <span className="text-base font-extrabold text-slate-900">
              Blood<span className="text-rose-700">Link</span> Emergency
            </span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Register as a Voluntary Blood Donor
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Join the real-time emergency network to respond when local hospitals request your blood group.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Personal Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="w-4 h-4 text-rose-700" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                1. Personal Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Full Name" htmlFor="name" required>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Karthik Ramanathan"
                  required
                />
              </FormField>

              <FormField label="Email Address" htmlFor="email" required>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="karthik@example.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />
              </FormField>

              <FormField label="Phone Number" htmlFor="phone" required hint="Used by hospital blood bank on accepted emergency">
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98401 23456"
                  leftIcon={<Phone className="w-4 h-4" />}
                  required
                />
              </FormField>

              <FormField label="Password" htmlFor="password" required>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create secure password"
                  required
                />
              </FormField>
            </div>
          </div>

          {/* Section 2: Blood Information & Health Triage */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <HeartHandshake className="w-4 h-4 text-rose-700" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                2. Blood Group & Eligibility Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Blood Group" htmlFor="bloodGroup" required>
                <Select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  required
                >
                  {BLOOD_GROUPS.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Date of Birth" htmlFor="dateOfBirth" required hint="Must be at least 18 years old">
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  leftIcon={<Calendar className="w-4 h-4" />}
                  required
                />
              </FormField>

              <FormField label="Body Weight (kg)" htmlFor="weight" required hint="Minimum 50 kg for safe donation">
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  min="40"
                  max="150"
                  value={formData.weight}
                  onChange={handleChange}
                  leftIcon={<Weight className="w-4 h-4" />}
                  required
                />
              </FormField>
            </div>

            {/* Chronic illness disclosure */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="hasChronicIllness"
                  checked={formData.hasChronicIllness}
                  onChange={handleChange}
                  className="mt-1 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    Do you have any ongoing chronic medical conditions or regular medications?
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    e.g., active cardiac conditions, untreated hypertension, severe bleeding disorders.
                  </p>
                </div>
              </label>

              {formData.hasChronicIllness && (
                <div className="mt-3">
                  <Input
                    name="chronicIllnessDetails"
                    value={formData.chronicIllnessDetails}
                    onChange={handleChange}
                    placeholder="Briefly state condition or medication..."
                  />
                </div>
              )}
            </div>

            {/* Clinical Disclaimer Box */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Clinical Note:</strong> Eligibility information collected on this platform is project-defined for dispatch filtering. Final medical screening (hemoglobin test, vital check, clinical cross-match) is performed on-site by hospital blood bank personnel prior to any actual donation.
              </span>
            </div>
          </div>

          {/* Section 3: Location Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-rose-700" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                3. Primary Location (For Local Emergency Matching)
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
                    placeholder="e.g. 14, 2nd Avenue, Roundana"
                  />
                </FormField>
              </div>

              <FormField label="Area / Locality" htmlFor="area" required>
                <Input
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g. Anna Nagar, Adyar, T. Nagar"
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
                    placeholder="600040"
                    required
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Already registered?{' '}
              <Link to="/login" className="text-rose-700 font-bold hover:underline">
                Sign in to your dashboard
              </Link>
            </p>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full sm:w-auto font-bold shadow-md shadow-rose-900/10"
              isLoading={isLoading}
            >
              Complete Registration & Set Available
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
