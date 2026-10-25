import api from './api';

/**
 * HOSPITAL SERVICE — calls the real Express + SQLite backend.
 *
 * API returns snake_case (hospital_name, contact_person, etc.)
 * We normalise to camelCase here so the rest of the UI works unchanged.
 */

/** Normalise flat snake_case hospital profile → camelCase UI shape */
function normaliseHospitalProfile(p: any) {
  if (!p) return null;
  return {
    // IDs
    _id: p.id || p._id,
    id:  p.id || p._id,
    // Hospital-specific camelCase
    hospitalName:        p.hospital_name        || p.hospitalName,
    licenseNumber:       p.license_number       || p.licenseNumber,
    contactPerson:       p.contact_person       || p.contactPerson,
    emergencyPhone:      p.emergency_phone      || p.emergencyPhone,
    verificationStatus:  p.verification_status  || p.verificationStatus,
    // Location — both flat and nested so all old UI code works
    street:  p.street  || '',
    area:    p.area    || '',
    city:    p.city    || '',
    pincode: p.pincode || '',
    address: {
      street:  p.street  || '',
      area:    p.area    || '',
      city:    p.city    || '',
      pincode: p.pincode || '',
    },
    // User details
    user: {
      _id:   p.user_id || p.id,
      id:    p.user_id || p.id,
      name:  p.name,
      email: p.email,
      phone: p.phone,
      role:  'hospital',
    },
    name:  p.name,
    email: p.email,
    phone: p.phone,
    createdAt: p.created_at || p.createdAt,
    // Keep raw fields too
    ...p,
  };
}

/** Normalise emergency request from backend → camelCase UI shape */
function normaliseRequest(r: any) {
  if (!r) return r;
  return {
    _id:               r.id || r._id,
    id:                r.id || r._id,
    patientBloodGroup: r.patient_blood_group  || r.patientBloodGroup,
    requiredUnits:     r.required_units       ?? r.requiredUnits,
    fulfilledUnits:    r.fulfilled_units      ?? r.fulfilledUnits ?? 0,
    urgency:           r.urgency,
    status:            r.status,
    patientCaseDetails: r.patient_case_details || r.patientCaseDetails,
    location: {
      street:  r.street  || '',
      area:    r.area    || '',
      city:    r.city    || '',
      pincode: r.pincode || '',
    },
    hospital: {
      _id:   r.hospital_id   || '',
      name:  r.hospital_name || '',
      phone: r.emergency_phone || '',
    },
    hospitalProfile: {
      hospitalName:   r.hospital_name   || '',
      emergencyPhone: r.emergency_phone || '',
      contactPerson:  r.contact_person  || '',
      address: {
        street:  r.street  || '',
        area:    r.area    || '',
        city:    r.city    || '',
        pincode: r.pincode || '',
      },
    },
    createdAt: r.created_at || r.createdAt,
    responsesCount: r.responsesCount || { pending: 0, accepted: 0, rejected: 0, total: 0 },
    ...r,
  };
}

export const hospitalService = {

  // ── GET HOSPITAL DASHBOARD ──────────────────────────────────────────────
  getDashboard: async () => {
    const { data } = await api.get('/hospital/dashboard');
    const raw = data.data;
    return {
      ...raw,
      profile:         normaliseHospitalProfile(raw.profile),
      activeRequests:  (raw.activeRequests  || []).map(normaliseRequest),
      requestHistory:  (raw.requestHistory  || []).map(normaliseRequest),
    };
  },

  // ── GET PROFILE ─────────────────────────────────────────────────────────
  getProfile: async () => {
    const { data } = await api.get('/hospital/dashboard');
    return normaliseHospitalProfile(data.data.profile);
  },

  // ── UPDATE PROFILE ──────────────────────────────────────────────────────
  updateProfile: async (updates: {
    contact_person?: string;
    emergency_phone?: string;
    street?: string;
    area?: string;
    city?: string;
    pincode?: string;
  }) => {
    const { data } = await api.put('/hospital/profile', updates);
    return normaliseHospitalProfile(data.data);
  },

  // ── GET ALL REQUESTS FOR THIS HOSPITAL ─────────────────────────────────
  getEmergencyRequests: async () => {
    const { data } = await api.get('/hospital/emergency-requests');
    return (data.data || []).map(normaliseRequest);
  },

  // ── CREATE EMERGENCY REQUEST ────────────────────────────────────────────
  createEmergencyRequest: async (payload: {
    patient_blood_group: string;
    required_units: number;
    urgency: 'CRITICAL' | 'HIGH' | 'NORMAL';
    patient_case_details?: string;
    street?: string;
    area: string;
    city: string;
    pincode: string;
  }) => {
    const { data } = await api.post('/hospital/emergency-request', payload);
    return {
      ...data,
      data: normaliseRequest(data.data),
    };
  },

  // ── GET DONORS WHO RESPONDED TO A REQUEST ──────────────────────────────
  getRequestDonors: async (requestId: string) => {
    const { data } = await api.get(`/hospital/emergency-request/${requestId}/donors`);
    return data;
  },

  // ── UPDATE REQUEST STATUS ───────────────────────────────────────────────
  updateRequestStatus: async (
    requestId: string,
    status: 'FULFILLED' | 'CANCELLED' | 'OPEN' | 'SEARCHING'
  ) => {
    const { data } = await api.put(`/hospital/emergency-request/${requestId}/status`, { status });
    return data;
  },

  // ── GET STATS (from dashboard) ──────────────────────────────────────────
  getHospitalStats: async (hospitalName?: string) => {
    const { data } = await api.get('/hospital/dashboard');
    return data.data.stats;
  },
};
