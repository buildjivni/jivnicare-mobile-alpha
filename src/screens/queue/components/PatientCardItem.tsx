import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, typography, radius, shadows } from "../../../theme";
import { QueueTokenItem } from "../../../types/queue";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { PaymentStatusCell } from "./PaymentStatusCell";
import {
  PhoneCall,
  Clock,
  MapPin,
  PauseCircle,
  PlayCircle,
} from "lucide-react-native";

export interface PatientCardItemProps {
  patient: QueueTokenItem;
  onCall: (tokenId: string) => void;
  onHold: (tokenId: string) => void;
  onResume: (tokenId: string) => void;
  onNoShow: (tokenId: string) => void;
  onCollectPayment: (tokenId: string, mode: "CASH" | "ONLINE") => Promise<void>;
}

export const PatientCardItem: React.FC<PatientCardItemProps> = ({
  patient,
  onCall,
  onHold,
  onResume,
  onCollectPayment,
}) => {
  const isEmergency = patient.priority === "Emergency";
  const isHeld = patient.status === "Held";
  const isWaiting = patient.status === "Waiting";
  const isInPerson = patient.status === "In-Person";
  const isNoShow = patient.status === "No-Show";
  const isServed = patient.status === "Served";

  const getStatusBadgeVariant = () => {
    if (isInPerson) return "success";
    if (isHeld) return "warning";
    if (isNoShow) return "destructive";
    if (isServed) return "neutral";
    return "primary";
  };

  return (
    <Card
      style={[
        styles.card,
        isEmergency && styles.emergencyCard,
        isInPerson && styles.inPersonCard,
      ]}
    >
      {/* Top Row: Token #, Badges, Wait Time */}
      <View style={styles.topRow}>
        <View style={styles.tokenBox}>
          <Text style={[styles.tokenNumber, isEmergency && { color: colors.destructive }]}>
            #{String(patient.tokenNumber || patient.token).padStart(2, "0")}
          </Text>
        </View>

        <View style={styles.badgeRow}>
          <Badge
            label={patient.status}
            variant={getStatusBadgeVariant()}
            size="sm"
          />
          <Badge
            label={patient.visitType}
            variant="neutral"
            size="sm"
          />
          {isEmergency && (
            <Badge label="Emergency" variant="destructive" size="sm" />
          )}
        </View>

        {isWaiting && patient.waitTime > 0 && (
          <View style={styles.waitBadge}>
            <Clock size={11} color={colors.textSecondary} />
            <Text style={styles.waitText}>~{patient.waitTime}m</Text>
          </View>
        )}
      </View>

      {/* Main Info Row */}
      <View style={styles.patientInfoRow}>
        <View style={styles.nameBlock}>
          <Text style={styles.nameText}>{patient.name}</Text>
          <View style={styles.metaRow}>
            {patient.location && patient.location !== "N/A" && patient.location !== "Local" ? (
              <View style={styles.locationChip}>
                <MapPin size={11} color={colors.textSecondary} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {patient.location}
                </Text>
              </View>
            ) : null}
            <Text style={styles.metaText}>
              {patient.condition || "General"}
              {patient.age ? ` • ${patient.age} yrs` : ""}
            </Text>
          </View>
          {Boolean(patient.phone) && (
            <Text style={styles.phoneText}>+91 {patient.phone}</Text>
          )}
        </View>
      </View>

      {/* Payment & Action Controls */}
      <View style={styles.bottomActionRow}>
        {/* Functional Payment Cell */}
        <PaymentStatusCell
          tokenId={patient.id}
          paymentVerified={Boolean(patient.paymentVerified)}
          paymentMode={patient.paymentMode as any}
          feeWaived={Boolean(patient.isFollowUpWaived)}
          onCollect={onCollectPayment}
          compact
        />

        {/* Quick Contextual Actions */}
        <View style={styles.actionButtons}>
          {isWaiting && (
            <TouchableOpacity
              style={[styles.miniActionBtn, { backgroundColor: colors.primaryLight }]}
              onPress={() => onCall(patient.id)}
            >
              <PhoneCall size={13} color={colors.primary} />
              <Text style={[styles.miniActionText, { color: colors.primary }]}>Call</Text>
            </TouchableOpacity>
          )}

          {isHeld && (
            <TouchableOpacity
              style={[styles.miniActionBtn, { backgroundColor: colors.successBg }]}
              onPress={() => onResume(patient.id)}
            >
              <PlayCircle size={13} color={colors.success} />
              <Text style={[styles.miniActionText, { color: colors.success }]}>Resume</Text>
            </TouchableOpacity>
          )}

          {isWaiting && (
            <TouchableOpacity
              style={[styles.miniActionBtn, { backgroundColor: colors.warningBg }]}
              onPress={() => onHold(patient.id)}
            >
              <PauseCircle size={13} color={colors.warning} />
              <Text style={[styles.miniActionText, { color: colors.warning }]}>Hold</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },
  emergencyCard: {
    borderColor: colors.destructiveBorder,
    backgroundColor: "#FFF8F8",
  },
  inPersonCard: {
    borderColor: "rgba(86, 150, 199, 0.4)",
    backgroundColor: "#F9FCFF",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tokenBox: {
    marginRight: 8,
  },
  tokenNumber: {
    ...typography.titleMedium,
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  waitBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.mutedBackground,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  waitText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
  },
  patientInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  nameBlock: {
    flex: 1,
  },
  nameText: {
    ...typography.titleSmall,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
    flexWrap: "wrap",
  },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.mutedBackground,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radius.full,
  },
  locationText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    maxWidth: 120,
    textTransform: "none",
  },
  metaText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: "none",
  },
  phoneText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: "none",
  },
  bottomActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 6,
  },
  miniActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.lg,
  },
  miniActionText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
  },
});
