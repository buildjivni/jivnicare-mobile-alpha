import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, typography, radius, shadows } from "../../../theme";
import { QueueTokenItem } from "../../../types/queue";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import {
  PhoneCall,
  UserCheck,
  CheckCircle2,
  PauseCircle,
  UserX,
  PlayCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
} from "lucide-react-native";

export interface UpNextCallingDeckProps {
  currentPatient: QueueTokenItem | null;
  upNextPatient: QueueTokenItem | null;
  isProcessing: boolean;
  onNextPatient: () => void;
  onConfirmEntry: (tokenId: string) => void;
  onFinish: (tokenId: string) => void;
  onHold: (tokenId: string) => void;
  onNoShow: (tokenId: string) => void;
}

export const UpNextCallingDeck: React.FC<UpNextCallingDeckProps> = ({
  currentPatient,
  upNextPatient,
  isProcessing,
  onNextPatient,
  onConfirmEntry,
  onFinish,
  onHold,
  onNoShow,
}) => {
  return (
    <Card style={styles.container}>
      {/* ── CASE 1: ACTIVE PATIENT CURRENTLY IN CHAMBER ── */}
      {currentPatient ? (
        <View>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>CURRENTLY IN CONSULTATION</Text>
            </View>
            <Badge
              label={`Token #${currentPatient.token}`}
              variant={currentPatient.priority === "Emergency" ? "destructive" : "primary"}
              size="md"
            />
          </View>

          {/* Patient Details */}
          <View style={styles.patientInfoRow}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>{currentPatient.initials}</Text>
            </View>
            <View style={styles.detailsText}>
              <Text style={styles.patientName}>{currentPatient.name}</Text>
              <Text style={styles.patientMeta}>
                {currentPatient.visitType} • {currentPatient.condition || "General"}
                {currentPatient.age ? ` • ${currentPatient.age} yrs` : ""}
              </Text>
              {Boolean(currentPatient.phone) && (
                <Text style={styles.phoneText}>+91 {currentPatient.phone}</Text>
              )}
            </View>
          </View>

          {/* Main Action Bar */}
          <View style={styles.actionGrid}>
            <Button
              title="Finish Consultation"
              variant="secondary"
              size="lg"
              onPress={() => onFinish(currentPatient.id)}
              loading={isProcessing}
              icon={<CheckCircle2 size={18} color="#FFFFFF" />}
              style={styles.fullWidthBtn}
            />

            <View style={styles.secondaryActionRow}>
              <Button
                title="Put On Hold"
                variant="outline"
                size="sm"
                onPress={() => onHold(currentPatient.id)}
                disabled={isProcessing}
                icon={<PauseCircle size={14} color={colors.navy} />}
                style={{ flex: 1 }}
              />
              <Button
                title="Mark No-Show"
                variant="destructive"
                size="sm"
                onPress={() => onNoShow(currentPatient.id)}
                disabled={isProcessing}
                icon={<UserX size={14} color="#FFFFFF" />}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      ) : upNextPatient ? (
        /* ── CASE 2: NO ACTIVE PATIENT -> UP NEXT PATIENT READY TO CALL ── */
        <View>
          <View style={styles.headerRow}>
            <View style={styles.readyIndicator}>
              <Text style={styles.readyText}>READY TO CALL</Text>
            </View>
            <Badge label={`Next: Token #${upNextPatient.token}`} variant="accent" size="md" />
          </View>

          <View style={styles.patientInfoRow}>
            <View style={[styles.avatarBox, { backgroundColor: colors.accent }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {upNextPatient.initials}
              </Text>
            </View>
            <View style={styles.detailsText}>
              <Text style={styles.patientName}>{upNextPatient.name}</Text>
              <Text style={styles.patientMeta}>
                {upNextPatient.visitType} • {upNextPatient.condition || "General Consultation"}
              </Text>
            </View>
          </View>

          <Button
            title={`Call Token #${upNextPatient.token} (${upNextPatient.name})`}
            variant="primary"
            size="lg"
            onPress={onNextPatient}
            loading={isProcessing}
            icon={<PhoneCall size={18} color="#FFFFFF" />}
            style={styles.fullWidthBtn}
          />
        </View>
      ) : (
        /* ── CASE 3: QUEUE EMPTY ── */
        <View style={styles.emptyCallingDeck}>
          <CheckCircle2 size={32} color={colors.secondary} />
          <Text style={styles.emptyTitle}>Queue Cleared</Text>
          <Text style={styles.emptySubtitle}>
            All active patients for today's OPD shift have been served.
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 18,
    borderRadius: radius["2xl"],
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: "rgba(86, 150, 199, 0.2)",
    ...shadows.premium,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  liveText: {
    ...typography.caption,
    fontSize: 9,
    color: colors.success,
    fontWeight: "900",
  },
  readyIndicator: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  readyText: {
    ...typography.caption,
    fontSize: 9,
    color: colors.primary,
    fontWeight: "900",
  },
  patientInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    ...typography.titleSmall,
    color: colors.primary,
    fontWeight: "800",
  },
  detailsText: {
    flex: 1,
  },
  patientName: {
    ...typography.titleMedium,
    color: colors.textPrimary,
  },
  patientMeta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  phoneText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: "none",
  },
  actionGrid: {
    gap: 10,
  },
  fullWidthBtn: {
    width: "100%",
  },
  secondaryActionRow: {
    flexDirection: "row",
    gap: 10,
  },
  emptyCallingDeck: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  emptyTitle: {
    ...typography.titleSmall,
    color: colors.navy,
    marginTop: 8,
  },
  emptySubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
});
