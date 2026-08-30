import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, typography, radius } from "../../../theme";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { ClinicAvailabilityStatus } from "../../../types/doctor";
import { PlayCircle, PauseCircle, Clock, AlertTriangle, XCircle } from "lucide-react-native";

export interface ClinicStatusModalProps {
  visible: boolean;
  currentStatus: ClinicAvailabilityStatus;
  onClose: () => void;
  onSubmit: (status: "AVAILABLE" | "SHORT_BREAK" | "CLINIC_CLOSED", reason?: string, duration?: number) => Promise<void>;
}

export const ClinicStatusModal: React.FC<ClinicStatusModalProps> = ({
  visible,
  currentStatus,
  onClose,
  onSubmit,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<"AVAILABLE" | "SHORT_BREAK" | "CLINIC_CLOSED">("AVAILABLE");
  const [duration, setDuration] = useState("30");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSubmit(
        selectedStatus,
        reason.trim() || undefined,
        selectedStatus === "SHORT_BREAK" ? parseInt(duration, 10) || 30 : undefined
      );
      onClose();
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Clinic OPD Status"
      subtitle="Update your live clinic availability for patients and queue monitors."
      footer={
        <Button
          title="Apply Status Change"
          size="lg"
          onPress={handleSubmit}
          loading={isLoading}
          style={{ width: "100%" }}
        />
      }
    >
      {/* Options */}
      <View style={styles.optionList}>
        {/* Available / Open */}
        <TouchableOpacity
          style={[styles.statusOption, selectedStatus === "AVAILABLE" && styles.statusOptionActive]}
          onPress={() => setSelectedStatus("AVAILABLE")}
        >
          <View style={[styles.iconBox, { backgroundColor: colors.successBg }]}>
            <PlayCircle size={20} color={colors.success} />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Clinic Open & Accepting Patients</Text>
            <Text style={styles.optionSubtitle}>Live queue active and calling tokens normally</Text>
          </View>
        </TouchableOpacity>

        {/* Short Break */}
        <TouchableOpacity
          style={[styles.statusOption, selectedStatus === "SHORT_BREAK" && styles.statusOptionActive]}
          onPress={() => setSelectedStatus("SHORT_BREAK")}
        >
          <View style={[styles.iconBox, { backgroundColor: colors.warningBg }]}>
            <PauseCircle size={20} color={colors.warning} />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Short Break / Procedure</Text>
            <Text style={styles.optionSubtitle}>Temporarily pause token calling for lunch or surgery</Text>
          </View>
        </TouchableOpacity>

        {/* Clinic Closed */}
        <TouchableOpacity
          style={[styles.statusOption, selectedStatus === "CLINIC_CLOSED" && styles.statusOptionActive]}
          onPress={() => setSelectedStatus("CLINIC_CLOSED")}
        >
          <View style={[styles.iconBox, { backgroundColor: colors.offlineBg }]}>
            <XCircle size={20} color={colors.offline} />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Close Clinic for Today</Text>
            <Text style={styles.optionSubtitle}>Hours ended; stop accepting new walk-ins and bookings</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Short Break Parameters */}
      {selectedStatus === "SHORT_BREAK" && (
        <View style={styles.subConfig}>
          <Text style={styles.subLabel}>Break Duration (Minutes)</Text>
          <View style={styles.durationRow}>
            {["15", "30", "45", "60"].map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.durationBtn, duration === d && styles.durationBtnActive]}
                onPress={() => setDuration(d)}
              >
                <Text style={[styles.durationText, duration === d && styles.durationTextActive]}>
                  {d}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Break Reason (Optional)"
            placeholder="e.g. Lunch break, Minor procedure"
            value={reason}
            onChangeText={setReason}
          />
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  optionList: {
    gap: 10,
    marginBottom: 16,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
  },
  statusOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    ...typography.titleSmall,
    fontSize: 14,
    color: colors.textPrimary,
  },
  optionSubtitle: {
    ...typography.bodySmall,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  subConfig: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  subLabel: {
    ...typography.bodySmall,
    color: colors.navy,
    fontWeight: "700",
    marginBottom: 8,
  },
  durationRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  durationBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.navyBorder,
    backgroundColor: colors.surface,
  },
  durationBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  durationText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.navy,
  },
  durationTextActive: {
    color: colors.primary,
  },
});
