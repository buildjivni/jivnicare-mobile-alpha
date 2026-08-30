export type TokenStatus =
  | "BOOKED"
  | "AWAITING_ARRIVAL"
  | "READY"
  | "PAYMENT_PENDING"
  | "CALLED"
  | "IN_CONSULTATION"
  | "COMPLETED"
  | "HELD"
  | "NO_SHOW"
  | "CANCELLED";

export type TokenType = "ONLINE" | "WALK_IN" | "EMERGENCY";

export interface QueueTokenItem {
  id: string;
  tokenNumber: number;
  token?: number;
  name: string;
  initials: string;
  phone: string;
  condition: string;
  visitType: "Online" | "Walk-in";
  waitTime: number; // in minutes
  priority: "Emergency" | "Standard";
  location: string;
  status: "Waiting" | "In-Person" | "Held" | "No-Show" | "Served" | string;
  appointmentTime: string;
  age: number | null;
  paymentVerified: boolean;
  paymentMode: "CASH" | "ONLINE" | null;
  isFollowUpWaived: boolean;
}

export interface QueueStats {
  total: number;
  waiting: number;
  completed: number;
  currentActive: number;
  avgWaitTime: number;
  emergencyCount: number;
  heldCount: number;
  noShowCount: number;
  serviceType?: string;
}

export interface QueueResponse {
  success: boolean;
  queue: {
    id: string;
    date: string;
    currentNumber: number;
    status: string;
  };
  tokens: any[];
  stats: QueueStats;
  doctor: {
    averageConsultationTime: number;
    clinicName: string;
  };
}
