import api from './api';

/**
 * ADMIN SERVICE — all calls go to the real Express + SQLite backend.
 */
export const adminService = {

  // ── PLATFORM STATS ──────────────────────────────────────────────────────
  getPlatformStats: async () => {
    const { data } = await api.get('/admin/stats');
    return data.stats;
  },

  // ── ALL DONORS ──────────────────────────────────────────────────────────
  getAllDonors: async (filters?: {
    search?: string;
    blood_group?: string;
    bloodGroup?: string;
    city?: string;
    status?: string;
    available?: string;
    page?: number;
    limit?: number;
  }) => {
    const params: Record<string, any> = {};
    const bg = filters?.blood_group || filters?.bloodGroup;
    if (bg && bg !== 'ALL') params.blood_group = bg;
    if (filters?.city) params.city = filters.city;
    const avail = filters?.available || (filters?.status === 'AVAILABLE' ? 'true' : filters?.status === 'UNAVAILABLE' ? 'false' : undefined);
    if (avail && avail !== 'ALL') params.available = avail;
    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit;

    const { data } = await api.get('/admin/donors', { params });
    let list = data.data || [];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((d: any) => 
        (d.name && d.name.toLowerCase().includes(q)) ||
        (d.email && d.email.toLowerCase().includes(q)) ||
        (d.city && d.city.toLowerCase().includes(q)) ||
        (d.blood_group && d.blood_group.toLowerCase().includes(q))
      );
    }
    return list;
  },

  // ── ALL HOSPITALS ───────────────────────────────────────────────────────
  getAllHospitals: async (filters?: {
    search?: string;
    verification_status?: string;
    verification?: string;
    city?: string;
    page?: number;
  }) => {
    const params: Record<string, any> = {};
    const v = filters?.verification_status || filters?.verification;
    if (v && v !== 'ALL') params.verification_status = v.toLowerCase();
    if (filters?.city) params.city = filters.city;
    if (filters?.page) params.page = filters.page;

    const { data } = await api.get('/admin/hospitals', { params });
    let list = data.data || [];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((h: any) =>
        (h.hospital_name && h.hospital_name.toLowerCase().includes(q)) ||
        (h.email && h.email.toLowerCase().includes(q)) ||
        (h.city && h.city.toLowerCase().includes(q))
      );
    }
    return list;
  },

  // ── ALL EMERGENCY REQUESTS ──────────────────────────────────────────────
  getAllEmergencyRequests: async (filters?: {
    status?: string;
    urgency?: string;
    blood_group?: string;
    bloodGroup?: string;
    city?: string;
    page?: number;
  }) => {
    const params: Record<string, any> = {};
    if (filters?.status && filters.status !== 'ALL') params.status = filters.status;
    if (filters?.urgency && filters.urgency !== 'ALL') params.urgency = filters.urgency;
    const bg = filters?.blood_group || filters?.bloodGroup;
    if (bg && bg !== 'ALL') params.blood_group = bg;
    if (filters?.city && filters.city !== 'ALL') params.city = filters.city;
    if (filters?.page) params.page = filters.page;

    const { data } = await api.get('/admin/emergency-requests', { params });
    return data.data;
  },

  // ── ALL USERS ────────────────────────────────────────────────────────────
  getAllUsers: async (filters?: { role?: string; search?: string; page?: number }) => {
    const params: Record<string, any> = {};
    if (filters?.role && filters.role !== 'ALL') params.role = filters.role;
    if (filters?.search) params.search = filters.search;
    if (filters?.page) params.page = filters.page;

    const { data } = await api.get('/admin/users', { params });
    return data.data;
  },

  // ── TOGGLE USER ACCOUNT STATUS (suspend / activate) ────────────────────
  toggleUserStatus: async (userId: string) => {
    const { data } = await api.put(`/admin/user/${userId}/toggle-status`);
    return data;
  },

  // ── VERIFY / REJECT HOSPITAL ────────────────────────────────────────────
  verifyHospital: async (hospitalId: string, verification_status: 'verified' | 'rejected' | 'pending') => {
    const { data } = await api.put(`/admin/hospital/${hospitalId}/verify`, { verification_status });
    return data;
  },

  // ── DELETE USER (permanent) ─────────────────────────────────────────────
  deleteUser: async (userId: string) => {
    const { data } = await api.delete(`/admin/user/${userId}`);
    return data;
  },

  // kept for backward compat with older UI pages
  toggleDonorAccountStatus: async (userId: string) => {
    return adminService.toggleUserStatus(userId);
  },
  toggleHospitalVerification: async (hospitalId: string) => {
    return adminService.verifyHospital(hospitalId, 'verified');
  },
};
