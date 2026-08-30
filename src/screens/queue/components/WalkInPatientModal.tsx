import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, typography, radius } from "../../../theme";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { User, Phone, MapPin, Activity, AlertCircle, Banknote, CreditCard, Siren } from "lucide-react-native";

export interface WalkInPatientModalProps {
  visible: boolean;
  onClose: () => void;
  showEmergencyToggle?: boolean;
  onSubmit: (data: {
    name: string;
    age?: number;
    gender?: string;
    phone?: string;
    address?: string;
    symptoms?: string;
    isEmergency?: boolean;
    paymentMode?: "CASH" | "ONLINE";
  }) => Promise<void>;
}

export const WalkInPatientModal: React.FC<WalkInPatientModalProps> = ({
  visible,
  onClose,
  showEmergencyToggle = false,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"CASH" | "ONLINE">("CASH");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Please enter the patient's name.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await onSubmit({
        name,
        age: age ? parseInt(age, 10) : undefined,
        gender,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        symptoms: symptoms.trim() || undefined,
        isEmergency: showEmergencyToggle ? isEmergency : false,
        paymentMode,
      });
      // Reset form
      setName("");
      setAge("");
      setPhone("");
      setAddress("");
      setSymptoms("");
      setIsEmergency(false);
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to register walk-in patient.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Add Walk-In Patient"
      subtitle="Issue an instant OPD token for on-spot clinic arrival."
      footer={
        <Button
          title="Generate Token & Add to Queue"
          variant="primary"
          size="lg"
          onPress={handleSubmit}
          loading={isLoading}
          style={{ width: "100%" }}
        />
      }
    >
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Emergency Toggle (Conditional for Emergency Authorized Doctors) */}
      {showEmergencyToggle && (
        <TouchableOpacity
          style={[styles.emergencyToggle, isEmergency && styles.emergencyToggleActive]}
          onPress={() => setIsEmergency(!isEmergency)}
          activeOpacity={0.8}
        >
          <View style={[styles.emergencyIcon, isEmergency && { backgroundColor: colors.destructive }]}>
            <Siren size={16} color={isEmergency ? "#FFFFFF" : colors.destructive} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.emergencyTitle, isEmergency && { color: colors.destructive }]}>
              Emergency / Immediate Priority
            </Text>
            <Text style={styles.emergencySub}>
              Assigns a 9000-series priority token and jumps to top of queue
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Full Name */}
      <Input
        label="Patient Name *"
        placeholder="e.g. Ramesh Kumar"
        value={name}
        onChangeText={setName}
        leftIcon={<User size={16} color={colors.primary} />}
        containerStyle={{ marginBottom: 14 }}
      />

      {/* Age & Gender */}
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Input
            label="Age"
            placeholder="e.g. 35"
            keyboardType="number-pad"
            value={age}
            onChangeText={setAge}
            containerStyle={{ marginBottom: 14 }}
          />
        </View>
        <View style={{ flex: 1.2 }}>
          <Text style={styles.fieldLabel}>Gender</Text>
          <View style={styles.genderRow}>
            {["Male", "Female", "Other"].map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                onPress={() => setGender(g)}
              >
                <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Phone Number */}
      <Input
        label="Mobile Number (Optional)"
        placeholder="10-digit mobile number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        leftIcon={<Phone size={16} color={colors.textMuted} />}
        containerStyle={{ marginBottom: 14 }}
      />

      {/* Address / Location */}
      <Input
        label="Location / Village (Optional)"
        placeholder="e.g. Sikandra, Jamui"
        value={address}
        onChangeText={setAddress}
        leftIcon={<MapPin size={16} color={colors.textMuted} />}
        containerStyle={{ marginBottom: 14 }}
      />

      {/* Symptoms / Chief Complaint */}
      <Input
        label="Symptoms / Reason (Optional)"
        placeholder="e.g. High fever for 2 days"
        value={symptoms}
        onChangeText={setSymptoms}
        leftIcon={<Activity size={16} color={colors.textMuted} />}
        containerStyle={{ marginBottom: 14 }}
      />

      {/* Initial Payment Method */}
      <Text style={styles.fieldLabel}>Consultation Fee Payment</Text>
      <View style={styles.paymentRow}>
        <TouchableOpacity
          style={[styles.paymentBtn, paymentMode === "CASH" && styles.paymentBtnActive]}
          onPress={() => setPaymentMode("CASH")}
        >
          <Banknote size={16} color={paymentMode === "CASH" ? colors.secondary : colors.textSecondary} />
          <Text style={[styles.paymentText, paymentMode === "CASH" && styles.paymentTextActive]}>
            Cash Paid
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.paymentBtn, paymentMode === "ONLINE" && styles.paymentBtnActive]}
          onPress={() => setPaymentMode("ONLINE")}
        >
          <CreditCard size={16} color={paymentMode === "ONLINE" ? colors.primary : colors.textSecondary} />
          <Text style={[styles.paymentText, paymentMode === "ONLINE" && styles.paymentTextActive]}>
            Online / UPI
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  errorBox: {
    padding: 10,
    backgroundColor: colors.destructiveBg,
    borderRadius: radius.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.destructiveBorder,
  },
  errorText: {
    ...typography.caption,
    color: colors.destructive,
    fontWeight: "700",
  },
  emergencyToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    backgroundColor: colors.mutedBackground,
    marginBottom: 14,
    gap: 12,
  },
  emergencyToggleActive: {
    borderColor: colors.destructive,
    backgroundColor: colors.destructiveBg,
  },
  emergencyIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  emergencyTitle: {
    ...typography.titleSmall,
    fontSize: 13,
    color: colors.textPrimary,
  },
  emergencySub: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
    textTransform: "none",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  fieldLabel: {
    ...typography.bodySmall,
    fontWeight: "700",
    color: colors.navy,
    marginBottom: 6,
  },
  genderRow: {
    flexDirection: "row",
    height: 48,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  genderBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  genderBtnActive: {
    backgroundColor: colors.accent,
  },
  genderText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: "none",
  },
  genderTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  paymentRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  paymentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
  },
  paymentBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },
  paymentText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: colors.textSecondary,
  },
  paymentTextActive: {
    color: colors.navy,
    fontWeight: "700",
  },
});
