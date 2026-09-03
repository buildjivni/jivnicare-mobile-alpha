import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { fontFamilies, typography } from "../../theme/typography";
import { ShieldCheck } from "lucide-react-native";

interface AppFooterBrandingProps {
  style?: object;
}

export const AppFooterBranding: React.FC<AppFooterBrandingProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.brandRow}>
        <ShieldCheck size={13} color={colors.primary} />
        <Text style={styles.brandText}>JIVNICARE HEALTHCARE NETWORK</Text>
      </View>
      <Text style={styles.subText}>
        Doctor Workspace • v1.0.0 (Pilot) • NMC Registered Partner
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  brandText: {
    fontFamily: fontFamilies.heading,
    fontWeight: "800",
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.textSecondary,
    textTransform: "uppercase",
  },
  subText: {
    fontFamily: fontFamilies.body,
    fontSize: 10,
    color: colors.textMuted,
  },
});
