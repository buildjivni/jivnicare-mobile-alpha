import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "../../components/layout/ScreenContainer";
import { colors, typography, radius, shadows } from "../../theme";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { doctorApi } from "../../api/doctor";
import { DEFAULT_API_BASE_URL } from "../../api/client";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import {
  Activity,
  Users,
  IndianRupee,
  CalendarCheck,
  ShieldCheck,
  Clock,
  ArrowRight,
  Eye,
  EyeOff,
  Share2,
  CheckCircle2,
  AlertTriangle,
  CalendarX,
  TrendingUp,
  Download,
  ClipboardList,
  QrCode,
} from "lucide-react-native";

import { DoctorAccountStatusView } from "./DoctorAccountStatusView";

export interface OverviewDashboardScreenProps {
  onNavigateToQueue: () => void;
  onNavigateToRecords: () => void;
  onNavigateToSettings: () => void;
  onNavigateToBilling?: () => void;
  onNavigateToPerformance?: () => void;
  onEditProfileAndReapply?: () => void;
}

export const OverviewDashboardScreen: React.FC<OverviewDashboardScreenProps> = ({
  onNavigateToQueue,
  onNavigateToRecords,
  onNavigateToSettings,
  onNavigateToBilling,
  onNavigateToPerformance,
  onEditProfileAndReapply,
}) => {
  const { profile, fetchWorkspace } = useWorkspaceStore();
  const [overviewData, setOverviewData] = useState<any>(null);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRevenue, setShowRevenue] = useState(false);

  // Operations Toggle & Holiday Form State
  const [isOnline, setIsOnline] = useState(true);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [holidayReason, setHolidayReason] = useState("");
  const [isClosingHoliday, setIsClosingHoliday] = useState(false);

  const loadData = useCallback(async () => {
    if (!profile || profile.verificationStatus !== "VERIFIED") {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }
    try {
      const [ovRes, wlRes] = await Promise.all([
        doctorApi.getOverview().catch(() => null),
        doctorApi.getWaitlist().catch(() => ({ waitlist: [] })),
        fetchWorkspace().catch(() => null),
      ]);
      const data = ovRes?.data || ovRes;
      if (data) {
        setOverviewData(data);
        if (data?.clinicStatus?.isOnline !== undefined) {
          setIsOnline(Boolean(data.clinicStatus.isOnline));
        }
      }
      setWaitlist(wlRes?.waitlist || wlRes?.data?.waitlist || []);
    } catch (e) {
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [profile, fetchWorkspace]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleOnline = async () => {
    setIsTogglingStatus(true);
    const nextState = !isOnline;
    try {
      await doctorApi.updateClinicStatus({
        status: nextState ? "AVAILABLE" : "SHORT_BREAK",
        reason: nextState ? "" : "Paused from mobile app",
      });
      setIsOnline(nextState);
    } catch (err: any) {
      Alert.alert("Status Update Failed", err.message || "Could not update clinic status.");
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleCloseForToday = async () => {
    setIsClosingHoliday(true);
    try {
      await doctorApi.updateClinicStatus({
        status: "CLINIC_CLOSED",
        reason: holidayReason.trim() || "Closed for today",
      });
      setIsOnline(false);
      setHolidayReason("");
      Alert.alert("Clinic Closed", "Your clinic has been marked closed for today. Patients have been notified.");
    } catch (err: any) {
      Alert.alert("Failed", err.message || "Could not update holiday status.");
    } finally {
      setIsClosingHoliday(false);
    }
  };

  const handleDownloadQrSticker = () => {
    if (!profile?.slug && !profile?.id) return;
    const url = `${DEFAULT_API_BASE_URL}/api/doctor/qr-pdf?doctorId=${profile.id}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Download Error", "Could not open download link.");
    });
  };

  const handleShareProfile = () => {
    if (!profile?.slug && !profile?.id) return;
    const link = `${DEFAULT_API_BASE_URL}/doctors/${profile.slug || profile.id}`;
    const text = `Book your next appointment with ${profile.name} on JivniCare — no more waiting in line: ${link}`;
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(text)}`).catch(() => {
      Linking.openURL(`https://wa.me/?text=${encodeURIComponent(text)}`);
    });
  };

  const getDayStatusLabel = (status?: string) => {
    switch (status) {
      case "OPEN_NOW":
        return { label: "Open Now", color: colors.success, bg: colors.successBg };
      case "OPENS_LATER_TODAY":
        return { label: "Opens Later Today", color: colors.primary, bg: colors.accent };
      case "CLOSED_AFTER_HOURS":
        return { label: "Closed — Hours Ended", color: colors.offline, bg: colors.offlineBg };
      case "CLOSED_WEEKLY_OFF":
        return { label: "Closed (Weekly Off)", color: colors.offline, bg: colors.offlineBg };
      case "CLOSED_HOLIDAY":
        return { label: "Closed (Holiday)", color: colors.warning, bg: colors.warningBg };
      default:
        return { label: "Operational", color: colors.primary, bg: colors.primaryLight };
    }
  };

  const dayStatusConfig = getDayStatusLabel(overviewData?.dayStatus);

  // ═════════════════════════════════════════════════════════
  // NON-VERIFIED DOCTOR STATUS GATE (Under Review, Rejected, Suspended)
  // ═════════════════════════════════════════════════════════
  if (!profile) {
    return (
      <ScreenContainer style={styles.safeArea}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (profile.verificationStatus !== "VERIFIED") {
    return (
      <ScreenContainer style={styles.safeArea}>
        <DoctorAccountStatusView
          status={profile.verificationStatus}
          profile={profile}
          onRefreshStatus={async () => {
            setIsRefreshing(true);
            await fetchWorkspace().catch(() => {});
            setIsRefreshing(false);
          }}
          onEditProfileAndReapply={onEditProfileAndReapply}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); loadData(); }} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Top Doctor Profile Greeting */}
        <View style={styles.profileHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText}>Welcome back,</Text>
            <Text style={styles.doctorName}>{profile?.name || "Doctor"}</Text>
            <Text style={styles.doctorSpecialty}>
              {profile?.specialty} • {profile?.hospitalName}
            </Text>
          </View>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: dayStatusConfig.bg, borderColor: dayStatusConfig.color },
            ]}
          >
            <Text style={[styles.statusPillText, { color: dayStatusConfig.color }]}>
              {dayStatusConfig.label}
            </Text>
          </View>
        </View>

        {/* Verification Status Banner */}
        {profile?.verificationStatus === "VERIFIED" ? (
          <View style={styles.verifiedBanner}>
            <ShieldCheck size={18} color={colors.secondary} />
            <Text style={styles.verifiedText}>
              NMC Verified Practice • Listed on JivniCare Network
            </Text>
          </View>
        ) : (
          <View style={styles.pendingBanner}>
            <AlertTriangle size={18} color={colors.warning} />
            <Text style={styles.pendingText}>
              Verification Pending: {profile?.verificationStatus || "DRAFT"}
            </Text>
          </View>
        )}

        {/* ── 1. TODAY'S OPERATIONS CARD (1-Click Booking Toggle & Holiday Close) ── */}
        <Card style={styles.operationsCard}>
          <View style={styles.operationsHeaderRow}>
            <View style={styles.operationsIconBox}>
              <Clock size={18} color={colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.operationsTitle}>Today's Clinic Status</Text>
              <Text style={styles.operationsSub}>
                {isOnline ? "Bookings: Active & Open" : "Bookings: Paused by you"}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.bookingToggleBtn,
                isOnline ? styles.bookingToggleActive : styles.bookingTogglePaused,
              ]}
              onPress={handleToggleOnline}
              disabled={isTogglingStatus}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.pulseDot,
                  { backgroundColor: isOnline ? "#FFFFFF" : colors.textMuted },
                ]}
              />
              <Text
                style={[
                  styles.bookingToggleText,
                  { color: isOnline ? "#FFFFFF" : colors.textPrimary },
                ]}
              >
                {isTogglingStatus ? "Updating..." : isOnline ? "Pause bookings" : "Resume bookings"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Inline Holiday / Leave Form */}
          <View style={styles.holidayInlineRow}>
            <View style={styles.holidayLabelBox}>
              <CalendarX size={14} color={colors.textSecondary} />
              <Text style={styles.holidayLabelText}>Need to close for today?</Text>
            </View>
            <View style={styles.holidayInputGroup}>
              <TextInput
                style={styles.holidayInput}
                placeholder="Reason (optional)"
                placeholderTextColor={colors.textMuted}
                value={holidayReason}
                onChangeText={setHolidayReason}
              />
              <TouchableOpacity
                style={styles.holidayCloseBtn}
                onPress={handleCloseForToday}
                disabled={isClosingHoliday}
                activeOpacity={0.8}
              >
                <Text style={styles.holidayCloseBtnText}>
                  {isClosingHoliday ? "Saving..." : "Close for Today"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* ── 2. OPD SUMMARY STATS GRID ── */}
        <Text style={styles.sectionTitle}>Today's OPD Summary</Text>
        <View style={styles.metricGrid}>
          {/* Total Patients */}
          <Card style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <Users size={16} color={colors.primary} />
              </View>
              <Text style={styles.metricLabel}>Total OPD</Text>
            </View>
            <Text style={styles.metricNumber}>
              {overviewData?.todayPatientsCount ?? overviewData?.todayMetrics?.todayPatientsBooked ?? 0}
            </Text>
            <Text style={styles.metricSub}>
              {overviewData?.onlineCount ?? 0} Online • {overviewData?.walkInCount ?? 0} Walk-in
            </Text>
          </Card>

          {/* Completed */}
          <Card style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.secondaryLight }]}>
                <CalendarCheck size={16} color={colors.secondary} />
              </View>
              <Text style={styles.metricLabel}>Served</Text>
            </View>
            <Text style={[styles.metricNumber, { color: colors.secondary }]}>
              {overviewData?.completedToday ?? 0}
            </Text>
            <Text style={styles.metricSub}>Consultations completed</Text>
          </Card>

          {/* Revenue / Earnings */}
          <Card style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.accent }]}>
                <IndianRupee size={16} color={colors.navy} />
              </View>
              <TouchableOpacity
                onPress={() => setShowRevenue(!showRevenue)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showRevenue ? (
                  <EyeOff size={16} color={colors.textMuted} />
                ) : (
                  <Eye size={16} color={colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.metricNumber}>
              {showRevenue
                ? `₹${(overviewData?.estimatedEarnings ?? overviewData?.todayMetrics?.todayRevenue ?? 0).toLocaleString("en-IN")}`
                : "₹••••"}
            </Text>
            <Text style={styles.metricSub}>Estimated earnings today</Text>
          </Card>

          {/* Lifetime Patients */}
          <Card style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.mutedBackground }]}>
                <Activity size={16} color={colors.textSecondary} />
              </View>
              <Text style={styles.metricLabel}>Lifetime</Text>
            </View>
            <Text style={styles.metricNumber}>
              {profile?.jivnicarePatientsServed ?? overviewData?.todayMetrics?.allPatientsServedAllTime ?? 0}
            </Text>
            <Text style={styles.metricSub}>Patients on JivniCare</Text>
          </Card>
        </View>

        {/* ── 3. DOCTOR WAITLIST ALERTS (If Waitlist Has Entries) ── */}
        {waitlist.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.sectionTitle}>Waitlist Alerts</Text>
            <Card style={styles.waitlistCard}>
              {waitlist.slice(0, 4).map((w: any, idx: number) => (
                <View
                  key={w.id || idx}
                  style={[
                    styles.waitlistRow,
                    idx < waitlist.length - 1 && styles.waitlistDivider,
                  ]}
                >
                  <View>
                    <Text style={styles.waitlistName}>{w.patientName || "Patient"}</Text>
                    <Text style={styles.waitlistTime}>
                      Joined: {new Date(w.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                  <Badge
                    label={w.notified ? "NOTIFIED" : "WAITING"}
                    variant={w.notified ? "success" : "warning"}
                    size="sm"
                  />
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* ── 4. PRACTICE & GROWTH SECTION ── */}
        <Text style={styles.sectionTitle}>Practice & Growth</Text>
        <View style={styles.growthGrid}>
          {/* Performance Insights */}
          <TouchableOpacity
            style={styles.growthCard}
            onPress={onNavigateToPerformance}
            activeOpacity={0.8}
          >
            <View style={styles.growthCardContent}>
              <View style={[styles.growthIconBox, { backgroundColor: "#ECFDF5" }]}>
                <TrendingUp size={18} color={colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.growthCardTitle}>Performance Insights</Text>
                <Text style={styles.growthCardSub}>
                  This month: {overviewData?.practiceGrowth?.thisMonthPatientsServed ?? overviewData?.completedToday ?? 0} patients served
                </Text>
              </View>
              <ArrowRight size={16} color={colors.secondary} />
            </View>
          </TouchableOpacity>

          {/* Billing & Plan Status */}
          <TouchableOpacity
            style={styles.growthCard}
            onPress={onNavigateToBilling}
            activeOpacity={0.8}
          >
            <View style={styles.growthCardContent}>
              <View style={[styles.growthIconBox, { backgroundColor: colors.accent }]}>
                <ShieldCheck size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.growthCardTitle}>Billing & Plan Status</Text>
                <Text style={styles.growthCardSub}>
                  Plan: {overviewData?.practiceGrowth?.planName || "Early Partner (Active)"}
                </Text>
              </View>
              <ArrowRight size={16} color={colors.primary} />
            </View>
          </TouchableOpacity>

          {/* QR Code Sticker Download Card (Matching Web) */}
          <View style={styles.qrDownloadBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.qrTitle}>Clinic QR Code Sticker</Text>
              <Text style={styles.qrSub}>
                Download a 4-page printable PDF sticker pack for patients to scan and book appointments.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.qrDownloadBtn}
              onPress={handleDownloadQrSticker}
              activeOpacity={0.8}
            >
              <Download size={14} color="#FFFFFF" />
              <Text style={styles.qrDownloadBtnText}>Download PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 5. QUICK ACTIONS LIST ── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionList}>
          <TouchableOpacity style={styles.actionCard} onPress={onNavigateToQueue}>
            <View style={styles.actionIconBox}>
              <Users size={20} color={colors.primary} />
            </View>
            <View style={styles.actionTextBox}>
              <Text style={styles.actionTitle}>Open Live OPD Queue</Text>
              <Text style={styles.actionSub}>Call next patient, manage tokens & walk-ins</Text>
            </View>
            <ArrowRight size={18} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={onNavigateToRecords}>
            <View style={[styles.actionIconBox, { backgroundColor: colors.secondaryLight }]}>
              <CalendarCheck size={20} color={colors.secondary} />
            </View>
            <View style={styles.actionTextBox}>
              <Text style={styles.actionTitle}>Patient Records & History</Text>
              <Text style={styles.actionSub}>Search past consultations and export reports</Text>
            </View>
            <ArrowRight size={18} color={colors.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleShareProfile}>
            <View style={[styles.actionIconBox, { backgroundColor: "#ECFDF5" }]}>
              <Share2 size={20} color="#10B981" />
            </View>
            <View style={styles.actionTextBox}>
              <Text style={styles.actionTitle}>Share Booking Link</Text>
              <Text style={styles.actionSub}>Send direct WhatsApp booking link to patients</Text>
            </View>
            <ArrowRight size={18} color="#10B981" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: colors.mutedBackground,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 130,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  greetingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontSize: 13,
  },
  doctorName: {
    ...typography.titleLarge,
    color: colors.navy,
    fontWeight: "700",
    marginTop: 2,
  },
  doctorSpecialty: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 12,
    marginTop: 2,
    fontWeight: "600",
    textTransform: "none",
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  statusPillText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
  },
  verifiedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    gap: 8,
    marginBottom: 16,
  },
  verifiedText: {
    ...typography.caption,
    color: "#065F46",
    fontWeight: "700",
    textTransform: "none",
  },
  pendingBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warningBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    gap: 8,
    marginBottom: 16,
  },
  pendingText: {
    ...typography.caption,
    color: "#92400E",
    fontWeight: "700",
    textTransform: "none",
  },
  operationsCard: {
    padding: 14,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 20,
    ...shadows.soft,
  },
  operationsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  operationsIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  operationsTitle: {
    ...typography.titleSmall,
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  operationsSub: {
    ...typography.caption,
    fontSize: 11,
    color: colors.secondary,
    fontWeight: "600",
    textTransform: "none",
  },
  bookingToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.lg,
  },
  bookingToggleActive: {
    backgroundColor: "#059669",
  },
  bookingTogglePaused: {
    backgroundColor: colors.mutedBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  bookingToggleText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "none",
  },
  holidayInlineRow: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    gap: 8,
  },
  holidayLabelBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  holidayLabelText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
    textTransform: "none",
  },
  holidayInputGroup: {
    flexDirection: "row",
    gap: 8,
  },
  holidayInput: {
    flex: 1,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.mutedBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 10,
    fontSize: 11,
    color: colors.textPrimary,
  },
  holidayCloseBtn: {
    paddingHorizontal: 12,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  holidayCloseBtnText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    textTransform: "none",
  },
  sectionTitle: {
    ...typography.titleMedium,
    color: colors.navy,
    fontWeight: "700",
    marginBottom: 12,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    width: "48%",
    flexGrow: 1,
    padding: 14,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  metricNumber: {
    ...typography.titleLarge,
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  metricSub: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
    textTransform: "none",
  },
  waitlistCard: {
    padding: 12,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },
  waitlistRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  waitlistDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  waitlistName: {
    ...typography.titleSmall,
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  waitlistTime: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
    textTransform: "none",
  },
  growthGrid: {
    gap: 10,
    marginBottom: 20,
  },
  growthCard: {
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    ...shadows.soft,
  },
  growthCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  growthIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  growthCardTitle: {
    ...typography.titleSmall,
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  growthCardSub: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    textTransform: "none",
  },
  qrDownloadBanner: {
    backgroundColor: "#0F172A",
    borderRadius: radius.xl,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...shadows.soft,
  },
  qrTitle: {
    ...typography.titleSmall,
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  qrSub: {
    ...typography.caption,
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 2,
    textTransform: "none",
  },
  qrDownloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  qrDownloadBtnText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    textTransform: "none",
  },
  quickActionList: {
    gap: 10,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.soft,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionTextBox: {
    flex: 1,
  },
  actionTitle: {
    ...typography.titleSmall,
    color: colors.navy,
    fontSize: 13,
    fontWeight: "700",
  },
  actionSub: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
    textTransform: "none",
  },
});
