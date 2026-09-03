import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { colors, typography, fontFamilies } from "../../theme";
import { X, MessageSquare, Star, CheckCircle2, Send } from "lucide-react-native";
import { doctorApi } from "../../api/doctor";

interface DoctorFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { key: "SUGGESTION", label: "Suggestion" },
  { key: "BUG", label: "Bug Report" },
  { key: "FEATURE", label: "Feature Request" },
  { key: "OTHER", label: "General" },
];

export const DoctorFeedbackModal: React.FC<DoctorFeedbackModalProps> = ({ visible, onClose }) => {
  const [category, setCategory] = useState("SUGGESTION");
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim() || message.trim().length < 5) {
      Alert.alert("Feedback Required", "Please enter at least a short sentence describing your feedback or issue.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await doctorApi.submitFeedback({
        category,
        rating,
        message: message.trim(),
        subject: `${category} from Doctor App`,
      });

      if (res.success || res.ticketId) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setMessage("");
          onClose();
        }, 2000);
      } else {
        Alert.alert("Submission Error", res.error || "Could not submit feedback. Please try again.");
      }
    } catch (e: any) {
      Alert.alert("Connection Error", e?.message || "Failed to submit feedback. Check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MessageSquare size={20} color={colors.primary} />
              <Text style={styles.headerTitle}>Send Partner Feedback</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {isSuccess ? (
              <View style={styles.successBox}>
                <View style={styles.successIconBox}>
                  <CheckCircle2 size={36} color={colors.secondary} />
                </View>
                <Text style={styles.successTitle}>Thank You, Doctor!</Text>
                <Text style={styles.successSub}>
                  Your feedback and suggestions have been sent directly to the JivniCare product engineering team.
                </Text>
              </View>
            ) : (
              <View style={styles.formContainer}>
                <Text style={styles.label}>Feedback Category</Text>
                <View style={styles.catRow}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.key}
                      style={[styles.catBtn, category === cat.key && styles.catBtnActive]}
                      onPress={() => setCategory(cat.key)}
                    >
                      <Text style={[styles.catText, category === cat.key && styles.catTextActive]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.label, { marginTop: 18 }]}>App Experience Rating</Text>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)} style={{ padding: 4 }}>
                      <Star
                        size={28}
                        color={star <= rating ? "#F59E0B" : "#CBD5E1"}
                        fill={star <= rating ? "#F59E0B" : "transparent"}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.label, { marginTop: 18 }]}>Your Message or Suggestion</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Tell us what's working well, what needs improvement, or report any bug..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={5}
                  value={message}
                  onChangeText={setMessage}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={[styles.submitBtn, (!message.trim() || isSubmitting) && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={!message.trim() || isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Send size={16} color="#FFFFFF" />
                      <Text style={styles.submitBtnText}>Submit Feedback</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
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
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  label: {
    fontFamily: fontFamilies.heading,
    fontWeight: "700",
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  catRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  catBtnActive: {
    backgroundColor: "#EFF6FF",
    borderColor: colors.primary,
  },
  catText: {
    fontFamily: fontFamilies.body,
    fontWeight: "500",
    fontSize: 12,
    color: colors.textSecondary,
  },
  catTextActive: {
    fontFamily: fontFamilies.heading,
    fontWeight: "700",
    color: colors.primary,
  },
  starRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 14,
    fontFamily: fontFamilies.body,
    fontSize: 13,
    color: colors.textPrimary,
    minHeight: 120,
  },
  submitBtn: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  submitBtnDisabled: {
    backgroundColor: "#94A3B8",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    fontFamily: fontFamilies.heading,
    fontWeight: "700",
    fontSize: 14,
    color: "#FFFFFF",
  },
  successBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 40,
  },
  successIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontFamily: fontFamilies.heading,
    fontWeight: "700",
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  successSub: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
});
