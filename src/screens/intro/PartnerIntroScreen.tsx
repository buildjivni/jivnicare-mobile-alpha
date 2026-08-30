import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { colors, typography, radius, shadows } from "../../theme";
import { BrandLogo } from "../../components/shared/BrandLogo";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import {
  ShieldCheck,
  Users,
  Clock,
  ArrowRight,
  Stethoscope,
  Activity,
  Award,
  CalendarCheck,
  CheckCircle2,
  Lock,
  Building2,
  Sparkles,
} from "lucide-react-native";

export interface PartnerIntroScreenProps {
  onJoinNetwork: () => void;
  onSignIn: () => void;
}

export const PartnerIntroScreen: React.FC<PartnerIntroScreenProps> = ({
  onJoinNetwork,
  onSignIn,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <BrandLogo size="md" />
        <TouchableOpacity
          style={styles.signInHeaderBtn}
          onPress={onSignIn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.signInHeaderText}>Sign In</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Pulsing Clinical Trust Badge */}
        <View style={styles.trustBadgeContainer}>
          <View style={styles.trustBadge}>
            <View style={styles.pingDot} />
            <Text style={styles.trustBadgeText}>
              VERIFIED CLINICAL INFRASTRUCTURE NETWORK
            </Text>
          </View>
        </View>

        {/* Hero Title & Positioning */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            A Modern Platform{"\n"}
            for <Text style={{ color: colors.primary }}>Trusted Doctors.</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Modernize your waiting rooms, streamline dynamic OPD flows, and publish verified clinical profiles designed to optimize patient trust.
          </Text>
        </View>

        {/* 3 Core Value Proposition Cards */}
        <View style={styles.featureList}>
          {/* 1. OPD Queue Management */}
          <Card style={styles.featureCard} variant="elevated">
            <View style={styles.featureIconBox}>
              <Users size={22} color={colors.primary} />
            </View>
            <View style={styles.featureTextBox}>
              <Text style={styles.featureTitle}>Dynamic OPD Live Queue</Text>
              <Text style={styles.featureDescription}>
                Eliminate waiting room chaos. 1-tap patient calling, estimated wait times, emergency priority bypass, and instant walk-in token issuance.
              </Text>
            </View>
          </Card>

          {/* 2. Verified Clinical Credibility */}
          <Card style={styles.featureCard} variant="elevated">
            <View style={[styles.featureIconBox, { backgroundColor: colors.secondaryLight }]}>
              <ShieldCheck size={22} color={colors.secondary} />
            </View>
            <View style={styles.featureTextBox}>
              <Text style={styles.featureTitle}>NMC Verified Profile</Text>
              <Text style={styles.featureDescription}>
                Build instant patient trust with verified medical credentials, Google Maps clinic location, and direct WhatsApp appointment sharing.
              </Text>
            </View>
          </Card>

          {/* 3. Receptionist & Staff Delegation */}
          <Card style={styles.featureCard} variant="elevated">
            <View style={[styles.featureIconBox, { backgroundColor: colors.accent }]}>
              <Building2 size={22} color={colors.navy} />
            </View>
            <View style={styles.featureTextBox}>
              <Text style={styles.featureTitle}>Reception & Staff Delegation</Text>
              <Text style={styles.featureDescription}>
                Authorize assistants and clinic operators to manage walk-ins and collect consultation payments without accessing private doctor data.
              </Text>
            </View>
          </Card>

          {/* 4. Consultation History & Export */}
          <Card style={styles.featureCard} variant="elevated">
            <View style={[styles.featureIconBox, { backgroundColor: colors.primaryLight }]}>
              <CalendarCheck size={22} color={colors.primary} />
            </View>
            <View style={styles.featureTextBox}>
              <Text style={styles.featureTitle}>Zero-Paper Patient Archive</Text>
              <Text style={styles.featureDescription}>
                Complete past consultation timeline, repeat patient visit counts, daily revenue trends, and 1-tap CSV export.
              </Text>
            </View>
          </Card>
        </View>

        {/* Clinical Network Metrics Bar */}
        <View style={styles.metricsBox}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>5,000+</Text>
            <Text style={styles.metricLabel}>Patients Served</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: colors.secondary }]}>100%</Text>
            <Text style={styles.metricLabel}>Verified Doctors</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>0 min</Text>
            <Text style={styles.metricLabel}>Crowded Queues</Text>
          </View>
        </View>

        {/* Security & Regulatory Assurance */}
        <View style={styles.assuranceCard}>
          <Lock size={16} color={colors.secondary} />
          <Text style={styles.assuranceText}>
            Protected by 256-bit encryption & strict patient data privacy compliance.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={styles.bottomBar}>
        <Button
          title="Join Partner Network"
          variant="primary"
          size="lg"
          onPress={onJoinNetwork}
          icon={<ArrowRight size={18} color="#FFFFFF" />}
          iconPosition="right"
          style={styles.primaryButton}
        />
        <Button
          title="Doctor Sign In"
          variant="outline"
          size="md"
          onPress={onSignIn}
          style={styles.secondaryButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.surface,
  },
  signInHeaderBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
  },
  signInHeaderText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primary,
    fontWeight: "800",
    textTransform: "none",
  },
  container: {
    flex: 1,
    backgroundColor: colors.mutedBackground,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  trustBadgeContainer: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: "rgba(86, 150, 199, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  pingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  trustBadgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.primary,
    fontWeight: "900",
  },
  heroSection: {
    marginBottom: 24,
  },
  heroTitle: {
    ...typography.display,
    color: colors.navy,
    marginBottom: 10,
  },
  heroSubtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  featureList: {
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(27, 63, 107, 0.08)",
  },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  featureTextBox: {
    flex: 1,
  },
  featureTitle: {
    ...typography.titleSmall,
    color: colors.navy,
    marginBottom: 4,
  },
  featureDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  metricsBox: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 16,
    ...shadows.soft,
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricValue: {
    ...typography.titleSmall,
    color: colors.navy,
    fontWeight: "900",
  },
  metricLabel: {
    ...typography.caption,
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.cardBorder,
  },
  assuranceCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.secondaryLight,
    borderRadius: radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(75, 159, 95, 0.2)",
  },
  assuranceText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.secondary,
    textTransform: "none",
    fontWeight: "700",
  },
  bottomBar: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    gap: 10,
    ...shadows.card,
  },
  primaryButton: {
    width: "100%",
  },
  secondaryButton: {
    width: "100%",
  },
});
