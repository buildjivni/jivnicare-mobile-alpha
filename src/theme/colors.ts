/**
 * Official JivniCare Color Tokens
 * Extracted directly from web source: src/app/globals.css
 */
export const colors = {
  // Official Brand Primary & Secondary
  primary: "#5696C7",           // Brand Sky Blue
  primaryHover: "#1A4D7C",      // Primary Hover
  primaryLight: "rgba(86, 150, 199, 0.08)",
  primaryMuted: "rgba(86, 150, 199, 0.04)",
  
  secondary: "#4B9F5F",         // Brand Green
  secondaryHover: "#3d854e",
  secondaryLight: "#ECFDF5",
  
  navy: "#1B3F6B",              // Brand Navy (Headings & deep text)
  navyForeground: "rgba(27, 63, 107, 0.9)",
  navyMuted: "rgba(27, 63, 107, 0.6)",
  navyBorder: "rgba(27, 63, 107, 0.1)",

  // Neutral & Surfaces
  background: "#FFFFFF",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  cardBorder: "rgba(27, 63, 107, 0.08)",
  mutedBackground: "#F8FAFC",
  accent: "#F0F9FF",
  
  // Functional / Status
  success: "#10B981",           // Emerald-500 (Active Token, Complete)
  successBg: "#ECFDF5",
  successBorder: "#A7F3D0",
  
  warning: "#F59E0B",           // Amber-500 (On-Hold, Awaiting)
  warningBg: "#FFFBEB",
  warningBorder: "#FDE68A",
  
  destructive: "#EF4444",       // Red-500 (Emergency, Cancel, No-Show)
  destructiveBg: "#FEF2F2",
  destructiveBorder: "#FECACA",
  
  offline: "#64748B",           // Slate-500 (Closed, Offline)
  offlineBg: "#F1F5F9",
  offlineBorder: "#CBD5E1",
  
  // Text
  textPrimary: "#0F172A",        // Slate-900
  textSecondary: "#475569",      // Slate-600
  textMuted: "#94A3B8",          // Slate-400
  textWhite: "#FFFFFF",
  
  // Gradients
  gradientHero: ["#5696C7", "#4B9F5F"] as const,
  gradientBadge: ["rgba(86, 150, 199, 0.1)", "rgba(75, 159, 95, 0.1)"] as const,
};
