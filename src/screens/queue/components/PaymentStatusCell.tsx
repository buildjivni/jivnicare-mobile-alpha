import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { colors, typography, radius, shadows } from "../../../theme";
import { CheckCircle2, Banknote, CreditCard, X } from "lucide-react-native";

export type PaymentMode = "ONLINE" | "CASH" | null;

export interface PaymentStatusCellProps {
  tokenId: string;
  paymentVerified: boolean;
  paymentMode: PaymentMode;
  feeWaived?: boolean;
  onCollect: (tokenId: string, mode: "ONLINE" | "CASH") => Promise<void>;
  compact?: boolean;
}

export const PaymentStatusCell: React.FC<PaymentStatusCellProps> = ({
  tokenId,
  paymentVerified,
  paymentMode,
  feeWaived = false,
  onCollect,
  compact = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectMode = async (mode: "ONLINE" | "CASH") => {
    setIsSubmitting(true);
    try {
      await onCollect(tokenId, mode);
      setModalVisible(false);
    } catch (e) {
      // Error handled by caller
    } finally {
      setIsSubmitting(false);
    }
  };

  if (feeWaived) {
    return (
      <View style={[styles.badge, styles.waivedBadge]}>
        <CheckCircle2 size={12} color={colors.secondary} />
        <Text style={[styles.badgeText, styles.waivedText]}>Follow-up Waived</Text>
      </View>
    );
  }

  if (paymentVerified) {
    const isCash = paymentMode === "CASH";
    return (
      <View style={[styles.badge, styles.verifiedBadge]}>
        <CheckCircle2 size={12} color={colors.secondary} />
        <Text style={[styles.badgeText, styles.verifiedText]}>
          {isCash ? "Paid Cash" : "Paid Online"}
        </Text>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.badge, styles.unpaidBadge, compact && styles.compactBadge]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Banknote size={12} color={colors.navy} />
        <Text style={[styles.badgeText, styles.unpaidText]}>+ Collect Fee</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Collect Consultation Fee</Text>
                <Text style={styles.modalSub}>Select payment method received</Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {isSubmitting ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Recording payment...</Text>
              </View>
            ) : (
              <View style={styles.optionsList}>
                <TouchableOpacity
                  style={styles.optionCard}
                  onPress={() => handleSelectMode("CASH")}
                  activeOpacity={0.8}
                >
                  <View style={[styles.optionIcon, { backgroundColor: "#ECFDF5" }]}>
                    <Banknote size={20} color={colors.secondary} />
                  </View>
                  <View style={styles.optionTextWrap}>
                    <Text style={styles.optionTitle}>Cash Collected</Text>
                    <Text style={styles.optionDesc}>Received physical cash at counter</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionCard}
                  onPress={() => handleSelectMode("ONLINE")}
                  activeOpacity={0.8}
                >
                  <View style={[styles.optionIcon, { backgroundColor: colors.accent }]}>
                    <CreditCard size={20} color={colors.primary} />
                  </View>
                  <View style={styles.optionTextWrap}>
                    <Text style={styles.optionTitle}>Online / UPI Received</Text>
                    <Text style={styles.optionDesc}>Paid via QR code or online link</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.md,
  },
  compactBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  waivedBadge: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  waivedText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: colors.secondary,
  },
  verifiedBadge: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  verifiedText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: colors.secondary,
  },
  unpaidBadge: {
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: "rgba(27, 63, 107, 0.2)",
  },
  unpaidText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: colors.navy,
  },
  badgeText: {
    ...typography.caption,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius["2xl"],
    padding: 20,
    ...shadows.premium,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingBottom: 12,
  },
  modalTitle: {
    ...typography.titleMedium,
    color: colors.navy,
  },
  modalSub: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  loadingBox: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  optionsList: {
    gap: 10,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
    gap: 12,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitle: {
    ...typography.titleSmall,
    fontSize: 13,
    color: colors.textPrimary,
  },
  optionDesc: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    textTransform: "none",
  },
});
