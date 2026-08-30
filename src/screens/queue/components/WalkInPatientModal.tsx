import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, typography, radius } from "../../../theme";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { User, Phone, MapPin, Activity, AlertCircle, Banknote, CreditCard } from "lucide-react-native";

export interface WalkInPatientModalProps {
  visible: boolean;
  onClose: () => void;
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
        isEmergency,
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

      {/* Emergency Toggle */}
      <TouchableOpacity
        style={[styles.emergencyToggle, isEmergency && styles.emergencyToggleActive]}
        onPress={() => setIsEmergency(!isEmergency)}
      >
        <AlertCircle size={18} color={isEmergency ? "#FFFFFF" : colors.destructive} />
        <Text style={[styles.emergencyText, isEmergency && { color: "#FFFFFF" }]}>
          Emergency / Critical Priority (Bypasses Line)
        </Text>
      </TouchableOpacity>

      <Input
        label="Patient Full Name *"
        placeholder="e.g. Amit Kumar"
        value={name}
        onChangeText={setName}
        leftIcon={<User size={18} color={colors.primary} />}
      />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Input
            label="Age"
            placeholder="e.g. 35"
            keyboardType="number-pad"
            value={age}
            onChangeText={setAge}
          />
        </View>
        <View style={{ width: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            {["Male", "Female"].map((g) => (
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

      <Input
        label="Mobile Number (Optional for SMS)"
        placeholder="10-digit number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        leftIcon={<Phone size={18} color={colors.primary} />}
      />

      <Input
        label="Symptoms / Reason for Visit"
        placeholder="e.g. Fever, Routine Checkup, Back Pain"
        value={symptoms}
        onChangeText={setSymptoms}
        leftIcon={<Activity size={18} color={colors.primary} />}
      />

      {/* Payment Mode Selection */}
      <Text style={styles.label}>Consultation Fee Collection</Text>
      <View style={styles.paymentRow}>
        <TouchableOpacity
          style={[styles.paymentOption, paymentMode === "CASH" && styles.paymentOptionActive]}
          onPress={() => setPaymentMode("CASH")}
        >
          <Banknote size={18} color={paymentMode === "CASH" ? colors.primary : colors.navy} />
          <Text style={[styles.paymentText, paymentMode === "CASH" && styles.paymentTextActive]}>
            Cash Received
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.paymentOption, paymentMode === "ONLINE" && styles.paymentOptionActive]}
          onPress={() => setPaymentMode("ONLINE")}
        >
          <CreditCard size={18} color={paymentMode === "ONLINE" ? colors.primary : colors.navy} />
          <Text style={[styles.paymentText, paymentMode === "ONLINE" && styles.paymentTextActive]}>
            UPI / Online
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  errorBox: {
    backgroundColor: colors.destructiveBg,
    padding: 10,
    borderRadius: radius.md,
    marginBottom: 12,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.destructive,
    fontWeight: "600",
  },
  emergencyToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.destructiveBg,
    borderWidth: 1,
    borderColor: colors.destructiveBorder,
    borderRadius: radius.lg,
    padding: 12,
    marginBottom: 16,
  },
  emergencyToggleActive: {
    backgroundColor: colors.destructive,
    borderColor: colors.destructive,
  },
  emergencyText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.destructive,
    fontWeight: "800",
    textTransform: "none",
  },
  row: {
    flexDirection: "row",
  },
  label: {
    ...typography.bodySmall,
    color: colors.navy,
    fontWeight: "700",
    marginBottom: 6,
  },
  genderRow: {
    flexDirection: "row",
    gap: 6,
    height: 48,
  },
  genderBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.navyBorder,
    backgroundColor: colors.surface,
  },
  genderBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },
  genderText: {
    ...typography.bodySmall,
    color: colors.navy,
    fontWeight: "700",
  },
  genderTextActive: {
    color: colors.primary,
  },
  paymentRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  paymentOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.navyBorder,
    backgroundColor: colors.surface,
  },
  paymentOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },
  paymentText: {
    ...typography.bodySmall,
    color: colors.navy,
    fontWeight: "700",
  },
  paymentTextActive: {
    color: colors.primary,
  },
});
