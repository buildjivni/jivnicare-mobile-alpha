import { create } from "zustand";
import { DoctorProfile, DoctorSettings, WeeklySchedule } from "../types/doctor";
import { doctorApi } from "../api/doctor";

interface WorkspaceState {
  profile: DoctorProfile | null;
  settings: DoctorSettings | null;
  weeklySchedule: WeeklySchedule | null;
  isLoading: boolean;
  error: string | null;
  fetchWorkspace: () => Promise<void>;
  updateLocalProfile: (partial: Partial<DoctorProfile>) => void;
  updateLocalSettings: (partial: Partial<DoctorSettings>) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  profile: null,
  settings: null,
  weeklySchedule: null,
  isLoading: true,
  error: null,

  fetchWorkspace: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await doctorApi.getProfile();
      const doc = response.doctor;
      if (!doc) {
        throw new Error("No doctor profile returned");
      }

      const profile: DoctorProfile = {
        id: doc.id,
        slug: doc.slug || "",
        name: doc.name || "",
        bio: doc.bio || "",
        regNumber: doc.registrationNumber || "",
        specialty: doc.speciality || "",
        experience: String(doc.experienceYears || 0),
        qualifications: Array.isArray(doc.qualifications) ? doc.qualifications.join(", ") : "",
        hospitalName: doc.clinicName || doc.hospitalName || "",
        address: doc.clinicAddress || doc.fullAddress || "",
        city: doc.clinicCity || doc.city || "",
        district: doc.clinicDistrict || doc.district || "",
        pincode: doc.clinicPincode || doc.pincode || "",
        phone: doc.phone || "",
        consultationFee: String(doc.consultationFee || 0),
        profileImage: doc.profilePhoto || "",
        clinicImage: doc.clinicPhotos?.[0] || "",
        verificationStatus: doc.verificationStatus || "DRAFT",
        verificationNote: doc.verificationNote || doc.rejectionReason || "",
        profileCompleteness: 100,
        jivnicarePatientsServed: doc.jivnicarePatientsServed || 0,
        lifetimePatientsDeclaration: doc.lifetimePatientsServed != null ? String(doc.lifetimePatientsServed) : "",
        registrationStep: doc.registrationStep || 1,
        medicalCouncil: doc.medicalCouncil || "",
        registrationYear: doc.registrationYear,
        registrationId: doc.registrationId || "",
        internalDoctorId: doc.internalDoctorId || "",
        registrationComplete: Boolean(doc.registrationComplete),
        expertiseTags: Array.isArray(doc.expertiseTags) ? doc.expertiseTags : [],
        platformPricing: doc.platformPricing || null,
        operatorName: doc.operatorName || "",
        operatorMobile: doc.operatorMobile || "",
      };

      const settings: DoctorSettings = {
        fee: String(doc.consultationFee || 0),
        averageConsultationTime: String(doc.averageConsultationMinutes || 10),
        emergencySlots: String(doc.emergencyCapacity || 0),
        emergencyFee: String(doc.emergencyFee || 0),
        bookingWindowStart: doc.bookingWindowStart || "08:00",
        followUpDays: doc.followUpDays != null ? String(doc.followUpDays) : "",
        opdPatientLimit: String(doc.opdPatientLimit || 30),
        leaveMode: doc.availabilityStatus !== "AVAILABLE" || !doc.isAcceptingBookings,
        clinicStatus: doc.availabilityStatus === "ON_BREAK"
          ? "SHORT_BREAK"
          : doc.availabilityStatus === "AVAILABLE"
          ? "AVAILABLE"
          : "CLINIC_CLOSED",
        statusReason: "",
        statusExpiresAt: null,
      };

      set({
        profile,
        settings,
        weeklySchedule: doc.weeklySchedule || null,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Failed to load doctor workspace" });
    }
  },

  updateLocalProfile: (partial) => {
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...partial } : null,
    }));
  },

  updateLocalSettings: (partial) => {
    set((state) => ({
      settings: state.settings ? { ...state.settings, ...partial } : null,
    }));
  },
}));
