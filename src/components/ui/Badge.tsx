import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { colors, typography, radius } from "../../theme";

export interface BadgeProps {
  label: string;
  variant?: "success" | "warning" | "destructive" | "primary" | "secondary" | "neutral" | "accent";
  size?: "sm" | "md";
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "primary",
  size = "md",
  icon,
  style,
}) => {
  const getBadgeStyle = (): ViewStyle => {
    switch (variant) {
      case "success":
        return { backgroundColor: colors.successBg, borderColor: colors.successBorder };
      case "warning":
        return { backgroundColor: colors.warningBg, borderColor: colors.warningBorder };
      case "destructive":
        return { backgroundColor: colors.destructiveBg, borderColor: colors.destructiveBorder };
      case "secondary":
        return { backgroundColor: colors.secondaryLight, borderColor: "rgba(75, 159, 95, 0.2)" };
      case "accent":
        return { backgroundColor: colors.accent, borderColor: "rgba(86, 150, 199, 0.3)" };
      case "neutral":
        return { backgroundColor: colors.offlineBg, borderColor: colors.offlineBorder };
      case "primary":
      default:
        return { backgroundColor: colors.primaryLight, borderColor: "rgba(86, 150, 199, 0.3)" };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case "success":
        return { color: colors.success };
      case "warning":
        return { color: colors.warning };
      case "destructive":
        return { color: colors.destructive };
      case "secondary":
        return { color: colors.secondary };
      case "neutral":
        return { color: colors.offline };
      case "accent":
      case "primary":
      default:
        return { color: colors.primary };
    }
  };

  return (
    <View
      style={[
        styles.badge,
        getBadgeStyle(),
        size === "sm" ? styles.badgeSm : styles.badgeMd,
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.text, getTextStyle(), size === "sm" && styles.textSm]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.full,
    borderWidth: 1,
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeMd: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    ...typography.caption,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  textSm: {
    fontSize: 9,
  },
});
