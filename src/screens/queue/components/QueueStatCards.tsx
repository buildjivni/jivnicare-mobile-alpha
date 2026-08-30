import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { colors, typography, radius, shadows } from "../../../theme";
import { QueueStats } from "../../../types/queue";
import { Users, Clock, CheckCircle2, AlertCircle, PauseCircle } from "lucide-react-native";

export interface QueueStatCardsProps {
  stats: QueueStats;
  loading?: boolean;
}

export const QueueStatCards: React.FC<QueueStatCardsProps> = ({ stats }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* 1. Waiting in Queue */}
      <View style={[styles.card, { borderColor: "rgba(86, 150, 199, 0.25)" }]}>
        <View style={styles.iconRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
            <Users size={16} color={colors.primary} />
          </View>
          <Text style={styles.cardLabel}>Waiting</Text>
        </View>
        <Text style={[styles.cardValue, { color: colors.primary }]}>{stats.waiting}</Text>
        <Text style={styles.cardSub}>In line for OPD</Text>
      </View>

      {/* 2. Estimated Wait Time */}
      <View style={[styles.card, { borderColor: "rgba(27, 63, 107, 0.1)" }]}>
        <View style={styles.iconRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.accent }]}>
            <Clock size={16} color={colors.navy} />
          </View>
          <Text style={styles.cardLabel}>Avg Wait</Text>
        </View>
        <Text style={styles.cardValue}>{stats.avgWaitTime || 15}m</Text>
        <Text style={styles.cardSub}>Per consultation</Text>
      </View>

      {/* 3. Completed Today */}
      <View style={[styles.card, { borderColor: "rgba(75, 159, 95, 0.25)" }]}>
        <View style={styles.iconRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.secondaryLight }]}>
            <CheckCircle2 size={16} color={colors.secondary} />
          </View>
          <Text style={styles.cardLabel}>Served</Text>
        </View>
        <Text style={[styles.cardValue, { color: colors.secondary }]}>{stats.completed}</Text>
        <Text style={styles.cardSub}>Patients finished</Text>
      </View>

      {/* 4. Total Tokens */}
      <View style={[styles.card, { borderColor: colors.cardBorder }]}>
        <View style={styles.iconRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.mutedBackground }]}>
            <Users size={16} color={colors.textSecondary} />
          </View>
          <Text style={styles.cardLabel}>Total</Text>
        </View>
        <Text style={styles.cardValue}>{stats.total}</Text>
        <Text style={styles.cardSub}>Registered today</Text>
      </View>

      {/* 5. Emergency / Held count (if > 0) */}
      {(stats.emergencyCount > 0 || stats.heldCount > 0) && (
        <View style={[styles.card, { borderColor: colors.destructiveBorder, backgroundColor: colors.destructiveBg }]}>
          <View style={styles.iconRow}>
            <View style={[styles.iconBox, { backgroundColor: "#FFFFFF" }]}>
              <AlertCircle size={16} color={colors.destructive} />
            </View>
            <Text style={[styles.cardLabel, { color: colors.destructive }]}>Priority</Text>
          </View>
          <Text style={[styles.cardValue, { color: colors.destructive }]}>
            {stats.emergencyCount + stats.heldCount}
          </Text>
          <Text style={[styles.cardSub, { color: colors.destructive }]}>Emergency / Held</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 12,
    paddingVertical: 4,
  },
  card: {
    width: 120,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 12,
    borderWidth: 1,
    ...shadows.soft,
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
  cardLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  cardValue: {
    ...typography.titleLarge,
    fontSize: 22,
    color: colors.navy,
    fontWeight: "900",
  },
  cardSub: {
    ...typography.caption,
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: "none",
  },
});
