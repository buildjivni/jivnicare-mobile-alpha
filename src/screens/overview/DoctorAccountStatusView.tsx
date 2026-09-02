import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from "react-native";
import { colors, typography, radius, shadows } from "../../theme";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { DoctorProfile } from "../../types/doctor";
import {
  Clock,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Ban,
  Building2,
  PhoneCall,
  Mail,
  AlertTriangle,
  ArrowRight,
  LogOut,
  RefreshCw,
} from "lucide-react-native";

export interface DoctorAccountStatusViewProps {
  status: string;
  profile: DoctorProfile | null;
  onEditProfileAndReapply?: () => void;
  onRefreshStatus?: () => void;
  onLogout?: () => void;
}

export const DoctorAccountStatusView: React.FC<DoctorAccountStatusViewProps> = ({
  status,
  profile,
  onEditProfileAndReapply,
  onRefreshStatus,
  onLogout,
}) => {
  const isRejected = status === "REJECTED";
  const isSuspended = status === "SUSPENDED";
  const isPending =
    status === "PENDING_REVIEW" ||
    status === "PENDING_ACTIVATION" ||
    status === "PENDING_VERIFICATION" ||
    status === "PENDING";

  const handleSupportWhatsApp = () => {
    Linking.openURL(
      "https://wa.me/918235351897?text=JivniCare%20Doctor%20Support%20-%20Registration%20" +
        encodeURIComponent(profile?.registrationId || profile?.id || "")
    ).catch(() => {});
  };

  const handleSupportEmail = () => {
    Linking.openURL(
      "mailto:support@jivnicare.com?subject=JivniCare%20Doctor%20Account%20Inquiry%20" +
        encodeURIComponent(profile?.registrationId || profile?.id || "")
    ).catch(() => {});
  };

  // ═════════════════════════════════════════════════════════
  // CASE A: SUSPENDED ACCOUNT
  // ═════════════════════════════════════════════════════════
  if (isSuspended) {
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCenter}>
          <View style={[styles.iconCircleLarge, { backgroundColor: "#FEE2E2" }]}>
            <Ban size={36} color="#DC2626" />
          </View>
          <Text style={styles.heroTitle}>Account Suspended</Text>
          <Text style={styles.heroSub}>
            Your professional doctor account has been temporarily suspended by administrative moderation.
          </Text>
        </View>

        {profile?.verificationNote ? (
          <Card style={[styles.feedbackCard, { borderColor: "#FCA5A5", backgroundColor: "#FEF2F2" }]}>
            <Text style={[styles.feedbackLabel, { color: "#991B1B" }]}>Suspension Reason:</Text>
            <Text style={[styles.feedbackText, { color: "#7F1D1D" }]}>
              "{profile.verificationNote}"
            </Text>
          </Card>
        ) : null}

        <Card style={styles.infoCard}>
          <Text style={styles.cardHeading}>Resolution & Appeals</Text>
          <Text style={styles.cardBody}>
            If you believe this suspension is in error or need to submit compliance documentation, please contact JivniCare Doctor Operations directly.
          </Text>
          <View style={styles.buttonStack}>
            <Button
              title="Contact Support on WhatsApp"
              variant="outline"
              size="lg"
              onPress={handleSupportWhatsApp}
              icon={<PhoneCall size={18} color={colors.primary} />}
            />
            <Button
              title="Email Verification Team"
              variant="outline"
              size="lg"
              onPress={handleSupportEmail}
              icon={<Mail size={18} color={colors.primary} />}
            />
          </View>
        </Card>

        {onLogout && (
          <Button
            title="Log Out"
            variant="ghost"
            size="lg"
            onPress={onLogout}
            icon={<LogOut size={18} color="#64748B" />}
            style={{ marginTop: 12 }}
          />
        )}
      </ScrollView>
    );
  }

  // ═════════════════════════════════════════════════════════
  // CASE B: REJECTED VERIFICATION
  // ═════════════════════════════════════════════════════════
  if (isRejected) {
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCenter}>
          <View style={[styles.iconCircleLarge, { backgroundColor: "#FFE4E6" }]}>
            <ShieldAlert size={36} color="#E11D48" />
          </View>
          <Text style={styles.heroTitle}>Verification Rejected</Text>
          <Text style={styles.heroSub}>
            Your partner registration was not approved. Please review the audit feedback below, update your details, and re-apply.
          </Text>
        </View>

        {profile?.verificationNote ? (
          <Card style={styles.feedbackCard}>
            <Text style={styles.feedbackLabel}>Feedback from Audit Team:</Text>
            <Text style={styles.feedbackText}>"{profile.verificationNote}"</Text>
          </Card>
        ) : null}

        <View style={styles.actionBlock}>
          {onEditProfileAndReapply && (
            <Button
              title="Edit Profile & Re-apply"
              variant="primary"
              size="lg"
              onPress={onEditProfileAndReapply}
              icon={<ArrowRight size={18} color="#FFFFFF" />}
              style={styles.primaryBtn}
            />
          )}

          <TouchableOpacity
            style={styles.supportLink}
            onPress={handleSupportWhatsApp}
            activeOpacity={0.7}
          >
            <PhoneCall size={16} color="#0284C7" />
            <Text style={styles.supportLinkText}>Need Help? Talk to Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ═════════════════════════════════════════════════════════
  // CASE C: PENDING_REVIEW / UNDER REVIEW (Web Parity)
  // ═════════════════════════════════════════════════════════
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Banner */}
      <View style={styles.heroCenter}>
        <View style={[styles.iconCircleLarge, { backgroundColor: "#FEF3C7" }]}>
          <Clock size={36} color="#D97706" />
        </View>
        <Text style={styles.heroTitle}>Application Under Review</Text>
        <Text style={styles.heroSub}>
          Your account is currently under review by our clinical team. Operational features like live queue and token bookings are locked until verification is complete.
        </Text>
      </View>

      {/* 2. 3-Step Visual Progress Stepper */}
      <Card style={styles.stepperCard}>
        <View style={styles.stepperRow}>
          {/* Step 1: Submitted */}
          <View style={styles.stepperStep}>
            <View style={[styles.stepperCircle, styles.stepperCircleDone]}>
              <CheckCircle2 size={16} color="#16A34A" />
            </View>
            <Text style={[styles.stepperLabel, { color: "#16A34A" }]}>Submitted</Text>
          </View>

          {/* Line 1 */}
          <View style={[styles.stepperLine, { backgroundColor: "#16A34A" }]} />

          {/* Step 2: Under Review */}
          <View style={styles.stepperStep}>
            <View style={[styles.stepperCircle, styles.stepperCircleActive]}>
              <Clock size={16} color="#D97706" />
            </View>
            <Text style={[styles.stepperLabel, { color: "#D97706" }]}>Under Review</Text>
          </View>

          {/* Line 2 */}
          <View style={styles.stepperLine} />

          {/* Step 3: Verified */}
          <View style={styles.stepperStep}>
            <View style={styles.stepperCircle}>
              <ShieldCheck size={16} color="#94A3B8" />
            </View>
            <Text style={styles.stepperLabel}>Verified</Text>
          </View>
        </View>
      </Card>

      {/* 3. Registration ID Card */}
      <View style={styles.regIdBox}>
        <View style={{ flex: 1 }}>
          <Text style={styles.regIdLabel}>Registration ID</Text>
          <Text style={styles.regIdValue}>
            {profile?.registrationId || "JVC2026D10001"}
          </Text>
        </View>
        <View style={styles.underReviewBadge}>
          <Clock size={12} color="#B45309" />
          <Text style={styles.underReviewBadgeText}>Under Review</Text>
        </View>
      </View>

      {/* 4. SLA & Assistance Grid */}
      <View style={styles.twoColumnGrid}>
        <Card style={styles.gridCard}>
          <Text style={styles.gridLabel}>Estimated Review Time</Text>
          <Text style={styles.gridTitle}>24–48 Hours</Text>
          <Text style={styles.gridSub}>Average approval duration</Text>
        </Card>
        <Card style={styles.gridCard}>
          <Text style={styles.gridLabel}>Need Assistance?</Text>
          <TouchableOpacity onPress={handleSupportWhatsApp} activeOpacity={0.7}>
            <Text style={styles.gridLink}>WhatsApp: +91 82353 51897</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSupportEmail} activeOpacity={0.7}>
            <Text style={styles.gridLink}>Email: support@jivnicare.com</Text>
          </TouchableOpacity>
        </Card>
      </View>

      {/* 5. Read-Only Submitted Profile Preview */}
      <Card style={styles.previewCard}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewHeading}>Submitted Profile Preview</Text>
          <View style={styles.readOnlyBadge}>
            <Text style={styles.readOnlyBadgeText}>Read-Only</Text>
          </View>
        </View>

        <View style={styles.readOnlyAlert}>
          <AlertTriangle size={15} color="#D97706" />
          <Text style={styles.readOnlyAlertText}>
            Operational features (live queue, booking link) unlock once our clinical board approves your credentials.
          </Text>
        </View>

        {/* Clinic Cover Image */}
        <View style={styles.clinicCoverBox}>
          {profile?.clinicImage ? (
            <Image source={{ uri: profile.clinicImage }} style={styles.clinicCoverImage} />
          ) : (
            <View style={styles.noPhotoBox}>
              <Building2 size={28} color="#94A3B8" />
              <Text style={styles.noPhotoText}>No clinic photo uploaded</Text>
            </View>
          )}
        </View>

        {/* Doctor Avatar & Identity */}
        <View style={styles.doctorIdentityRow}>
          {profile?.profileImage ? (
            <Image source={{ uri: profile.profileImage }} style={styles.doctorAvatar} />
          ) : (
            <View style={styles.doctorAvatarFallback}>
              <Text style={styles.doctorAvatarText}>DR</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.previewDoctorName}>
              {profile?.name ? `Dr. ${profile.name.replace(/^Dr\.?\s*/i, "")}` : "Dr. Partner"}
            </Text>
            <Text style={styles.previewDoctorSub}>
              {profile?.qualifications || "MBBS"} • {profile?.specialty || "General Physician"}
            </Text>
          </View>
        </View>

        {/* Clinical Details 2x2 Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailsCell}>
            <Text style={styles.detailsLabel}>Clinic Name</Text>
            <Text style={styles.detailsValue}>{profile?.hospitalName || "Not set"}</Text>
          </View>
          <View style={styles.detailsCell}>
            <Text style={styles.detailsLabel}>Full Address</Text>
            <Text style={styles.detailsValue}>
              {[profile?.address, profile?.city, profile?.district].filter(Boolean).join(", ") +
                (profile?.pincode ? ` - ${profile.pincode}` : "") || "Not set"}
            </Text>
          </View>
          <View style={styles.detailsCell}>
            <Text style={styles.detailsLabel}>Registration Info</Text>
            <Text style={styles.detailsValue}>
              {profile?.regNumber || "Pending"} ({profile?.medicalCouncil || "Council not set"})
            </Text>
          </View>
          <View style={styles.detailsCell}>
            <Text style={styles.detailsLabel}>Experience & Fee</Text>
            <Text style={styles.detailsValue}>
              {profile?.experience || "0"} Yrs Exp • ₹{profile?.consultationFee || "400"} Fee
            </Text>
          </View>
        </View>
      </Card>

      {/* Refresh Status Action */}
      {onRefreshStatus && (
        <TouchableOpacity
          style={styles.refreshStatusBtn}
          onPress={onRefreshStatus}
          activeOpacity={0.8}
        >
          <RefreshCw size={16} color={colors.primary} />
          <Text style={styles.refreshStatusBtnText}>Check Approval Status</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  heroCenter: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircleLarge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  stepperCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
    borderColor: "#E2E8F0",
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepperStep: {
    alignItems: "center",
    width: 76,
  },
  stepperCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    borderColor: "#CBD5E1",
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  stepperCircleDone: {
    backgroundColor: "#DCFCE7",
    borderColor: "#16A34A",
  },
  stepperCircleActive: {
    backgroundColor: "#FEF3C7",
    borderColor: "#D97706",
  },
  stepperLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  stepperLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E2E8F0",
    marginBottom: 20,
  },
  regIdBox: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  regIdLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  regIdValue: {
    fontSize: 16,
    fontWeight: "900",
    fontFamily: "monospace",
    color: "#0F172A",
  },
  underReviewBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  underReviewBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#B45309",
  },
  twoColumnGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  gridCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderColor: "#E2E8F0",
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  gridSub: {
    fontSize: 11,
    fontWeight: "500",
    color: "#94A3B8",
  },
  gridLink: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 2,
  },
  previewCard: {
    padding: 16,
    borderRadius: 20,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  previewHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  readOnlyBadge: {
    backgroundColor: "#F1F5F9",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  readOnlyBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
  },
  readOnlyAlert: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  readOnlyAlertText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    color: "#92400E",
    lineHeight: 16,
  },
  clinicCoverBox: {
    width: "100%",
    height: 120,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  clinicCoverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  noPhotoBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  noPhotoText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
  },
  doctorIdentityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  doctorAvatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  doctorAvatarText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  previewDoctorName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },
  previewDoctorSub: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 1,
  },
  detailsGrid: {
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 12,
  },
  detailsCell: {
    gap: 1,
  },
  detailsLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
  },
  detailsValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  refreshStatusBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
  },
  refreshStatusBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  feedbackCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFF1F2",
    borderColor: "#FECDD3",
    marginBottom: 20,
  },
  feedbackLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#9F1239",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#881337",
    fontStyle: "italic",
    lineHeight: 18,
  },
  actionBlock: {
    gap: 12,
  },
  primaryBtn: {
    borderRadius: 14,
    ...shadows.button,
  },
  supportLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  supportLinkText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0284C7",
  },
  infoCard: {
    padding: 16,
    borderRadius: 16,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 14,
  },
  buttonStack: {
    gap: 10,
  },
});
