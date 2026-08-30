import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import { colors, typography, radius, shadows } from "../../theme";

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  iconPosition = "left",
  style,
  textStyle,
}) => {
  const getContainerStyle = (): ViewStyle[] => {
    const base: ViewStyle = {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: size === "lg" ? radius.xl : radius.md,
      paddingHorizontal: size === "sm" ? 12 : size === "lg" ? 24 : 16,
      height: size === "sm" ? 36 : size === "lg" ? 54 : 46,
      opacity: disabled || loading ? 0.6 : 1,
    };

    switch (variant) {
      case "primary":
        return [base, { backgroundColor: colors.primary }, shadows.button, style || {}];
      case "secondary":
        return [base, { backgroundColor: colors.secondary }, shadows.button, style || {}];
      case "outline":
        return [
          base,
          {
            backgroundColor: colors.surface,
            borderWidth: 1.5,
            borderColor: colors.navyBorder,
          },
          style || {},
        ];
      case "ghost":
        return [base, { backgroundColor: "transparent" }, style || {}];
      case "destructive":
        return [base, { backgroundColor: colors.destructive }, shadows.soft, style || {}];
      default:
        return [base, style || {}];
    }
  };

  const getTextStyle = (): TextStyle[] => {
    const base: TextStyle = {
      ...typography.button,
      fontSize: size === "sm" ? 13 : size === "lg" ? 16 : 14,
    };

    switch (variant) {
      case "primary":
      case "secondary":
      case "destructive":
        return [base, { color: colors.textWhite }, textStyle || {}];
      case "outline":
      case "ghost":
        return [base, { color: colors.navy }, textStyle || {}];
      default:
        return [base, textStyle || {}];
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={getContainerStyle()}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "outline" || variant === "ghost" ? colors.primary : colors.textWhite}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === "left" && <View style={styles.leftIcon}>{icon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
          {icon && iconPosition === "right" && <View style={styles.rightIcon}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});
