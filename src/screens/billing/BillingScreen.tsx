import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { ScreenContainer } from "../../components/layout/ScreenContainer";
import { colors, typography, radius, shadows } from "../../theme";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import {
  ShieldCheck,
  Wallet,
  Clock,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from "lucide-react-native";

export const BillingScreen: React.FC = () => {
  const { profile } = useWorkspaceStore();

  const pricing = profile?.platformPricing;
  const monthlyFee = pricing?.monthlyFee ?? 2999;
  const discountPercent = pricing?.discountPercent ?? 100;
  const partnerTier = pricing?.partnerTier ?? "EARLY_PARTNER";
  const isWaived = discountPercent >= 100;
  const payable = Math.max(0, Math.round(monthlyFee * (1 - discountPercent / 100)));

  const tierLabel = partnerTier.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const handleSupportClick = () => {
    Linking.openURL("https://wa.me/918235351897?text=JivniCare%20Partner%20Billing%20Support");
  };

  return (
    <ScreenContainer style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Partner Subscription</Text>
          <Text style={styles.subtitle}>Manage platform tier, pricing and partnership benefits</Text>
        </View>

        {/* Active Plan Card */}
        <Card style={styles.mainBillingCard}>
          <View style={styles.tierHeader}>
            <View style={styles.tierIconBox}>
              <ShieldCheck size={22} color={colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tierTitle}>{tierLabel}</Text>
              <Text style={styles.tierStatus}>
                {isWaived ? "Waived Platform Subscription Active" : "Active Subscription"}
              </Text>
            </View>
            <Badge label="Active Plan" variant="success" size="sm" />
          </View>

          {/* Pricing Row */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Monthly Platform Subscription</Text>
            <View style={styles.priceRow}>
              <Text style={styles.payablePrice}>₹{payable.toLocaleString("en-IN")}</Text>
              {discountPercent > 0 && (
                <Text style={styles.strikeThroughPrice}>₹{monthlyFee.toLocaleString("en-IN")}</Text>
              )}
              {isWaived && <Badge label="100% OFF" variant="success" size="sm" />}
            </View>
            <Text style={styles.renewalText}>
              {isWaived ? "Complimentary early partner benefit active through 2026." : "Billed monthly."}
            </Text>
          </View>

          {/* Benefits Checklist */}
          <View style={styles.benefitList}>
            {[
              "Real-time OPD dynamic queue calling",
              "Instant walk-in patient token issuance",
              "Verified Doctor profile listed on JivniCare network",
              "Unlimited receptionist and clinic staff accounts",
              "Patient history archive & consultation reports",
              "Dedicated Priority WhatsApp Partner Support",
            ].map((benefit, idx) => (
              <View key={idx} style={styles.benefitRow}>
                <CheckCircle2 size={16} color={colors.secondary} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Support Card */}
        <Card style={styles.supportCard}>
          <View style={styles.supportHeader}>
            <HelpCircle size={18} color={colors.primary} />
            <Text style={styles.supportTitle}>Questions about your plan?</Text>
          </View>
          <Text style={styles.supportSub}>
            Reach out to our dedicated clinical operations desk for customized clinic requirements.
          </Text>
          <Button
            title="Chat with Partner Support"
            variant="outline"
            size="md"
            onPress={handleSupportClick}
            style={{ marginTop: 12 }}
          />
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    ...typography.titleMedium,
    color: colors.navy,
  },
  subtitle: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: "none",
  },
  mainBillingCard: {
    padding: 18,
    borderRadius: radius.xl,
    marginBottom: 16,
  },
  tierHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  tierIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.secondaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  tierTitle: {
    ...typography.titleSmall,
    fontSize: 16,
    color: colors.textPrimary,
  },
  tierStatus: {
    ...typography.caption,
    fontSize: 11,
    color: colors.secondary,
    fontWeight: "700",
    textTransform: "none",
  },
  priceContainer: {
    marginBottom: 18,
  },
  priceLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "700",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  payablePrice: {
    ...typography.display,
    fontSize: 28,
    color: colors.textPrimary,
  },
  strikeThroughPrice: {
    ...typography.titleSmall,
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
  renewalText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontSize: 12,
  },
  benefitList: {
    gap: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  benefitText: {
    ...typography.bodySmall,
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },
  supportCard: {
    padding: 16,
  },
  supportHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  supportTitle: {
    ...typography.titleSmall,
    fontSize: 14,
    color: colors.navy,
  },
  supportSub: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
});
