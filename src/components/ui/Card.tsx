import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { colors, radius, shadows } from "../../theme";

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: "default" | "elevated" | "flat" | "accent";
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = "default",
}) => {
  const getBaseStyle = (): ViewStyle => {
    const base: ViewStyle = {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    };

    switch (variant) {
      case "elevated":
        return { ...base, ...shadows.card };
      case "flat":
        return { ...base, borderWidth: 0, backgroundColor: colors.mutedBackground };
      case "accent":
        return {
          ...base,
          backgroundColor: colors.accent,
          borderColor: "rgba(86, 150, 199, 0.2)",
        };
      case "default":
      default:
        return { ...base, ...shadows.soft };
    }
  };

  return <View style={[getBaseStyle(), style]}>{children}</View>;
};
