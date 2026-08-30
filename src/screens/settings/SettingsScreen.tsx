import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { ScreenContainer } from "../../components/layout/ScreenContainer";
import { colors, typography, radius, shadows } from "../../theme";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { doctorApi } from "../../api/doctor";
import {
  Settings,
  Clock,
  Wallet,
  Users,
  Tag,
  CheckCircle2,
  Trash2,
  UserPlus,
  Save,
} from "lucide-react-native";

export const SettingsScreen: React.FC = () => {
  const { profile, settings, weeklySchedule, fetchWorkspace } = useWorkspaceStore();
  const [activeSubTab, setActiveSubTab] = useState<"OPERATIONS" | "SCHEDULE" | "EXPERTISE" | "STAFF">("OPERATIONS");
  const [isSaving, setIsSaving] = useState(false);

  // Operations Form State
  const [fee, setFee] = useState(settings?.fee || "300");
  const [consultTime, setConsultTime] = useState(settings?.averageConsultationTime || "15");
  const [emergencySlots, setEmergencySlots] = useState(settings?.emergencySlots || "2");
  const [emergencyFee, setEmergencyFee] = useState(settings?.emergencyFee || "500");
  const [followUpDays, setFollowUpDays] = useState(settings?.followUpDays || "7");

  // Operators List State
  const [operators, setOperators] = useState<any[]>([]);
  const [newOpName, setNewOpName] = useState("");
  const [newOpPhone, setNewOpPhone] = useState("");

  // Expertise Tags State
  const [tags, setTags] = useState<string[]>(profile?.expertiseTags || []);
  const [newTagInput, setNewTagInput] = useState("");

  useEffect(() => {
    if (settings) {
      setFee(settings.fee);
      setConsultTime(settings.averageConsultationTime);
      setEmergencySlots(settings.emergencySlots);
      setEmergencyFee(settings.emergencyFee);
      setFollowUpDays(settings.followUpDays);
    }
  }, [settings]);

  useEffect(() => {
    doctorApi.getOperators().then((res) => {
      if (res.data || res.operators) setOperators(res.data || res.operators || []);
    }).catch(() => {});
  }, []);

  const handleSaveOperations = async () => {
    setIsSaving(true);
    try {
      await doctorApi.updateSettings({
        fee,
        averageConsultationTime: consultTime,
        emergencySlots,
        emergencyFee,
        followUpDays,
      });
      await fetchWorkspace();
      Alert.alert("Success", "Clinic operational settings updated.");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddOperator = async () => {
    if (!newOpName.trim() || newOpPhone.length !== 10) {
      Alert.alert("Invalid Input", "Please enter a valid name and 10-digit mobile number.");
      return;
    }
    setIsSaving(true);
    try {
      await doctorApi.addOperator({ name: newOpName, phone: newOpPhone, role: "RECEPTIONIST" });
      setNewOpName("");
      setNewOpPhone("");
      const res = await doctorApi.getOperators();
      setOperators(res.data || res.operators || []);
      Alert.alert("Staff Added", "Operator invited to manage your clinic queue.");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not add operator.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveOperator = async (id: string) => {
    try {
      await doctorApi.removeOperator(id);
      setOperators(operators.filter((op) => op.id !== id));
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not remove operator.");
    }
  };

  const handleAddTag = () => {
    if (!newTagInput.trim() || tags.includes(newTagInput.trim())) return;
    const updated = [...tags, newTagInput.trim()];
    setTags(updated);
    setNewTagInput("");
    doctorApi.updateProfile({ expertiseTags: updated });
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = tags.filter((t) => t !== tagToRemove);
    setTags(updated);
    doctorApi.updateProfile({ expertiseTags: updated });
  };

  return (
    <ScreenContainer style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Practice Settings</Text>
        <Text style={styles.subtitle}>Configure clinic operations, schedule & staff</Text>
      </View>

      {/* Sub Tabs */}
      <View style={styles.subTabRow}>
        {[
          { key: "OPERATIONS", label: "Operations" },
          { key: "SCHEDULE", label: "Schedule" },
          { key: "EXPERTISE", label: "Expertise" },
          { key: "STAFF", label: "Staff" },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.subTab, activeSubTab === t.key && styles.subTabActive]}
            onPress={() => setActiveSubTab(t.key as any)}
          >
            <Text style={[styles.subTabText, activeSubTab === t.key && styles.subTabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* SUBTAB 1: OPERATIONS */}
        {activeSubTab === "OPERATIONS" && (
          <View>
            <Input
              label="Standard Consultation Fee (₹ INR)"
              value={fee}
              onChangeText={setFee}
              keyboardType="number-pad"
              leftIcon={<Wallet size={16} color={colors.primary} />}
            />

            <Text style={styles.fieldLabel}>Average Consultation Duration</Text>
            <View style={styles.durationRow}>
              {["10", "15", "20", "30"].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.durationBtn, consultTime === m && styles.durationBtnActive]}
                  onPress={() => setConsultTime(m)}
                >
                  <Text style={[styles.durationText, consultTime === m && styles.durationTextActive]}>
                    {m} mins
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Emergency Consultation Slots"
              value={emergencySlots}
              onChangeText={setEmergencySlots}
              keyboardType="number-pad"
            />

            <Input
              label="Emergency Consultation Fee (₹ INR)"
              value={emergencyFee}
              onChangeText={setEmergencyFee}
              keyboardType="number-pad"
            />

            <Input
              label="Free Follow-up Window (Days)"
              value={followUpDays}
              onChangeText={setFollowUpDays}
              keyboardType="number-pad"
              placeholder="e.g. 7"
            />

            <Button
              title="Save Operational Controls"
              size="lg"
              onPress={handleSaveOperations}
              loading={isSaving}
              icon={<Save size={18} color="#FFFFFF" />}
              style={styles.saveBtn}
            />
          </View>
        )}

        {/* SUBTAB 2: SCHEDULE */}
        {activeSubTab === "SCHEDULE" && (
          <View>
            <Text style={styles.sectionHeader}>Default Weekly OPD Hours</Text>
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
              <Card key={day} style={styles.scheduleDayCard}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayName}>{day}</Text>
                  <Badge label="Active Shift" variant="success" size="sm" />
                </View>
                <Text style={styles.dayShiftText}>
                  Morning: 09:00 AM – 01:00 PM (15 tokens)
                </Text>
                <Text style={styles.dayShiftText}>
                  Evening: 05:00 PM – 08:00 PM (15 tokens)
                </Text>
              </Card>
            ))}
          </View>
        )}

        {/* SUBTAB 3: EXPERTISE TAGS */}
        {activeSubTab === "EXPERTISE" && (
          <View>
            <Text style={styles.sectionHeader}>Medical Expertise & Treatments</Text>
            <Text style={styles.sectionSub}>Add symptoms, procedures, and conditions treated.</Text>

            <View style={styles.tagInputRow}>
              <View style={{ flex: 1 }}>
                <Input
                  placeholder="e.g. Hypertension, Diabetes, ECG"
                  value={newTagInput}
                  onChangeText={setNewTagInput}
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>
              <Button title="Add" size="md" onPress={handleAddTag} style={{ marginLeft: 8 }} />
            </View>

            <View style={styles.tagList}>
              {tags.map((tag) => (
                <View key={tag} style={styles.tagBadge}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                    <Text style={styles.tagRemove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* SUBTAB 4: STAFF / OPERATOR DELEGATION */}
        {activeSubTab === "STAFF" && (
          <View>
            <Text style={styles.sectionHeader}>Clinic Reception & Queue Staff</Text>
            <Text style={styles.sectionSub}>
              Authorize assistants to issue walk-ins and call tokens from their own phone.
            </Text>

            <Card style={styles.addOperatorCard}>
              <Text style={styles.addOpTitle}>Invite New Staff Member</Text>
              <Input
                label="Staff Full Name"
                placeholder="e.g. Ramesh Kumar"
                value={newOpName}
                onChangeText={setNewOpName}
              />
              <Input
                label="Mobile Number"
                placeholder="10-digit number"
                keyboardType="phone-pad"
                value={newOpPhone}
                onChangeText={setNewOpPhone}
              />
              <Button
                title="Send Operator Invitation"
                size="md"
                onPress={handleAddOperator}
                loading={isSaving}
                icon={<UserPlus size={16} color="#FFFFFF" />}
              />
            </Card>

            <Text style={[styles.sectionHeader, { marginTop: 16 }]}>Active Clinic Staff</Text>
            {operators.length > 0 ? (
              operators.map((op) => (
                <Card key={op.id} style={styles.operatorRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.opName}>{op.name}</Text>
                    <Text style={styles.opPhone}>+91 {op.phone}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveOperator(op.id)}
                    style={styles.deleteOpBtn}
                  >
                    <Trash2 size={16} color={colors.destructive} />
                  </TouchableOpacity>
                </Card>
              ))
            ) : (
              <Text style={styles.noStaffText}>No delegated staff members added yet.</Text>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
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
  subTabRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.mutedBackground,
  },
  subTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: radius.md,
  },
  subTabActive: {
    backgroundColor: colors.surface,
    ...shadows.soft,
  },
  subTabText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: "none",
    fontWeight: "700",
  },
  subTabTextActive: {
    color: colors.primary,
    fontWeight: "900",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 130,
  },
  fieldLabel: {
    ...typography.bodySmall,
    color: colors.navy,
    fontWeight: "700",
    marginBottom: 6,
  },
  durationRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  durationBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.navyBorder,
    backgroundColor: colors.surface,
  },
  durationBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },
  durationText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.navy,
  },
  durationTextActive: {
    color: colors.primary,
  },
  saveBtn: {
    marginTop: 12,
    width: "100%",
  },
  sectionHeader: {
    ...typography.titleSmall,
    color: colors.navy,
    marginBottom: 4,
  },
  sectionSub: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 14,
  },
  scheduleDayCard: {
    marginBottom: 10,
    padding: 12,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  dayName: {
    ...typography.titleSmall,
    fontSize: 14,
    color: colors.textPrimary,
  },
  dayShiftText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tagInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: "rgba(86, 150, 199, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  tagText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primary,
    textTransform: "none",
    fontWeight: "700",
  },
  tagRemove: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "bold",
  },
  addOperatorCard: {
    marginBottom: 16,
    padding: 14,
  },
  addOpTitle: {
    ...typography.titleSmall,
    fontSize: 14,
    color: colors.navy,
    marginBottom: 10,
  },
  operatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    padding: 12,
  },
  opName: {
    ...typography.titleSmall,
    fontSize: 14,
    color: colors.textPrimary,
  },
  opPhone: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "none",
  },
  deleteOpBtn: {
    padding: 8,
  },
  noStaffText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontStyle: "italic",
    marginTop: 8,
  },
});
