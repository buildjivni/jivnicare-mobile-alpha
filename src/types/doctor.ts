export type VerificationStatus =
  | "DRAFT"
  | "PENDING"
  | "VERIFIED"
  | "UPDATE_PENDING"
  | "REJECTED";

export type ClinicAvailabilityStatus =
  | "AVAILABLE"
  | "SHORT_BREAK"
  | "CLINIC_CLOSED"
  | "EMERGENCY_ONLY";

export interface DoctorProfile {
  id: string;
  slug: string;
  name: string;
  bio: string;
  regNumber: string;
  specialty: string;
  experience: string;
  qualifications: string;
  hospitalName: string;
  address: string;
  city: string;
  district: string;
  pincode: string;
  phone: string;
  consultationFee: string;
  profileImage: string;
  clinicImage: string;
  verificationStatus: VerificationStatus;
  verificationNote: string;
  profileCompleteness: number;
  jivnicarePatientsServed: number;
  lifetimePatientsDeclaration: string;
  registrationStep: number;
  medicalCouncil: string;
  registrationYear?: number;
  registrationId: string;
  internalDoctorId: string;
  registrationComplete: boolean;
  expertiseTags: string[];
  platformPricing: {
    monthlyFee: number;
    discountPercent: number;
    partnerTier: string;
    freeUntil: string | null;
  } | null;
  operatorName?: string;
  operatorMobile?: string;
}

export interface DoctorSettings {
  fee: string;
  averageConsultationTime: string;
  emergencySlots: string;
  emergencyFee: string;
  bookingWindowStart: string;
  followUpDays: string;
  opdPatientLimit: string;
  leaveMode: boolean;
  clinicStatus: ClinicAvailabilityStatus;
  statusReason: string;
  statusExpiresAt: string | null;
}

export interface ShiftSchedule {
  enabled: boolean;
  start: string;
  end: string;
  maxTokens: number;
}

export interface DaySchedule {
  enabled: boolean;
  shifts: ShiftSchedule[];
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}
