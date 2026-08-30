import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, typography, radius, shadows } from "../../../theme";
import { QueueTokenItem } from "../../../types/queue";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import {
  PhoneCall,
  Clock,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  UserX,
  CreditCard,
  Banknote,
} from "lucide-react-native";

export interface PatientCardItemProps {
  patient: QueueTokenItem;
  onCall: (tokenId: string) => void;
  onHold: (tokenId: string) => void;
  onResume: (tokenId: string) => void;
  onNoShow: (tokenId: string) => void;
  onCollectPayment: (tokenId: string, mode: "CASH" | "ONLINE") => void;
}

export const PatientCardItem: React.FC<PatientCardItemProps> = ({
  patient,
  onCall,
  onHold,
  onResume,
  onNoShow,
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
            #{patient.token}
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
          <Text style={styles.metaText}>
            {patient.condition || "General"}
            {patient.age ? ` • ${patient.age} yrs` : ""}
            {patient.location && patient.location !== "N/A" ? ` • ${patient.location}` : ""}
          </Text>
          {Boolean(patient.phone) && (
            <Text style={styles.phoneText}>+91 {patient.phone}</Text>
          )}
        </View>
      </View>

      {/* Payment & Action Controls */}
      <View style={styles.bottomActionRow}>
        {/* Payment Cell */}
        <View style={styles.paymentCell}>
          {patient.paymentVerified ? (
            <View style={styles.paidBadge}>
              <CheckCircle2 size={12} color={colors.secondary} />
              <Text style={styles.paidText}>
                Paid ({patient.paymentMode || "Verified"})
              </Text>
            </View>
          ) : (
            <View style={styles.collectButtonGroup}>
              <TouchableOpacity
                style={styles.collectBtn}
                onPress={() => onCollectPayment(patient.id, "CASH")}
              >
                <Banknote size={12} color={colors.navy} />
                <Text style={styles.collectBtnText}>Cash</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.collectBtn}
                onPress={() => onCollectPayment(patient.id, "ONLINE")}
              >
                <CreditCard size={12} color={colors.primary} />
                <Text style={[styles.collectBtnText, { color: colors.primary }]}>Online</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Contextual Actions */}
        <View style={styles.actionButtons}>
          {isWaiting && (
            <TouchableOpacity
              style={[styles.miniActionBtn, { backgroundColor: colors.primaryLight }]}
              onPress={() => onCall(patient.id)}
            >
              <PhoneCall size={14} color={colors.primary} />
              <Text style={[styles.miniActionText, { color: colors.primary }]}>Call</Text>
            </TouchableOpacity>
          )}

          {isHeld && (
            <TouchableOpacity
              style={[styles.miniActionBtn, { backgroundColor: colors.successBg }]}
              onPress={() => onResume(patient.id)}
            >
              <PlayCircle size={14} color={colors.success} />
              <Text style={[styles.miniActionText, { color: colors.success }]}>Resume</Text>
            </TouchableOpacity>
          )}

          {isWaiting && (
            <TouchableOpacity
              style={[styles.miniActionBtn, { backgroundColor: colors.warningBg }]}
              onPress={() => onHold(patient.id)}
            >
              <PauseCircle size={14} color={colors.warning} />
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
    ...typography.titleSmall,
    color: colors.navy,
    fontWeight: "900",
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
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  waitText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
  },
  patientInfoRow: {
    marginBottom: 10,
  },
  nameBlock: {
    flex: 1,
  },
  nameText: {
    ...typography.titleSmall,
    fontSize: 15,
    color: colors.textPrimary,
  },
  metaText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  phoneText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: "none",
  },
  bottomActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  paymentCell: {
    flex: 1,
  },
  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  paidText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.secondary,
    fontWeight: "800",
  },
  collectButtonGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  collectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.mutedBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  collectBtnText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.navy,
    fontWeight: "700",
    textTransform: "none",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  miniActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  miniActionText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "none",
  },
});
