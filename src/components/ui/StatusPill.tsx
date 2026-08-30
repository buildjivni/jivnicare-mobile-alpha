import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, typography, radius } from "../../theme";
import { ClinicAvailabilityStatus } from "../../types/doctor";

export interface StatusPillProps {
  status: ClinicAvailabilityStatus;
  onPress?: () => void;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, onPress }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "AVAILABLE":
        return {
          label: "Clinic Open",
          dotColor: colors.success,
          bg: colors.successBg,
          border: colors.successBorder,
          textColor: colors.success,
        };
      case "SHORT_BREAK":
        return {
          label: "On Break",
          dotColor: colors.warning,
          bg: colors.warningBg,
          border: colors.warningBorder,
          textColor: colors.warning,
        };
      case "EMERGENCY_ONLY":
        return {
          label: "Emergency Only",
          dotColor: colors.destructive,
          bg: colors.destructiveBg,
          border: colors.destructiveBorder,
          textColor: colors.destructive,
        };
      case "CLINIC_CLOSED":
      default:
        return {
          label: "Clinic Closed",
          dotColor: colors.offline,
          bg: colors.offlineBg,
          border: colors.offlineBorder,
          textColor: colors.offline,
        };
    }
  };

  const config = getStatusConfig();

  const content = (
    <View
      style={[
        styles.pill,
        { backgroundColor: config.bg, borderColor: config.border },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.dotColor }]} />
      <Text style={[styles.label, { color: config.textColor }]}>{config.label}</Text>
    </View>
  );

  if (onPress) {
    return <TouchableOpacity activeOpacity={0.8} onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  label: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "800",
  },
});
