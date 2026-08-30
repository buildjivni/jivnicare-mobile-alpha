import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from "react-native";
import { ScreenContainer } from "../../components/layout/ScreenContainer";
import { colors, typography, radius, shadows } from "../../theme";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
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
} from "lucide-react-native";

export interface OverviewDashboardScreenProps {
  onNavigateToQueue: () => void;
  onNavigateToRecords: () => void;
  onNavigateToSettings: () => void;
}

export const OverviewDashboardScreen: React.FC<OverviewDashboardScreenProps> = ({
  onNavigateToQueue,
  onNavigateToRecords,
  onNavigateToSettings,
}) => {
  const { profile, fetchWorkspace, isLoading: isProfileLoading } = useWorkspaceStore();
  const [overviewData, setOverviewData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRevenue, setShowRevenue] = useState(false);

  const loadData = async () => {
    try {
      const [res] = await Promise.all([
        doctorApi.getOverview(),
        fetchWorkspace(),
      ]);
      setOverviewData(res.data || res);
    } catch (e) {
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
          <View>
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

        {/* Verification Status Card */}
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

        {/* Quick OPD Metrics Grid */}
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
              {overviewData?.todayPatientsCount ?? 0}
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
                ? `₹${(overviewData?.estimatedEarnings ?? 0).toLocaleString("en-IN")}`
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
              {profile?.jivnicarePatientsServed ?? 0}
            </Text>
            <Text style={styles.metricSub}>Patients on JivniCare</Text>
          </Card>
        </View>

        {/* Action Shortcuts */}
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
    paddingBottom: 120,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  greetingText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "none",
  },
  doctorName: {
    ...typography.titleLarge,
    color: colors.navy,
  },
  doctorSpecialty: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
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
    fontWeight: "800",
  },
  verifiedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.secondaryLight,
    borderWidth: 1,
    borderColor: "rgba(75, 159, 95, 0.2)",
    padding: 10,
    borderRadius: radius.lg,
    marginBottom: 20,
  },
  verifiedText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.secondary,
    fontWeight: "700",
    textTransform: "none",
  },
  pendingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    padding: 10,
    borderRadius: radius.lg,
    marginBottom: 20,
  },
  pendingText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.warning,
    fontWeight: "700",
    textTransform: "none",
  },
  sectionTitle: {
    ...typography.titleSmall,
    color: colors.navy,
    marginBottom: 12,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: "48%",
    padding: 14,
    borderRadius: radius.xl,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  metricLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "700",
    textTransform: "none",
  },
  metricNumber: {
    ...typography.titleLarge,
    fontSize: 22,
    color: colors.navy,
    fontWeight: "900",
  },
  metricSub: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
    textTransform: "none",
  },
  quickActionList: {
    gap: 10,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.soft,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
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
    fontSize: 14,
    color: colors.textPrimary,
  },
  actionSub: {
    ...typography.bodySmall,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
