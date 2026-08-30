import { apiClient } from "./client";
import { DoctorProfile, DoctorSettings, WeeklySchedule } from "../types/doctor";
import { QueueResponse } from "../types/queue";

export const doctorApi = {
  // ── Profile & Workspace ──────────────────────────────────────────
  getProfile: async (): Promise<{ doctor: any }> => {
    return apiClient("/api/doctor/profile");
  },

  updateProfile: async (updates: Record<string, any>): Promise<{ success: boolean; doctor?: any }> => {
    return apiClient("/api/doctor/profile/update", {
      method: "POST",
      body: JSON.stringify({ updates }),
    });
  },

  getProfileUpdateRequests: async (): Promise<{ requests: any[] }> => {
    return apiClient("/api/doctor/profile-update-requests");
  },

  // ── Onboarding (Steps 1–4) ───────────────────────────────────────
  submitOnboardStep1: async (data: {
    name: string;
    speciality: string;
    experienceYears: number;
    qualifications: string[];
    registrationNumber: string;
    medicalCouncil: string;
  }) => {
    return apiClient("/api/doctor/onboard/step1", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  submitOnboardStep2: async (data: {
    clinicName: string;
    clinicAddress: string;
    clinicDistrict: string;
    clinicCity: string;
    clinicPincode: string;
    consultationFee: number;
    latitude?: number;
    longitude?: number;
  }) => {
    return apiClient("/api/doctor/onboard/step2", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  submitOnboardStep3: async (data: {
    weeklySchedule: WeeklySchedule;
    averageConsultationMinutes: number;
    emergencyCapacity?: number;
    emergencyFee?: number;
  }) => {
    return apiClient("/api/doctor/onboard/step3", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  submitOnboardStep4: async (data: {
    profilePhoto?: string;
    registrationDocUrl?: string;
    clinicPhotos?: string[];
    acceptTerms: boolean;
  }) => {
    return apiClient("/api/doctor/onboard/step4", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // ── Live Queue Operations ────────────────────────────────────────
  getQueue: async (): Promise<QueueResponse> => {
    return apiClient("/api/doctor/queue");
  },

  callPatient: async (tokenId: string) => {
    return apiClient("/api/doctor/queue/call", {
      method: "POST",
      body: JSON.stringify({ tokenId }),
    });
  },

  confirmEntry: async (tokenId: string) => {
    return apiClient("/api/doctor/queue/confirm-entry", {
      method: "POST",
      body: JSON.stringify({ tokenId }),
    });
  },

  finishConsultation: async (tokenId: string) => {
    return apiClient("/api/doctor/queue/finish", {
      method: "POST",
      body: JSON.stringify({ tokenId }),
    });
  },

  holdPatient: async (tokenId: string, reason?: string) => {
    return apiClient("/api/doctor/queue/hold-patient", {
      method: "POST",
      body: JSON.stringify({ tokenId, reason }),
    });
  },

  resumePatient: async (tokenId: string) => {
    return apiClient("/api/doctor/queue/resume-patient", {
      method: "POST",
      body: JSON.stringify({ tokenId }),
    });
  },

  markNoShow: async (tokenId: string) => {
    return apiClient("/api/doctor/queue/no-show", {
      method: "POST",
      body: JSON.stringify({ tokenId }),
    });
  },

  advanceNextPatient: async (currentTokenId?: string, skipCurrent: boolean = false) => {
    return apiClient("/api/doctor/queue/next-patient", {
      method: "POST",
      body: JSON.stringify({ currentTokenId, skipCurrent }),
    });
  },

  undoNextPatient: async (undoToken: string) => {
    return apiClient("/api/doctor/queue/undo-next", {
      method: "POST",
      body: JSON.stringify({ undoToken }),
    });
  },

  registerWalkIn: async (walkInData: {
    name: string;
    age?: number;
    gender?: string;
    phone?: string;
    address?: string;
    symptoms?: string;
    isEmergency?: boolean;
    paymentMode?: "CASH" | "ONLINE";
  }) => {
    return apiClient("/api/doctor/queue/walk-in", {
      method: "POST",
      body: JSON.stringify(walkInData),
    });
  },

  recordPayment: async (tokenId: string, mode: "CASH" | "ONLINE") => {
    return apiClient("/api/doctor/queue/payment", {
      method: "PATCH",
      body: JSON.stringify({ tokenId, action: "collect", mode }),
    });
  },

  updateClinicStatus: async (data: {
    status: "AVAILABLE" | "SHORT_BREAK" | "CLINIC_CLOSED";
    reason?: string;
    durationMinutes?: number;
  }) => {
    return apiClient("/api/doctor/clinic-status", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  toggleHoliday: async (data: {
    active: boolean;
    reason?: string;
    mode: "soft" | "hard";
  }) => {
    return apiClient("/api/doctor/availability/holiday", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // ── Overview & Analytics ─────────────────────────────────────────
  getOverview: async () => {
    return apiClient("/api/doctor/dashboard/overview");
  },

  getAnalytics: async (period: number = 30) => {
    return apiClient(`/api/doctor/analytics?period=${period}`);
  },

  getWaitlist: async () => {
    return apiClient("/api/doctor/waitlist");
  },

  // ── Patients & Records ───────────────────────────────────────────
  getPatients: async (params: {
    search?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.from) query.append("from", params.from);
    if (params.to) query.append("to", params.to);
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    return apiClient(`/api/doctor/patients?${query.toString()}`);
  },

  // ── Settings & Operators ─────────────────────────────────────────
  getSettings: async () => {
    return apiClient("/api/doctor/settings");
  },

  updateWeeklySchedule: async (weeklySchedule: Record<string, { isOpen: boolean; start: string; end: string; maxPatients?: number | string }>) => {
    return apiClient("/api/doctor/availability/weekly-schedule", {
      method: "PUT",
      body: JSON.stringify({ weeklySchedule }),
    });
  },

  updateSettings: async (settings: Partial<DoctorSettings>) => {
    return apiClient("/api/doctor/settings", {
      method: "POST",
      body: JSON.stringify(settings),
    });
  },

  getOperators: async () => {
    return apiClient("/api/doctor/operators");
  },

  addOperator: async (data: { name: string; phone: string; role?: string }) => {
    return apiClient("/api/doctor/operators", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  removeOperator: async (operatorId: string) => {
    return apiClient(`/api/doctor/operators?id=${operatorId}`, {
      method: "DELETE",
    });
  },

  // ── Public Specialties List ──────────────────────────────────────
  getSpecialties: async (): Promise<{ success: boolean; data: { name: string }[] }> => {
    return apiClient("/api/public/specialties");
  },
};
