import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { FormField, Input } from '../../components/common/FormField';
import { Button } from '../../components/common/Button';
import { HeartHandshake, Lock, Mail, ShieldAlert, Hospital, User as UserIcon } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('donor');
  const [email, setEmail] = useState('karthik.donor@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setError(null);
    if (newRole === 'donor') {
      setEmail('karthik.donor@example.com');
      setPassword('password123');
    } else if (newRole === 'hospital') {
      setEmail('emergency@apollohospitals.org');
      setPassword('password123');
    } else {
      setEmail('admin@bloodlink.gov.in');
      setPassword('password123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password, role });
      if (role === 'donor') navigate('/donor/dashboard');
      else if (role === 'hospital') navigate('/hospital/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-rose-100 selection:text-rose-900">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-6 text-center border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-700 to-red-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Blood<span className="text-rose-700">Link</span> Emergency
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Portal Access</h2>
          <p className="text-xs text-slate-500 mt-1">Select your account role to access your dashboard</p>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-3 gap-1.5 mt-6 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleRoleChange('donor')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'donor'
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Donor</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('hospital')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'hospital'
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Hospital className="w-3.5 h-3.5" />
              <span>Hospital</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'admin'
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8 pt-6">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Email Address" htmlFor="email" required>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />
            </FormField>

            <FormField label="Password" htmlFor="password" required>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
            </FormField>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-rose-600 focus:ring-rose-500" />
                <span>Remember session</span>
              </label>
              <span className="text-slate-400 cursor-not-allowed hover:underline">Forgot password?</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-4 font-bold shadow-md shadow-rose-900/10"
              isLoading={isLoading}
            >
              Sign In as {role.toUpperCase()}
            </Button>
          </form>

          {/* Quick Demo Credentials Info Box */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] font-semibold text-slate-500 mb-2">
              Reviewer Quick Auto-Fill:
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange('donor')}
                className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium transition"
              >
                Donor Demo
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('hospital')}
                className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium transition"
              >
                Hospital Demo
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium transition"
              >
                Admin Demo
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register/donor" className="text-rose-700 font-bold hover:underline">
              Register as Donor
            </Link>
            {' • '}
            <Link to="/register/hospital" className="text-rose-700 font-bold hover:underline">
              Hospital
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
