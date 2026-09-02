import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
} from "react-native";
import { ScreenContainer } from "../../components/layout/ScreenContainer";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { colors, typography, radius, shadows } from "../../theme";
import {
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  PhoneCall,
  Activity,
} from "lucide-react-native";

export interface OnboardSuccessReceiptScreenProps {
  registrationId?: string;
  fullName: string;
  medicalRegistrationNumber: string;
  medicalCouncil: string;
  speciality: string;
  practiceName: string;
  city: string;
  district: string;
  onGoToDashboard: () => void;
  onReturnHome?: () => void;
}

export const OnboardSuccessReceiptScreen: React.FC<OnboardSuccessReceiptScreenProps> = ({
  registrationId = "JVC2026D10001",
  fullName,
  medicalRegistrationNumber,
  medicalCouncil,
  speciality,
  practiceName,
  city,
  district,
  onGoToDashboard,
  onReturnHome,
}) => {
  const handleSupportWhatsApp = async () => {
    const message = encodeURIComponent(
      `JivniCare Doctor Support - Registration ${registrationId}`
    );
    const nativeUrl = `whatsapp://send?phone=918235351897&text=${message}`;
    const webUrl = `https://wa.me/918235351897?text=${message}`;

    try {
      const canOpen = await Linking.canOpenURL(nativeUrl);
      if (canOpen) {
        await Linking.openURL(nativeUrl);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch {
      Linking.openURL(webUrl).catch(() => {});
    }
  };

  return (
    <ScreenContainer style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Hero Checkmark */}
        <View style={styles.heroSection}>
          <View style={styles.successIconOuter}>
            <View style={styles.successIconInner}>
              <CheckCircle2 size={36} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.heroTitle}>Digital Clinic Registered!</Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>
              Registration submitted. Admin will verify within 24–48 hours.
            </Text>
          </View>
        </View>

        {/* Application Summary Receipt Card */}
        <Card style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <View style={styles.receiptIconBadge}>
              <FileText size={18} color="#0284C7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.receiptHeaderTitle}>Application Summary</Text>
              <Text style={styles.receiptHeaderSub}>
                B2B Partner Verification Receipt
              </Text>
            </View>
            <View style={styles.verifyingChip}>
              <Text style={styles.verifyingChipText}>⏳ Verifying</Text>
            </View>
          </View>

          <View style={styles.receiptBody}>
            {/* 1. Registration ID */}
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Registration ID</Text>
              <Text style={[styles.receiptValue, styles.receiptMonoValue]}>
                {registrationId}
              </Text>
            </View>

            {/* 2. Doctor Partner */}
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Doctor Partner</Text>
              <Text style={[styles.receiptValue, { fontWeight: "700" }]}>
                {fullName || "Dr. Partner"}
              </Text>
            </View>

            {/* 3. Registration Number & Council */}
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Registration</Text>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.receiptValue}>
                  {medicalRegistrationNumber || "Pending"} ({medicalCouncil || "NMC"})
                </Text>
                <View style={styles.pendingMiniChip}>
                  <Text style={styles.pendingMiniChipText}>Pending Verification</Text>
                </View>
              </View>
            </View>

            {/* 4. Specialty */}
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Specialty</Text>
              <Text style={styles.receiptValue}>{speciality || "General Physician"}</Text>
            </View>

            {/* 5. Clinic Name */}
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Clinic Name</Text>
              <Text style={styles.receiptValue}>{practiceName || "JivniCare Clinic"}</Text>
            </View>

            {/* 6. Location */}
            <View style={[styles.receiptRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.receiptLabel}>Location</Text>
              <Text style={styles.receiptValue}>
                {[city, district].filter(Boolean).join(", ") || "India"}
              </Text>
            </View>
          </View>
        </Card>

        {/* Verification Timeline Card */}
        <Card style={styles.timelineCard}>
          <View style={styles.timelineHeader}>
            <Activity size={18} color="#0284C7" />
            <Text style={styles.timelineHeaderTitle}>Verification Steps</Text>
          </View>

          <View style={styles.timelineContainer}>
            {/* Step 1 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconCompleted}>
                <CheckCircle2 size={16} color="#FFFFFF" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Application Received</Text>
                <Text style={styles.timelineSub}>
                  Details submitted to JivniCare registry.
                </Text>
              </View>
            </View>

            {/* Connecting line */}
            <View style={styles.timelineLine} />

            {/* Step 2 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconActive}>
                <Clock size={16} color="#0284C7" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>JivniCare Clinical Audit</Text>
                <Text style={styles.timelineSub}>
                  Team reviews registration for live platform activation.
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Button
            title="Go to Doctor Dashboard"
            variant="primary"
            size="lg"
            onPress={onGoToDashboard}
            icon={<ArrowRight size={18} color="#FFFFFF" />}
            style={styles.primaryBtn}
          />

          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleSupportWhatsApp}
            activeOpacity={0.8}
          >
            <PhoneCall size={18} color="#0284C7" />
            <Text style={styles.supportButtonText}>
              Need Assistance? Contact Support (WhatsApp)
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  successIconOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successIconInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.soft,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  heroBadge: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  heroBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#166534",
    textAlign: "center",
  },
  receiptCard: {
    marginBottom: 16,
    padding: 0,
    overflow: "hidden",
    borderRadius: 20,
    borderColor: "#E2E8F0",
  },
  receiptHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  receiptIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  receiptHeaderTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  receiptHeaderSub: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  verifyingChip: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verifyingChipText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#B45309",
    textTransform: "uppercase",
  },
  receiptBody: {
    padding: 16,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  receiptLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  receiptValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    textAlign: "right",
  },
  receiptMonoValue: {
    fontFamily: "monospace",
    fontWeight: "800",
    color: colors.primary,
  },
  pendingMiniChip: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FCD34D",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  pendingMiniChipText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#B45309",
  },
  timelineCard: {
    marginBottom: 24,
    padding: 18,
    borderRadius: 20,
    borderColor: "#E2E8F0",
  },
  timelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  timelineHeaderTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  timelineIconCompleted: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  timelineIconActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E0F2FE",
    borderColor: "#0284C7",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: "#E2E8F0",
    marginLeft: 13,
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  timelineSub: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 2,
  },
  actionSection: {
    gap: 12,
  },
  primaryBtn: {
    borderRadius: 14,
    ...shadows.button,
  },
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  supportButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0284C7",
  },
});
