import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { donorService } from '../services/donorService';
import { hospitalService } from '../services/hospitalService';
import { useToast } from './ToastContext';

// ── Types (simplified to match real API response shape) ───────────────────
interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'donor' | 'hospital' | 'admin';
  profile?: any; // donor profile or hospital profile from the backend
}

interface AuthContextType {
  currentUser: AuthUser | null;
  donorProfile: any | null;
  hospitalProfile: any | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string; role?: string }) => Promise<void>;
  registerDonor: (data: any) => Promise<void>;
  registerHospital: (data: any) => Promise<void>;
  logout: () => void;
  toggleAvailability: () => Promise<boolean>;
  updateDonorProfile: (updates: any) => Promise<void>;
  updateHospitalProfile: (updates: any) => Promise<void>;
  refreshAuthData: () => Promise<void>;
  // kept for UI compatibility
  switchRole: (role: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [donorProfile, setDonorProfile] = useState<any | null>(null);
  const [hospitalProfile, setHospitalProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  // ── Load role-specific profile from backend ─────────────────────────────
  const loadRoleProfile = async (user: AuthUser | null) => {
    if (!user) {
      setDonorProfile(null);
      setHospitalProfile(null);
      return;
    }

    try {
      if (user.role === 'donor') {
        const dashboard = await donorService.getDashboard();
        setDonorProfile(dashboard.profile || null);
        setHospitalProfile(null);
      } else if (user.role === 'hospital') {
        const dashboard = await hospitalService.getDashboard();
        setHospitalProfile(dashboard.profile || null);
        setDonorProfile(null);
      } else {
        // admin — no sub-profile needed
        setDonorProfile(null);
        setHospitalProfile(null);
      }
    } catch (err) {
      // If API fails (token invalid etc.) just clear profiles
      setDonorProfile(null);
      setHospitalProfile(null);
    }
  };

  // ── Refresh everything from the backend ────────────────────────────────
  const refreshAuthData = async () => {
    const user = authService.getCurrentUser();
    if (!user) return;
    setCurrentUser(user);
    await loadRoleProfile(user);
  };

  // ── Init on mount — restore session from localStorage ──────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const storedUser = authService.getCurrentUser();
        const token = authService.getToken();

        if (storedUser && token) {
          setCurrentUser(storedUser);
          // Verify token is still valid by fetching /me
          try {
            const freshUser = await authService.getMe();
            const mergedUser = { ...storedUser, ...freshUser };
            setCurrentUser(mergedUser);
            localStorage.setItem('bloodlink_user', JSON.stringify(mergedUser));
            await loadRoleProfile(mergedUser);
          } catch {
            // Token expired
            authService.logout();
            setCurrentUser(null);
          }
        }
      } catch (e) {
        console.error('Auth init error:', e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // ── LOGIN ───────────────────────────────────────────────────────────────
  const login = async (credentials: { email: string; password: string; role?: string }) => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      setCurrentUser(res.user);
      await loadRoleProfile(res.user);
      showToast({
        type: 'success',
        title: 'Authentication Successful',
        message: `Welcome back, ${res.user.name} (${res.user.role.toUpperCase()})`
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Login Failed',
        message: err.message || 'Please check your credentials.'
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ── REGISTER DONOR ──────────────────────────────────────────────────────
  const registerDonor = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await authService.registerDonor(data);
      setCurrentUser(res.user);
      // Load fresh profile from the backend
      try {
        const dashboard = await donorService.getDashboard();
        setDonorProfile(dashboard.profile || null);
      } catch { /* will load on next refresh */ }

      showToast({
        type: 'success',
        title: 'Registration Complete',
        message: 'Your donor profile is now saved in the database and active on the network.'
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Registration Error',
        message: err.message || 'Could not register donor.'
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ── REGISTER HOSPITAL ───────────────────────────────────────────────────
  const registerHospital = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await authService.registerHospital(data);
      setCurrentUser(res.user);
      try {
        const dashboard = await hospitalService.getDashboard();
        setHospitalProfile(dashboard.profile || null);
      } catch { /* will load on next refresh */ }

      showToast({
        type: 'success',
        title: 'Hospital Onboarded',
        message: 'Hospital account saved to database. Ready to broadcast emergency requests.'
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Registration Error',
        message: err.message || 'Could not register hospital.'
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ── LOGOUT ──────────────────────────────────────────────────────────────
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setDonorProfile(null);
    setHospitalProfile(null);
    showToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been securely signed out of the platform.'
    });
  };

  // ── SWITCH ROLE (demo only — kept for UI compatibility) ─────────────────
  const switchRole = async (_role: string) => {
    showToast({
      type: 'warning',
      title: 'Demo Mode Disabled',
      message: 'Please log in with the actual credentials for each role.'
    });
  };

  // ── TOGGLE AVAILABILITY ─────────────────────────────────────────────────
  const toggleAvailability = async (): Promise<boolean> => {
    const currentAvail = donorProfile?.is_available ?? false;
    const newState = !currentAvail;
    try {
      await donorService.setAvailability(newState);
      setDonorProfile((prev: any) => prev ? { ...prev, is_available: newState ? 1 : 0 } : null);
      showToast({
        type: newState ? 'success' : 'warning',
        title: newState ? 'Availability: Active' : 'Availability: Paused',
        message: newState
          ? 'You will now receive emergency alerts for compatible blood requests.'
          : 'Emergency alerts are temporarily paused for your profile.'
      });
      return newState;
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
      return currentAvail;
    }
  };

  // ── UPDATE DONOR PROFILE ────────────────────────────────────────────────
  const updateDonorProfile = async (updates: any) => {
    try {
      const updated = await donorService.updateProfile(updates);
      setDonorProfile((prev: any) => ({ ...prev, ...updated }));
      showToast({ type: 'success', title: 'Profile Updated', message: 'Your donor profile has been saved to the database.' });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Update Failed', message: err.message });
      throw err;
    }
  };

  // ── UPDATE HOSPITAL PROFILE ─────────────────────────────────────────────
  const updateHospitalProfile = async (updates: any) => {
    try {
      const updated = await hospitalService.updateProfile(updates);
      setHospitalProfile((prev: any) => ({ ...prev, ...updated }));
      showToast({ type: 'success', title: 'Hospital Profile Updated', message: 'Emergency contact information saved.' });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Update Failed', message: err.message });
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        donorProfile,
        hospitalProfile,
        isLoading,
        login,
        registerDonor,
        registerHospital,
        logout,
        switchRole,
        toggleAvailability,
        updateDonorProfile,
        updateHospitalProfile,
        refreshAuthData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
