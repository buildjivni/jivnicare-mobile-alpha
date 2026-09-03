import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { colors, typography, fontFamilies } from "../../theme";
import { X, Scale, ShieldCheck, ShieldAlert, Sparkles, PhoneCall } from "lucide-react-native";

export type LegalDocType = "TERMS" | "PRIVACY" | "DISCLAIMER";

interface LegalViewerModalProps {
  visible: boolean;
  initialDoc?: LegalDocType;
  onClose: () => void;
}

export const LegalViewerModal: React.FC<LegalViewerModalProps> = ({
  visible,
  initialDoc = "TERMS",
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<LegalDocType>(initialDoc);

  React.useEffect(() => {
    if (visible) {
      setActiveTab(initialDoc);
    }
  }, [visible, initialDoc]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Modal Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Scale size={20} color={colors.primary} />
            <Text style={styles.headerTitle}>Legal &amp; Compliance</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === "TERMS" && styles.tabItemActive]}
            onPress={() => setActiveTab("TERMS")}
          >
            <Text style={[styles.tabText, activeTab === "TERMS" && styles.tabTextActive]}>
              Terms of Service
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === "PRIVACY" && styles.tabItemActive]}
            onPress={() => setActiveTab("PRIVACY")}
          >
            <Text style={[styles.tabText, activeTab === "PRIVACY" && styles.tabTextActive]}>
              Privacy Policy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === "DISCLAIMER" && styles.tabItemActive]}
            onPress={() => setActiveTab("DISCLAIMER")}
          >
            <Text style={[styles.tabText, activeTab === "DISCLAIMER" && styles.tabTextActive]}>
              Disclaimer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Body */}
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* TERMS OF SERVICE */}
          {activeTab === "TERMS" && (
            <View>
              <Text style={styles.docTitle}>Terms of Service &amp; Partner Agreement</Text>
              <Text style={styles.docMeta}>Last updated: September 2026 • Early Pilot &amp; Beta Operations Phase</Text>

              {/* Plain-Language Summary */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={styles.summaryTitle}>Plain-Language Summary</Text>
                </View>
                <Text style={styles.summaryText}>
                  JivniCare is a digital queue-management tool that helps patients and clinics organize appointments smoothly. We are not a hospital or healthcare provider, and we do not interfere with medical decisions. Doctors practice independently and are responsible for their own clinical care.
                </Text>
              </View>

              <View style={styles.sectionBox}>
                <Text style={styles.sectionHeader}>1. About JivniCare &amp; Operating Capacity</Text>
                <Text style={styles.paragraph}>
                  JivniCare ("the Platform", "we", "us", "our") is a digital technology platform developed to provide outpatient (OPD) queue coordination, token scheduling, and doctor discovery tools. JivniCare is currently operating in an early-stage pilot/beta phase ahead of formal corporate incorporation. All platform features, services, and software tools are provided strictly on an "as is" and "as available" basis.
                </Text>

                <Text style={styles.sectionHeader}>2. Nature of Service (Technology Intermediary Only)</Text>
                <Text style={styles.paragraph}>
                  (a) JivniCare is solely an electronic software technology intermediary under Section 79 of the Information Technology Act, 2000. JivniCare is not a hospital, clinic, diagnostic center, or medical service provider.{"\n"}
                  (b) JivniCare does not practice medicine, render clinical opinions, endorse particular treatments, or employ doctors.{"\n"}
                  (c) The contract for clinical consultation and medical care is formed solely and directly between the consulting medical practitioner ("Doctor" or "Partner") and the patient.
                </Text>

                <Text style={styles.sectionHeader}>3. Doctor &amp; Clinic Partner Obligations</Text>
                <Text style={styles.paragraph}>
                  • You are a Registered Medical Practitioner (RMP) possessing valid, authentic, and active medical degrees recognized by the National Medical Commission (NMC) or relevant State Medical Council.{"\n"}
                  • You hold all necessary statutory licenses and registrations required to operate your clinical premises and treat patients.{"\n"}
                  • You shall independently determine your consultation fees, diagnostic decisions, OPD shifts, and patient intake capacities.{"\n"}
                  • You are solely and exclusively responsible for all diagnostic advice, physical examinations, treatment recommendations, prescription generation, and patient communication.{"\n"}
                  • You are solely responsible for actions taken by any staff members, receptionists, or queue operators whom you authorize or invite to your clinic workspace.
                </Text>

                <Text style={styles.sectionHeader}>4. No Guarantee of Patient Volume or Revenue</Text>
                <Text style={styles.paragraph}>
                  JivniCare is a queue management and discovery software tool. JivniCare does NOT guarantee any minimum number of patient bookings, OPD footfall, referral volume, or revenue to any Doctor or Clinic Partner. Patient volume is determined entirely by patient choice, geographical location, specialty demand, and clinic reputation.
                </Text>

                <Text style={styles.sectionHeader}>5. Promotional Pricing &amp; Future Subscription Updates</Text>
                <Text style={styles.paragraph}>
                  (a) Early Partner Access and beta usage may currently be offered at promotional rates or zero subscription fees (₹0).{"\n"}
                  (b) JivniCare reserves the right to introduce or adjust commercial SaaS subscription fees, feature tiers, or service charges in the future.{"\n"}
                  (c) Any future pricing changes will be communicated to Doctors with at least thirty (30) days' advance notice via email or in-app notification. Doctors who do not agree to the updated pricing may terminate their account prior to the effective date without penalty.
                </Text>

                <Text style={styles.sectionHeader}>6. Patient Appointments &amp; Clinic Settlements</Text>
                <Text style={styles.paragraph}>
                  (a) Token generation on JivniCare establishes an estimated queue position; it does not guarantee immediate clinical admission if emergency cases or clinical delays arise at the physical clinic.{"\n"}
                  (b) Unless explicitly integrated via a platform-provided third-party payment gateway, all consultation fees are settled directly between the patient and the clinic at the clinic counter. JivniCare does not collect, hold, or guarantee clinical fees in escrow.
                </Text>

                <Text style={[styles.sectionHeader, { color: "#E11D48" }]}>7. Limitation of Liability</Text>
                <Text style={styles.paragraph}>
                  To the maximum extent permitted by applicable Indian law:{"\n"}
                  (a) JivniCare, its founders, contributors, and technical operators shall NOT be liable for any direct, indirect, incidental, special, punitive, or consequential damages arising out of medical malpractice, misdiagnosis, clinical negligence, diagnostic errors, clinic delays, bodily injury, or death resulting from any consultation arranged through the Platform.{"\n"}
                  (b) JivniCare makes no warranties that software operations will be uninterrupted, error-free, or compatible with every mobile operating system.{"\n"}
                  (c) In any event, the total aggregate liability of JivniCare for any claims, disputes, or damages arising out of software operations shall be strictly capped at a fixed maximum amount of ₹10,000 INR (Ten Thousand Indian Rupees).
                </Text>

                <Text style={styles.sectionHeader}>8. Indemnification</Text>
                <Text style={styles.paragraph}>
                  You (as Doctor or User) agree to defend, indemnify, and hold harmless JivniCare, its founders, developers, affiliates, and representatives from and against any claims, liabilities, damages, losses, penalties, fines, and expenses (including reasonable legal fees) arising out of or related to your clinical practice, medical consultations, diagnostic decisions, prescriptions, staff actions, or regulatory non-compliance.
                </Text>

                <Text style={styles.sectionHeader}>9. Intellectual Property &amp; Content License</Text>
                <Text style={styles.paragraph}>
                  (a) Platform IP: All software code, user interface designs, logos, trademarks, database structures, and platform branding are the exclusive intellectual property of JivniCare.{"\n"}
                  (b) Content License: By submitting your clinic name, profile photograph, biography, and credentials, you grant JivniCare a non-exclusive, royalty-free, worldwide license to display, format, and publish this content on the Platform solely for clinic discovery and booking workflows.
                </Text>

                <Text style={styles.sectionHeader}>10. Account Suspension, Termination &amp; Review</Text>
                <Text style={styles.paragraph}>
                  (a) Immediate Action: We reserve the right to suspend or restrict any account immediately in the event of credential revocation, fraud, patient safety concerns, or terms violation.{"\n"}
                  (b) Right to Review / Appeal: If your account is suspended or terminated, you may submit a formal request for review along with supporting documentation to the Grievance Officer within fourteen (14) days of notice. We will review the submission in good faith within fifteen (15) business days.
                </Text>

                <Text style={styles.sectionHeader}>11. Force Majeure</Text>
                <Text style={styles.paragraph}>
                  Neither party shall be held liable for any failure or delay in performance resulting from causes beyond reasonable control, including but not limited to acts of God, internet service provider failures, telecommunication disruptions, cyberattacks, cloud hosting downtime, power outages, labor strikes, epidemics, government orders, or statutory regulatory amendments.
                </Text>

                <Text style={styles.sectionHeader}>12. Modifications to Terms</Text>
                <Text style={styles.paragraph}>
                  JivniCare reserves the right to modify or replace these Terms at any time. Continued use of the Platform after updates constitutes binding acceptance of the revised Terms.
                </Text>

                <Text style={styles.sectionHeader}>13. Governing Law &amp; Jurisdiction</Text>
                <Text style={styles.paragraph}>
                  These Terms shall be governed by the laws of the Republic of India. Any legal dispute, controversy, or claim shall be subject to the exclusive jurisdiction of the competent courts in Patna, Bihar, India.
                </Text>

                <Text style={styles.sectionHeader}>14. Statutory Grievance Redressal (IT Rules 2021 / DPDP Act 2023)</Text>
                <View style={styles.contactCard}>
                  <Text style={styles.contactCardText}><Text style={{ fontWeight: "700" }}>Grievance &amp; Compliance Officer:</Text> Dharmendra Kumar</Text>
                  <Text style={styles.contactCardText}><Text style={{ fontWeight: "700" }}>Designation:</Text> Interim Grievance &amp; Compliance Officer</Text>
                  <Text style={styles.contactCardText}><Text style={{ fontWeight: "700" }}>Email:</Text> grievance@jivnicare.com / support@jivnicare.com</Text>
                  <Text style={styles.contactCardText}><Text style={{ fontWeight: "700" }}>Helpline:</Text> +91 82353 51897</Text>
                  <Text style={styles.contactCardSub}>Response Commitment: Acknowledgment within 24 hours; resolution within 15 business days.</Text>
                </View>
              </View>
            </View>
          )}

          {/* PRIVACY POLICY */}
          {activeTab === "PRIVACY" && (
            <View>
              <Text style={styles.docTitle}>Privacy &amp; Data Handling Policy</Text>
              <Text style={styles.docMeta}>Last updated: September 2026 • Early Pilot &amp; Beta Operations Phase</Text>

              {/* Plain-Language Summary */}
              <View style={[styles.summaryCard, { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" }]}>
                <View style={styles.summaryHeader}>
                  <ShieldCheck size={16} color="#059669" />
                  <Text style={[styles.summaryTitle, { color: "#065F46" }]}>Plain-Language Summary</Text>
                </View>
                <Text style={[styles.summaryText, { color: "#065F46" }]}>
                  We collect only the information needed to manage appointments and verify doctor credentials. We never sell your personal or medical data to third parties or advertisers. You have the right to review and delete your info.
                </Text>
              </View>

              <View style={styles.sectionBox}>
                <Text style={styles.sectionHeader}>1. Information We Collect</Text>
                <Text style={styles.paragraph}>
                  (a) For Doctors &amp; Clinic Partners: Full name, contact mobile number, email, medical registration number, State Medical Council, registration year, degrees, experience, and uploaded verification document images (degree certificate, NMC certificate), clinic coordinates, and weekly schedule.{"\n"}
                  (b) For Patients: Full name, mobile number (for OTP authentication &amp; SMS updates), and appointment token metadata.
                </Text>

                <Text style={styles.sectionHeader}>2. How We Use Your Information</Text>
                <Text style={styles.paragraph}>
                  We use collected data solely to synchronize clinic queue tokens, display verified doctor profiles, send transactional SMS/WhatsApp alerts, and verify practitioner credentials.{"\n\n"}
                  WE DO NOT SELL, RENT, OR MONETIZE PERSONAL HEALTH INFORMATION OR USER CONTACT DETAILS TO THIRD-PARTY ADVERTISERS.
                </Text>

                <Text style={styles.sectionHeader}>3. Data Storage &amp; Security Practices</Text>
                <Text style={styles.paragraph}>
                  • Data is stored in secure cloud infrastructure with TLS encryption in transit and AES-256 protected credentials.{"\n"}
                  • Clinic token records are accessible only to the specific doctor and authorized staff handling that day's queue.
                </Text>

                <Text style={styles.sectionHeader}>4. Third-Party Technical Integrations</Text>
                <Text style={styles.paragraph}>
                  We utilize secure cloud gateways for SMS/OTP delivery, object storage for certificate images, and mapping APIs for clinic navigation.
                </Text>

                <Text style={styles.sectionHeader}>5. Children's &amp; Minors' Data</Text>
                <Text style={styles.paragraph}>
                  Where an appointment is scheduled for a minor, the person booking represents that they are the parent or legal guardian authorized to provide the minor's name. JivniCare does not engage in behavioral profiling, tracking, or targeted advertising directed at children.
                </Text>

                <Text style={styles.sectionHeader}>6. Data Retention &amp; Account Deletion Policy</Text>
                <Text style={styles.paragraph}>
                  • Immediate Action: Upon deletion, the clinic profile is immediately unlisted from public discovery, pending tokens are cancelled, and all active login sessions are revoked.{"\n"}
                  • Doctor KYC Records: Uploaded medical degrees and NMC registration certificates are moved to access-restricted cold storage and retained for 180 days solely for statutory verification audit defense, after which they are permanently deleted.{"\n"}
                  • Historical Consultation Records: Past completed appointment logs are preserved in an immutable, read-only archive for 3 years to comply with healthcare documentation standards, after which they are permanently purged.
                </Text>

                <Text style={styles.sectionHeader}>7. Your Rights</Text>
                <Text style={styles.paragraph}>
                  You have the right to review the personal data you have submitted, update incomplete information, or request the deletion of your account through the settings menu.
                </Text>

                <Text style={styles.sectionHeader}>8. Privacy Officer &amp; Grievance Redressal</Text>
                <View style={styles.contactCard}>
                  <Text style={styles.contactCardText}><Text style={{ fontWeight: "700" }}>Privacy &amp; Compliance Officer:</Text> Dharmendra Kumar</Text>
                  <Text style={styles.contactCardText}><Text style={{ fontWeight: "700" }}>Email:</Text> grievance@jivnicare.com / support@jivnicare.com</Text>
                  <Text style={styles.contactCardText}><Text style={{ fontWeight: "700" }}>Helpline:</Text> +91 82353 51897</Text>
                </View>
              </View>
            </View>
          )}

          {/* MEDICAL DISCLAIMER */}
          {activeTab === "DISCLAIMER" && (
            <View>
              <Text style={styles.docTitle}>Medical &amp; Platform Disclaimer</Text>
              <Text style={styles.docMeta}>Last updated: September 2026 • Active Operations</Text>

              {/* Plain-Language Summary */}
              <View style={[styles.summaryCard, { backgroundColor: "#FFF1F2", borderColor: "#FECDD3" }]}>
                <View style={styles.summaryHeader}>
                  <ShieldAlert size={16} color="#E11D48" />
                  <Text style={[styles.summaryTitle, { color: "#9F1239" }]}>Plain-Language Summary</Text>
                </View>
                <Text style={[styles.summaryText, { color: "#9F1239" }]}>
                  JivniCare helps you find doctors and manage waiting times. We do not provide medical care or emergency services. All medical advice and treatments come solely from your consulting doctor. In an emergency, always call 112 or 108.
                </Text>
              </View>

              {/* Emergency Banner */}
              <View style={styles.emergencyBanner}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <PhoneCall size={16} color="#FFFFFF" />
                  <Text style={styles.emergencyBannerTitle}>Medical Emergency?</Text>
                </View>
                <Text style={styles.emergencyBannerText}>
                  Do not use JivniCare for emergency care. Immediately call 112 or 108 or go to the nearest emergency hospital.
                </Text>
              </View>

              <View style={styles.sectionBox}>
                <Text style={styles.sectionHeader}>1. No Medical Advice or Diagnosis</Text>
                <Text style={styles.paragraph}>
                  JivniCare is a software and technology communication tool designed to organize clinic waiting lines and schedule doctor appointments. JivniCare does NOT provide medical advice, diagnosis, treatment plans, prescriptions, or second opinions.
                </Text>

                <Text style={styles.sectionHeader}>2. Independent Practitioner Responsibility</Text>
                <Text style={styles.paragraph}>
                  All doctors listed on JivniCare are independent healthcare professionals. JivniCare does not oversee, control, or evaluate the medical judgment, advice, procedures, or prescriptions given during any consultation. The consulting doctor bears sole and full professional liability for all clinical care rendered.
                </Text>

                <Text style={styles.sectionHeader}>3. No Emergency Services</Text>
                <Text style={styles.paragraph}>
                  JIVNICARE IS NOT EQUIPPED FOR EMERGENCY MEDICAL SITUATIONS. IF YOU OR SOMEONE YOU ARE ASSISTING IS EXPERIENCING A MEDICAL EMERGENCY, IMMEDIATELY CALL 112 OR 108.
                </Text>

                <Text style={styles.sectionHeader}>4. Credential Verification Notice</Text>
                <Text style={styles.paragraph}>
                  While JivniCare performs administrative verification of registration numbers against public medical council records during doctor onboarding, patients are encouraged to exercise ordinary prudence and independently verify physician credentials before undergoing specialized procedures or surgeries.
                </Text>

                <Text style={styles.sectionHeader}>5. No Guarantee of Clinical Timings</Text>
                <Text style={styles.paragraph}>
                  Estimated wait times and queue positions shown on JivniCare are dynamic calculations based on real-time clinic movement. JivniCare is not liable for waiting room delays experienced at the clinic.
                </Text>
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontFamily: fontFamilies.heading,
    fontWeight: "700",
    fontSize: 16,
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 8,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  tabItemActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontFamily: fontFamilies.body,
    fontWeight: "500",
    fontSize: 12,
    color: colors.textMuted,
  },
  tabTextActive: {
    fontFamily: fontFamilies.heading,
    fontWeight: "700",
    color: colors.primary,
  },
  scrollArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: 20,
  },
  docTitle: {
    fontFamily: fontFamilies.heading,
    fontWeight: "800",
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  docMeta: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 16,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  summaryTitle: {
    fontFamily: fontFamilies.heading,
    fontWeight: "700",
    fontSize: 13,
    color: colors.primary,
  },
  summaryText: {
    fontFamily: fontFamilies.body,
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 18,
    color: "#1E3A8A",
  },
  emergencyBanner: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#E11D48",
    marginBottom: 20,
  },
  emergencyBannerTitle: {
    fontFamily: fontFamilies.heading,
    fontWeight: "700",
    fontSize: 14,
    color: "#FFFFFF",
  },
  emergencyBannerText: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    color: "#FFE4E6",
    lineHeight: 17,
  },
  sectionBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionHeader: {
    fontFamily: fontFamilies.heading,
    fontWeight: "700",
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 6,
  },
  paragraph: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    lineHeight: 19,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  contactCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 8,
    gap: 4,
  },
  contactCardText: {
    fontFamily: fontFamilies.body,
    fontWeight: "500",
    fontSize: 11,
    color: colors.textPrimary,
  },
  contactCardSub: {
    fontFamily: fontFamilies.body,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },
});
