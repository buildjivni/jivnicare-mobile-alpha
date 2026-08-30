import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from "react-native";
import { colors, typography, radius, shadows } from "../../theme";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { doctorApi } from "../../api/doctor";
import {
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  CalendarDays,
  Activity,
  Globe,
  UserX,
} from "lucide-react-native";

export const PerformanceScreen: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAnalytics = async () => {
    try {
      const res = await doctorApi.getAnalytics(30);
      setData(res.period || res.data || res);
    } catch (e) {
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const total = data?.totalBookings || 0;
  const completed = data?.completed || 0;
  const online = data?.onlineBookings || 0;
  const walkin = data?.walkInBookings || 0;
  const onlinePercent = total > 0 ? Math.round((online / total) * 100) : 50;
  const walkinPercent = total > 0 ? 100 - onlinePercent : 50;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); loadAnalytics(); }} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Practice Performance</Text>
            <Text style={styles.subtitle}>Last 30 days clinical analytics & patient trends</Text>
          </View>
          <Badge label="30-Day Period" variant="primary" size="sm" />
        </View>

        {/* Top Metric Cards */}
        <View style={styles.grid}>
          <Card style={styles.metricCard}>
            <View style={styles.iconRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
                <TrendingUp size={16} color={colors.primary} />
              </View>
              <Text style={styles.metricLabel}>Total OPD</Text>
            </View>
            <Text style={styles.metricNumber}>{total}</Text>
            <Text style={styles.metricSub}>Patients registered</Text>
          </Card>

          <Card style={styles.metricCard}>
            <View style={styles.iconRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.secondaryLight }]}>
                <CheckCircle2 size={16} color={colors.secondary} />
              </View>
              <Text style={styles.metricLabel}>Completed</Text>
            </View>
            <Text style={[styles.metricNumber, { color: colors.secondary }]}>{completed}</Text>
            <Text style={styles.metricSub}>Consultations finished</Text>
          </Card>
        </View>

        {/* Patient Volume Breakdown */}
        <Card style={styles.sectionCard}>
          <Text style={styles.cardHeading}>Patient Volume Source</Text>
          <Text style={styles.cardSub}>Online JivniCare bookings vs. Clinic walk-ins</Text>

          <View style={styles.barContainer}>
            <View style={[styles.barSegment, { width: `${onlinePercent}%`, backgroundColor: colors.primary }]} />
            <View style={[styles.barSegment, { width: `${walkinPercent}%`, backgroundColor: colors.secondary }]} />
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>Online ({onlinePercent}%) - {online} patients</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.secondary }]} />
              <Text style={styles.legendText}>Walk-in ({walkinPercent}%) - {walkin} patients</Text>
            </View>
          </View>
        </Card>

        {/* Efficiency & Queue Velocity */}
        <Card style={styles.sectionCard}>
          <Text style={styles.cardHeading}>Operational Efficiency</Text>

          <View style={styles.efficiencyRow}>
            <View style={styles.effItem}>
              <Clock size={20} color={colors.navy} />
              <Text style={styles.effValue}>12 mins</Text>
              <Text style={styles.effLabel}>Avg Consult Time</Text>
            </View>

            <View style={styles.effDivider} />

            <View style={styles.effItem}>
              <Users size={20} color={colors.secondary} />
              <Text style={[styles.effValue, { color: colors.secondary }]}>94%</Text>
              <Text style={styles.effLabel}>Completion Rate</Text>
            </View>

            <View style={styles.effDivider} />

            <View style={styles.effItem}>
              <UserX size={20} color={colors.destructive} />
              <Text style={[styles.effValue, { color: colors.destructive }]}>4%</Text>
              <Text style={styles.effLabel}>No-Show Rate</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    ...typography.titleMedium,
    color: colors.navy,
  },
  subtitle: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: "none",
  },
  grid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    padding: 14,
    borderRadius: radius.xl,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
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
    fontSize: 24,
    color: colors.navy,
    fontWeight: "900",
  },
  metricSub: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: "none",
  },
  sectionCard: {
    padding: 16,
    marginBottom: 14,
    borderRadius: radius.xl,
  },
  cardHeading: {
    ...typography.titleSmall,
    color: colors.navy,
  },
  cardSub: {
    ...typography.bodySmall,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 14,
  },
  barContainer: {
    height: 14,
    borderRadius: radius.full,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 14,
  },
  barSegment: {
    height: "100%",
  },
  legendRow: {
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: colors.textSecondary,
  },
  efficiencyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 12,
  },
  effItem: {
    alignItems: "center",
    flex: 1,
  },
  effValue: {
    ...typography.titleSmall,
    fontSize: 16,
    color: colors.navy,
    fontWeight: "900",
    marginTop: 6,
  },
  effLabel: {
    ...typography.caption,
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: "center",
  },
  effDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.cardBorder,
  },
});
