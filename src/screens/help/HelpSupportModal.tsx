import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Linking,
  StatusBar,
} from "react-native";
import { colors, typography, fontFamilies } from "../../theme";
import {
  X,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";

interface HelpSupportModalProps {
  visible: boolean;
  onClose: () => void;
}

const FAQS = [
  {
    q: "How does live queue token calling work?",
    a: "When a patient's turn arrives, tap 'Call Next Token' in your Live Queue screen. An instant notification is dispatched to the patient's phone to enter the consultation room.",
  },
  {
    q: "How do I add walk-in patients without online booking?",
    a: "Tap the '+ Issue Walk-In Token' button at the top of your Live Queue screen. Enter the patient's name and mobile number to issue an on-the-spot token.",
  },
  {
    q: "Can my clinic receptionist manage the queue from their phone?",
    a: "Yes! Go to Settings > Staff tab. Add your receptionist's mobile number. They will be able to log in to the Operator app and issue tokens or call patients on your behalf.",
  },
  {
    q: "How do I pause bookings if I am running late?",
    a: "On your Overview dashboard, toggle the 'Today's Clinic Status' switch to 'Pause Bookings'. Patients will see that the clinic is currently paused.",
  },
];

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ visible, onClose }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleWhatsApp = () => {
    Linking.openURL("https://wa.me/918235351897?text=Hello%20JivniCare%20Support%2C%20I%20am%20a%20doctor%20partner%20and%20need%20assistance.");
  };

  const handleEmail = () => {
    Linking.openURL("mailto:support@jivnicare.com?subject=Doctor%20Partner%20Support%20Request");
  };

  const handleCall = () => {
    Linking.openURL("tel:8235351897");
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Modal Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <HelpCircle size={20} color={colors.primary} />
            <Text style={styles.headerTitle}>Help &amp; Partner Support</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Emergency Alert */}
          <View style={styles.emergencyCard}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <ShieldAlert size={16} color="#E11D48" />
              <Text style={styles.emergencyTitle}>Clinical Emergency Disclaimer</Text>
            </View>
            <Text style={styles.emergencyText}>
              JivniCare is strictly a routine OPD queue tool. For acute patient life emergencies, direct patients to call 112 / 108 or nearest emergency trauma centers.
            </Text>
          </View>

          {/* Quick Contact Grid */}
          <Text style={styles.sectionHeading}>Contact Partner Desk</Text>
          <View style={styles.contactGrid}>
            <TouchableOpacity style={styles.contactBtn} onPress={handleWhatsApp} activeOpacity={0.8}>
              <View style={[styles.contactIconBox, { backgroundColor: "#DCFCE7" }]}>
                <MessageCircle size={20} color="#15803D" />
              </View>
              <Text style={styles.contactLabel}>WhatsApp</Text>
              <Text style={styles.contactSub}>+91 82353 51897</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactBtn} onPress={handleEmail} activeOpacity={0.8}>
              <View style={[styles.contactIconBox, { backgroundColor: "#E0F2FE" }]}>
                <Mail size={20} color="#0369A1" />
              </View>
              <Text style={styles.contactLabel}>Email Desk</Text>
              <Text style={styles.contactSub}>support@jivnicare.com</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactBtn} onPress={handleCall} activeOpacity={0.8}>
              <View style={[styles.contactIconBox, { backgroundColor: "#F1F5F9" }]}>
                <Phone size={20} color="#334155" />
              </View>
              <Text style={styles.contactLabel}>Call Desk</Text>
              <Text style={styles.contactSub}>+91 82353 51897</Text>
            </TouchableOpacity>
          </View>

          {/* Frequently Asked Questions */}
          <Text style={[styles.sectionHeading, { marginTop: 24 }]}>Doctor FAQs</Text>
          <View style={styles.faqList}>
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.faqCard, isOpen && styles.faqCardOpen]}
                  onPress={() => setOpenFaq(isOpen ? null : index)}
                  activeOpacity={0.85}
                >
                  <View style={styles.faqQuestionRow}>
                    <Text style={[styles.faqQuestion, isOpen && styles.faqQuestionActive]}>{faq.q}</Text>
                    {isOpen ? <ChevronUp size={16} color={colors.primary} /> : <ChevronDown size={16} color="#94A3B8" />}
                  </View>
                  {isOpen && <Text style={styles.faqAnswer}>{faq.a}</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

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
  scrollArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: 20,
  },
  emergencyCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FECDD3",
    marginBottom: 20,
  },
  emergencyTitle: {
    fontFamily: fontFamilies.heading,
    fontWeight: "700",
    fontSize: 13,
    color: "#E11D48",
  },
  emergencyText: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    color: "#9F1239",
    lineHeight: 16,
  },
  sectionHeading: {
    fontFamily: fontFamilies.heading,
    fontWeight: "700",
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  contactGrid: {
    flexDirection: "row",
    gap: 10,
  },
  contactBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  contactIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  contactLabel: {
    fontFamily: fontFamilies.heading,
    fontWeight: "700",
    fontSize: 12,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  contactSub: {
    fontFamily: fontFamilies.body,
    fontSize: 9,
    color: colors.textMuted,
  },
  faqList: {
    gap: 10,
  },
  faqCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  faqCardOpen: {
    borderColor: colors.primary,
    backgroundColor: "#FFFFFF",
  },
  faqQuestionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  faqQuestion: {
    flex: 1,
    fontFamily: fontFamilies.heading,
    fontWeight: "700",
    fontSize: 12,
    color: colors.textPrimary,
    marginRight: 8,
  },
  faqQuestionActive: {
    color: colors.primary,
  },
  faqAnswer: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    lineHeight: 17,
    color: colors.textSecondary,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 8,
  },
});
