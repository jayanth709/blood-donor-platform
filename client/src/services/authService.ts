import api from './api';

/**
 * AUTH SERVICE — All calls go to the real Express + SQLite backend.
 * Token is stored in localStorage as 'bloodlink_token'.
 * User data is stored in localStorage as 'bloodlink_user'.
 */
export const authService = {

  // ── LOGIN ──────────────────────────────────────────────────────────────
  login: async (credentials: { email: string; password: string; role?: string }) => {
    const { data } = await api.post('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });
    localStorage.setItem('bloodlink_token', data.token);
    localStorage.setItem('bloodlink_user', JSON.stringify(data.user));
    return data; // { success, token, user: { id, name, email, phone, role, profile } }
  },

  // ── REGISTER DONOR ─────────────────────────────────────────────────────
  // The form uses camelCase; the backend expects snake_case — we map here.
  registerDonor: async (formData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    // camelCase from the form
    bloodGroup?: string;
    dateOfBirth?: string;
    weight?: number;
    hasChronicIllness?: boolean;
    chronicIllnessDetails?: string;
    lastDonationDate?: string;
    street?: string;
    area: string;
    city: string;
    pincode: string;
    // snake_case already (from direct API calls)
    blood_group?: string;
    date_of_birth?: string;
    has_chronic_illness?: boolean;
    chronic_illness_details?: string;
  }) => {
    // Normalise to snake_case for the backend
    const payload = {
      name:                    formData.name,
      email:                   formData.email,
      password:                formData.password,
      phone:                   formData.phone,
      blood_group:             formData.blood_group    || formData.bloodGroup,
      date_of_birth:           formData.date_of_birth  || formData.dateOfBirth,
      weight:                  Number(formData.weight),
      has_chronic_illness:     formData.has_chronic_illness ?? formData.hasChronicIllness ?? false,
      chronic_illness_details: formData.chronic_illness_details || formData.chronicIllnessDetails || null,
      last_donation_date:      formData.lastDonationDate || null,
      street:                  formData.street || null,
      area:                    formData.area,
      city:                    formData.city,
      pincode:                 formData.pincode,
    };

    const { data } = await api.post('/auth/register/donor', payload);
    localStorage.setItem('bloodlink_token', data.token);
    localStorage.setItem('bloodlink_user', JSON.stringify(data.user));
    return data; // { success, token, user }
  },

  // ── REGISTER HOSPITAL ──────────────────────────────────────────────────
  // The form uses camelCase; the backend expects snake_case — we map here.
  registerHospital: async (formData: {
    // camelCase from the form
    hospitalName?: string;
    licenseNumber?: string;
    contactPerson?: string;
    emergencyPhone?: string;
    // snake_case already
    hospital_name?: string;
    license_number?: string;
    contact_person?: string;
    emergency_phone?: string;
    // common fields
    name?: string;       // the user's display name (same as hospitalName)
    email: string;
    password: string;
    phone: string;
    street?: string;
    area: string;
    city: string;
    pincode: string;
  }) => {
    const hospitalName = formData.hospital_name || formData.hospitalName || '';

    const payload = {
      name:            formData.name || hospitalName, // user's name = hospital name
      email:           formData.email,
      password:        formData.password,
      phone:           formData.phone,
      hospital_name:   hospitalName,
      license_number:  formData.license_number  || formData.licenseNumber,
      contact_person:  formData.contact_person  || formData.contactPerson,
      emergency_phone: formData.emergency_phone || formData.emergencyPhone,
      street:          formData.street || null,
      area:            formData.area,
      city:            formData.city,
      pincode:         formData.pincode,
    };

    const { data } = await api.post('/auth/register/hospital', payload);
    localStorage.setItem('bloodlink_token', data.token);
    localStorage.setItem('bloodlink_user', JSON.stringify(data.user));
    return data;
  },

  // ── GET CURRENT USER (from /me endpoint) ───────────────────────────────
  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data.user;
  },

  // ── CHANGE PASSWORD ────────────────────────────────────────────────────
  changePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await api.put('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return data;
  },

  // ── LOGOUT ─────────────────────────────────────────────────────────────
  logout: () => {
    localStorage.removeItem('bloodlink_token');
    localStorage.removeItem('bloodlink_user');
  },

  // ── GET STORED USER (no network — from localStorage) ──────────────────
  getCurrentUser: () => {
    try {
      const raw = localStorage.getItem('bloodlink_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // ── GET TOKEN ──────────────────────────────────────────────────────────
  getToken: () => localStorage.getItem('bloodlink_token'),

  // ── IS LOGGED IN ───────────────────────────────────────────────────────
  isAuthenticated: () => !!localStorage.getItem('bloodlink_token'),
};
