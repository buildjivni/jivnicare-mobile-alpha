import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { colors, typography } from "../../theme";

export interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = "md",
  showText = true,
}) => {
  const iconSize = size === "sm" ? 28 : size === "lg" ? 44 : 36;

  return (
    <View style={styles.container}>
      {/* Official JivniCare Geometric Plus/Cross Healthcare Icon */}
      <Svg width={iconSize} height={iconSize} viewBox="0 0 48 48" fill="none">
        <Defs>
          <LinearGradient id="jivniGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#5696C7" />
            <Stop offset="100%" stopColor="#4B9F5F" />
          </LinearGradient>
        </Defs>
        <Circle cx="24" cy="24" r="22" fill="#F0F9FF" stroke="#5696C7" strokeWidth="2.5" />
        {/* Stylized Cross */}
        <Path
          d="M24 12V36M12 24H36"
          stroke="url(#jivniGrad)"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </Svg>

      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.brandName, size === "lg" && styles.brandNameLg]}>
            Jivni<Text style={{ color: colors.secondary }}>Care</Text>
          </Text>
          <Text style={styles.doctorBadge}>PARTNER</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    marginLeft: 10,
  },
  brandName: {
    ...typography.titleMedium,
    color: colors.primary,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  brandNameLg: {
    ...typography.display,
    fontSize: 28,
  },
  doctorBadge: {
    ...typography.caption,
    fontSize: 9,
    letterSpacing: 1.2,
    color: colors.navyMuted,
    fontWeight: "800",
    marginTop: -2,
  },
});
