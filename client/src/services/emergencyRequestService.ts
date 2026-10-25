import api from './api';

/**
 * EMERGENCY REQUEST SERVICE — all calls go to the real Express + SQLite backend.
 * Hospital-side creates requests; donor-side reads compatible alerts.
 */
export const emergencyRequestService = {

  // ── GET ALL REQUESTS (for hospital or admin) ────────────────────────────
  getRequests: async (filters?: {
    blood_group?: string;
    bloodGroup?: string;
    urgency?: string;
    status?: string;
    city?: string;
    hospitalId?: string;
    page?: number;
    limit?: number;
  }) => {
    // Hospital's own requests
    const { data } = await api.get('/hospital/emergency-requests');
    let list = data.data || [];

    const bg = filters?.blood_group || filters?.bloodGroup;
    if (bg && bg !== 'ALL') {
      list = list.filter((r: any) => (r.patient_blood_group || r.patientBloodGroup) === bg);
    }
    if (filters?.urgency && filters.urgency !== 'ALL') {
      list = list.filter((r: any) => r.urgency === filters.urgency);
    }
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((r: any) => r.status === filters.status);
    }
    if (filters?.city && filters.city !== 'ALL') {
      list = list.filter((r: any) => (r.city || r.location?.city) === filters.city);
    }

    return list;
  },

  // ── GET REQUEST BY ID ───────────────────────────────────────────────────
  getRequestById: async (id: string) => {
    const { data } = await api.get('/hospital/emergency-requests');
    return (data.data || []).find((r: any) => r.id === id) || null;
  },

  // ── CREATE EMERGENCY REQUEST (Hospital) ─────────────────────────────────
  createRequest: async (payload: {
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
    return data; // { success, data: newRequest, matchingDonors, matchedDonorList }
  },

  // ── UPDATE STATUS ───────────────────────────────────────────────────────
  updateStatus: async (requestId: string, status: string) => {
    const { data } = await api.put(`/hospital/emergency-request/${requestId}/status`, { status });
    return data;
  },

  // ── GET MATCHED/RESPONDED DONORS FOR A REQUEST ──────────────────────────
  getMatchedDonors: async (requestIdOrBg: string, city?: string, area?: string) => {
    try {
      // Check if it's an ID (UUID) or blood group
      if (requestIdOrBg && requestIdOrBg.includes('-') && requestIdOrBg.length > 10) {
        const { data } = await api.get(`/hospital/emergency-request/${requestIdOrBg}/donors`);
        return data.responses || [];
      }
      // If called with (bloodGroup, city, area), fetch from /admin/donors or active request donors
      const { data } = await api.get('/admin/donors', {
        params: { blood_group: requestIdOrBg, city: city !== 'ALL' ? city : undefined }
      });
      return data.data || [];
    } catch (e) {
      return [];
    }
  },

  // ── GET ALL DONOR RESPONSES FOR HOSPITAL ────────────────────────────────
  getResponsesForRequest: async (requestId: string) => {
    const { data } = await api.get(`/hospital/emergency-request/${requestId}/donors`);
    return data.responses || [];
  },

  // ── GET ALL HOSPITAL RESPONSES (overview) ──────────────────────────────
  getAllHospitalResponses: async (hospitalIdOrName?: string) => {
    // Get all requests then their donor responses
    const { data: reqData } = await api.get('/hospital/emergency-requests');
    return reqData.data || [];
  },
};
