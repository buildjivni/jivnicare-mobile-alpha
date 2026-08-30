import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, typography, radius, shadows } from "../../../theme";
import { QueueStats } from "../../../types/queue";
import { Users, Clock, CheckCircle2, UserX, Gauge, Siren } from "lucide-react-native";

export interface QueueStatCardsProps {
  stats: QueueStats;
  metricType?: "EMERGENCY_QUEUE" | "AVG_WAIT";
  metricValue?: number | string;
  selectedFilter?: string;
  onSelectFilter?: (filter: string) => void;
  loading?: boolean;
}

export const QueueStatCards: React.FC<QueueStatCardsProps> = ({
  stats,
  metricType = "AVG_WAIT",
  metricValue,
  selectedFilter = "All",
  onSelectFilter,
}) => {
  const avgWaitTime = stats.avgWaitTime || 0;
  const isHealthy = avgWaitTime < 30;
  const isEmergencyQueue = metricType === "EMERGENCY_QUEUE";

  return (
    <View style={styles.container}>
      {/* ── 1. Queue Health Banner ── */}
      <View
        style={[
          styles.healthBanner,
          isHealthy ? styles.healthyBanner : styles.unhealthyBanner,
        ]}
      >
        <View
          style={[
            styles.healthIconBox,
            isHealthy ? styles.healthyIconBox : styles.unhealthyIconBox,
          ]}
        >
          <Gauge size={18} color={isHealthy ? colors.secondary : "#D97706"} />
        </View>
        <View style={styles.healthTextBox}>
          <Text
            style={[
              styles.healthTitle,
              { color: isHealthy ? "#065F46" : "#92400E" },
            ]}
          >
            {isHealthy ? "Queue looking steady" : "Queue building up"}
          </Text>
          <Text
            style={[
              styles.healthDesc,
              { color: isHealthy ? "#047857" : "#B45309" },
            ]}
          >
            {isHealthy
              ? "Estimated wait is within the usual range for today's volume."
              : "Estimated wait may increase — based on queue length."}
          </Text>
        </View>
      </View>

      {/* ── 2. Grid of 4 Stat Cards ── */}
      <View style={styles.grid}>
        {/* Card 1: Waiting (Primary Focus) */}
        <TouchableOpacity
          style={[
            styles.card,
            styles.primaryCard,
            selectedFilter === "Waiting" && styles.activeFilterCard,
          ]}
          onPress={() => onSelectFilter?.(selectedFilter === "Waiting" ? "All" : "Waiting")}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.primaryLabel}>WAITING</Text>
            <View style={styles.primaryIconBox}>
              <Users size={14} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.primaryValue}>{stats.waiting}</Text>
          <Text style={styles.primarySub}>In Queue (Tap to filter)</Text>
        </TouchableOpacity>

        {/* Card 2: Served */}
        <TouchableOpacity
          style={[
            styles.card,
            styles.neutralCard,
            selectedFilter === "Served" && styles.activeFilterCard,
          ]}
          onPress={() => onSelectFilter?.(selectedFilter === "Served" ? "All" : "Served")}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.neutralLabel}>SERVED</Text>
            <View style={[styles.iconBox, { backgroundColor: "#ECFDF5" }]}>
              <CheckCircle2 size={14} color={colors.secondary} />
            </View>
          </View>
          <Text style={styles.neutralValue}>{stats.completed}</Text>
          <Text style={[styles.neutralSub, { color: colors.secondary }]}>Completed today</Text>
        </TouchableOpacity>

        {/* Card 3: No-Show */}
        <TouchableOpacity
          style={[
            styles.card,
            styles.neutralCard,
            selectedFilter === "No-Show" && styles.activeFilterCard,
          ]}
          onPress={() => onSelectFilter?.(selectedFilter === "No-Show" ? "All" : "No-Show")}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.neutralLabel}>NO-SHOW</Text>
            <View style={[styles.iconBox, { backgroundColor: "#F1F5F9" }]}>
              <UserX size={14} color={colors.textSecondary} />
            </View>
          </View>
          <Text style={styles.neutralValue}>{stats.noShowCount || 0}</Text>
          <Text style={styles.neutralSub}>Missed turns</Text>
        </TouchableOpacity>

        {/* Card 4: Dynamic Emergency Queue vs Avg Wait */}
        <TouchableOpacity
          style={[
            styles.card,
            isEmergencyQueue ? styles.emergencyCard : styles.neutralCard,
            selectedFilter === "Emergency" && styles.activeFilterCard,
          ]}
          onPress={() => {
            if (isEmergencyQueue) {
              onSelectFilter?.(selectedFilter === "Emergency" ? "All" : "Emergency");
            }
          }}
          activeOpacity={isEmergencyQueue ? 0.8 : 1}
        >
          <View style={styles.cardHeader}>
            <Text
              style={isEmergencyQueue ? styles.emergencyLabel : styles.neutralLabel}
            >
              {isEmergencyQueue ? "EMERGENCY" : "AVG WAIT"}
            </Text>
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: isEmergencyQueue ? "#FEF2F2" : colors.accent,
                },
              ]}
            >
              {isEmergencyQueue ? (
                <Siren size={14} color={colors.destructive} />
              ) : (
                <Clock size={14} color={colors.navy} />
              )}
            </View>
          </View>
          <Text
            style={isEmergencyQueue ? styles.emergencyValue : styles.neutralValue}
          >
            {isEmergencyQueue
              ? stats.emergencyCount || 0
              : `${metricValue ?? avgWaitTime}m`}
          </Text>
          <Text
            style={[
              styles.neutralSub,
              isEmergencyQueue && { color: colors.destructive },
            ]}
          >
            {isEmergencyQueue ? "Emergency active" : "Per patient"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  healthBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: 12,
    gap: 10,
    ...shadows.soft,
  },
  healthyBanner: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  unhealthyBanner: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  healthIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  healthyIconBox: {
    backgroundColor: "#DCFCE7",
  },
  unhealthyIconBox: {
    backgroundColor: "#FEF3C7",
  },
  healthTextBox: {
    flex: 1,
  },
  healthTitle: {
    ...typography.titleSmall,
    fontSize: 13,
    fontWeight: "700",
  },
  healthDesc: {
    ...typography.caption,
    fontSize: 11,
    marginTop: 1,
    textTransform: "none",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    width: "48%",
    flexGrow: 1,
    borderRadius: radius.xl,
    padding: 12,
    borderWidth: 1,
    ...shadows.soft,
  },
  primaryCard: {
    backgroundColor: colors.primary,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  neutralCard: {
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
  },
  emergencyCard: {
    backgroundColor: colors.surface,
    borderColor: "rgba(239, 68, 68, 0.25)",
  },
  activeFilterCard: {
    borderWidth: 2,
    borderColor: colors.navy,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  primaryLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.85)",
    letterSpacing: 0.5,
  },
  neutralLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  emergencyLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: colors.destructive,
    letterSpacing: 0.5,
  },
  primaryIconBox: {
    width: 26,
    height: 26,
    borderRadius: radius.md,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryValue: {
    ...typography.titleLarge,
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  neutralValue: {
    ...typography.titleLarge,
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  emergencyValue: {
    ...typography.titleLarge,
    fontSize: 22,
    fontWeight: "700",
    color: colors.destructive,
  },
  primarySub: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
    textTransform: "none",
  },
  neutralSub: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "600",
    color: colors.textMuted,
    marginTop: 2,
    textTransform: "none",
  },
});
