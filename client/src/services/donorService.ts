import api from './api';

/**
 * DONOR SERVICE — calls the real Express + SQLite backend.
 * 
 * API returns snake_case (blood_group, is_available, etc.)
 * We normalise to camelCase here so the rest of the UI works unchanged.
 */

/** Normalise flat snake_case donor profile from the API into the camelCase shape the UI expects */
function normaliseDonorProfile(p: any) {
  if (!p) return null;
  return {
    // IDs
    _id:       p.id         || p._id,
    id:        p.id         || p._id,
    // Donor-specific
    bloodGroup:             p.blood_group          || p.bloodGroup,
    isAvailable:            p.is_available === 1   || p.is_available === true || p.isAvailable === true,
    dateOfBirth:            p.date_of_birth        || p.dateOfBirth,
    weight:                 p.weight,
    hasChronicIllness:      p.has_chronic_illness  === 1 || p.hasChronicIllness === true,
    chronicIllnessDetails:  p.chronic_illness_details || p.chronicIllnessDetails,
    lastDonationDate:       p.last_donation_date   || p.lastDonationDate || null,
    totalDonations:         p.total_donations      ?? p.totalDonations ?? 0,
    // Location — expose BOTH flat and nested so all old UI code works
    city:    p.city,
    pincode: p.pincode,
    area:    p.area,
    street:  p.street,
    address: {
      street:  p.street  || '',
      area:    p.area    || '',
      city:    p.city    || '',
      pincode: p.pincode || '',
    },
    // User details embedded
    user: {
      _id:      p.user_id  || p.id,
      id:       p.user_id  || p.id,
      name:     p.name,
      email:    p.email,
      phone:    p.phone,
      role:     'donor',
      isActive: true,
    },
    name:  p.name,
    email: p.email,
    phone: p.phone,
    createdAt: p.created_at || p.createdAt,
    // Keep raw snake_case too for the few places that use it
    ...p,
  };
}

export const donorService = {

  // ── GET DONOR DASHBOARD ─────────────────────────────────────────────────
  getDashboard: async () => {
    const { data } = await api.get('/donor/dashboard');
    const raw = data.data;
    return {
      ...raw,
      profile: normaliseDonorProfile(raw.profile),
    };
  },

  // ── GET PROFILE ─────────────────────────────────────────────────────────
  getProfile: async () => {
    const { data } = await api.get('/donor/dashboard');
    return normaliseDonorProfile(data.data.profile);
  },

  // ── UPDATE PROFILE ──────────────────────────────────────────────────────
  updateProfile: async (updates: {
    name?: string;
    phone?: string;
    weight?: number;
    has_chronic_illness?: boolean;
    chronic_illness_details?: string;
    street?: string;
    area?: string;
    city?: string;
    pincode?: string;
  }) => {
    const { data } = await api.put('/donor/profile', updates);
    return normaliseDonorProfile(data.data);
  },

  // ── TOGGLE AVAILABILITY ─────────────────────────────────────────────────
  setAvailability: async (isAvailable: boolean) => {
    const { data } = await api.put('/donor/availability', { is_available: isAvailable });
    return data.is_available;
  },

  // ── GET EMERGENCY ALERTS ────────────────────────────────────────────────
  getEmergencyRequestsForDonor: async (_bloodGroup?: string) => {
    const { data } = await api.get('/donor/emergency-alerts');
    // Normalise each request to the shape UI expects
    return (data.data || []).map((r: any) => normaliseRequest(r));
  },

  // ── RESPOND TO REQUEST ──────────────────────────────────────────────────
  respondToRequest: async (
    requestId: string,
    donorOrStatus: any,
    statusOrNotes?: any,
    notes?: string
  ) => {
    let status: 'ACCEPTED' | 'REJECTED' = 'ACCEPTED';
    let response_notes: string | null = null;
    if (typeof donorOrStatus === 'string') {
      status = donorOrStatus as any;
      response_notes = statusOrNotes || null;
    } else {
      status = (statusOrNotes as any) || 'ACCEPTED';
      response_notes = notes || null;
    }
    const { data } = await api.post(`/donor/respond/${requestId}`, {
      status,
      response_notes,
    });
    return data;
  },

  // ── GET DONATION HISTORY ────────────────────────────────────────────────
  getDonationHistory: async () => {
    const { data } = await api.get('/donor/history');
    return (data.data || []).map((h: any) => ({
      _id:          h.id || h._id,
      bloodGroup:   h.blood_group  || h.bloodGroup,
      unitsDonated: h.units_donated ?? h.unitsDonated ?? 1,
      donatedAt:    h.donated_at   || h.donatedAt,
      remarks:      h.remarks,
      hospitalName: h.hospital_name || h.hospitalName,
      hospitalCity: h.hospital_city || h.hospitalCity,
      requestId:    h.request_id   || h.requestId,
      ...h,
    }));
  },

  // ── GET MY RESPONSES ────────────────────────────────────────────────────
  getMyResponses: async (id: string) => {
    const { data } = await api.get('/donor/dashboard');
    return (data.data.activeResponses || []).map((r: any) => normaliseResponse(r));
  },
};

/** Normalise emergency request from backend snake_case → camelCase UI shape */
function normaliseRequest(r: any) {
  if (!r) return r;
  return {
    _id:               r.id          || r._id,
    id:                r.id          || r._id,
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
      _id:  r.hospital_id   || r.hospital?._id  || '',
      name: r.hospital_name || r.hospital?.name || '',
      phone: r.emergency_phone || r.hospital?.phone || '',
    },
    hospitalProfile: {
      hospitalName:   r.hospital_name    || '',
      emergencyPhone: r.emergency_phone  || '',
      contactPerson:  r.contact_person   || '',
      address: {
        street:  r.street  || '',
        area:    r.area    || '',
        city:    r.city    || '',
        pincode: r.pincode || '',
      },
    },
    createdAt: r.created_at || r.createdAt,
    responsesCount: r.responsesCount || {
      pending: 0, accepted: 0, rejected: 0, total: 0
    },
    ...r,
  };
}

function normaliseResponse(r: any) {
  if (!r) return r;
  return {
    _id:       r.id || r._id,
    requestId: r.request_id || r.requestId,
    status:    r.status,
    responseNotes: r.response_notes || r.responseNotes,
    respondedAt: r.responded_at || r.respondedAt,
    isDonationCompleted: r.is_donation_completed || false,
    donor: {
      _id:   r.donor_id || r.donorId,
      name:  r.donor_name  || r.donor?.name,
      email: r.donor_email || r.donor?.email,
      phone: r.donor_phone || r.donor?.phone,
    },
    request: r.request ? normaliseRequest(r.request) : undefined,
    ...r,
  };
}
