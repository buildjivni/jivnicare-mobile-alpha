import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, typography, radius } from "../../../theme";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { CalendarX, AlertTriangle, ShieldAlert } from "lucide-react-native";

export interface HolidayOverrideModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (active: boolean, reason: string, mode: "soft" | "hard") => Promise<void>;
}

export const HolidayOverrideModal: React.FC<HolidayOverrideModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [mode, setMode] = useState<"soft" | "hard">("soft");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (active: boolean) => {
    setIsLoading(true);
    try {
      await onSubmit(active, reason, mode);
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
      title="Clinic Holiday & Closure"
      subtitle="Manage temporary emergency closure or holiday off."
      footer={
        <View style={{ gap: 8, width: "100%" }}>
          <Button
            title={mode === "hard" ? "Close Clinic & Cancel Tokens" : "Pause New Bookings"}
            variant="destructive"
            size="lg"
            onPress={() => handleSubmit(true)}
            loading={isLoading}
            style={{ width: "100%" }}
          />
          <Button
            title="Reopen Normal OPD"
            variant="outline"
            size="md"
            onPress={() => handleSubmit(false)}
            loading={isLoading}
            style={{ width: "100%" }}
          />
        </View>
      }
    >
      {/* Mode Selector */}
      <View style={styles.modeContainer}>
        <TouchableOpacity
          style={[styles.modeCard, mode === "soft" && styles.modeCardActive]}
          onPress={() => setMode("soft")}
        >
          <View style={styles.modeHeader}>
            <CalendarX size={18} color={mode === "soft" ? colors.primary : colors.navy} />
            <Text style={[styles.modeTitle, mode === "soft" && { color: colors.primary }]}>
              Soft Closure
            </Text>
          </View>
          <Text style={styles.modeDescription}>
            Stop accepting new online bookings, but keep serving patients already registered in today's waiting line.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeCard, mode === "hard" && styles.modeCardHardActive]}
          onPress={() => setMode("hard")}
        >
          <View style={styles.modeHeader}>
            <ShieldAlert size={18} color={mode === "hard" ? colors.destructive : colors.navy} />
            <Text style={[styles.modeTitle, mode === "hard" && { color: colors.destructive }]}>
              Emergency / Hard Closure
            </Text>
          </View>
          <Text style={styles.modeDescription}>
            Immediately close OPD and cancel all waiting tokens with automated SMS notification.
          </Text>
        </TouchableOpacity>
      </View>

      <Input
        label="Closure Reason (Shown to Patients)"
        placeholder="e.g. Doctor attending medical conference, Clinic maintenance"
        value={reason}
        onChangeText={setReason}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modeContainer: {
    gap: 10,
    marginBottom: 16,
  },
  modeCard: {
    padding: 14,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
  },
  modeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },
  modeCardHardActive: {
    borderColor: colors.destructive,
    backgroundColor: colors.destructiveBg,
  },
  modeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  modeTitle: {
    ...typography.titleSmall,
    fontSize: 14,
    color: colors.textPrimary,
  },
  modeDescription: {
    ...typography.bodySmall,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
});
