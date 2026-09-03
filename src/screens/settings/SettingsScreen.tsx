import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Rect } from "react-native-svg";
import { ScreenContainer } from "../../components/layout/ScreenContainer";
import { colors, typography, radius, shadows } from "../../theme";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { WeeklyScheduleEditor, WeeklySchedule } from "./components/WeeklyScheduleEditor";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { doctorApi } from "../../api/doctor";
import { uploadApi } from "../../api/upload";
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
  Building2,
  ShieldCheck,
  Camera,
  CalendarX,
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  Plus,
  Scale,
  FileText,
  ShieldAlert,
  HelpCircle,
  MessageSquare,
  X,
  Lock,
} from "lucide-react-native";
import { LegalViewerModal, LegalDocType } from "../legal/LegalViewerModal";
import { HelpSupportModal } from "../help/HelpSupportModal";
import { DoctorFeedbackModal } from "../feedback/DoctorFeedbackModal";
import { AppFooterBranding } from "../../components/layout/AppFooterBranding";
import { useAuthStore } from "../../store/useAuthStore";
import { Modal } from "react-native";

export interface SettingsScreenProps {
  onBack?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const { profile, settings, weeklySchedule, fetchWorkspace } = useWorkspaceStore();
  const [activeSubTab, setActiveSubTab] = useState<"IDENTITY" | "OPERATIONS" | "SCHEDULE" | "HOLIDAY" | "EXPERTISE" | "STAFF" | "LEGAL">("IDENTITY");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [scrollAtEnd, setScrollAtEnd] = useState(false);
  const subTabScrollRef = useRef<ScrollView>(null);

  // Legal & Support Modals
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalDocType, setLegalDocType] = useState<LegalDocType>("TERMS");
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // 1. Pending Profile Update Requests
  const [profileRequests, setProfileRequests] = useState<any[]>([]);

  // 2. Clinic Identity Form
  const [clinicImage, setClinicImage] = useState(profile?.clinicImage || "");
  const [hospitalName, setHospitalName] = useState(profile?.hospitalName || "");
  const [city, setCity] = useState(profile?.city || "");
  const [address, setAddress] = useState(profile?.address || "");
  const isVerified = profile?.verificationStatus === "VERIFIED";

  // 3. Operations Form State
  const [fee, setFee] = useState(settings?.fee || "500");
  const [consultTime, setConsultTime] = useState(settings?.averageConsultationTime || "15");
  const [bookingWindowStart, setBookingWindowStart] = useState(settings?.bookingWindowStart || "08:00");
  const [emergencySlots, setEmergencySlots] = useState(settings?.emergencySlots || "2");
  const [emergencyFee, setEmergencyFee] = useState(settings?.emergencyFee || "700");
  const [followUpDays, setFollowUpDays] = useState(settings?.followUpDays || "7");
  const [opdLimit, setOpdLimit] = useState(settings?.opdPatientLimit || "30");

  // 4. Leave & Holiday Manager State
  const [holidayReason, setHolidayReason] = useState("");
  const [isHolidayClosed, setIsHolidayClosed] = useState(false);

  // 5. Weekly Schedule
  const [schedule, setSchedule] = useState<WeeklySchedule>(
    (weeklySchedule as any) || {
      monday: { active: true, slots: [{ start: "09:00", end: "13:00" }, { start: "17:00", end: "20:00" }] },
      tuesday: { active: true, slots: [{ start: "09:00", end: "13:00" }, { start: "17:00", end: "20:00" }] },
      wednesday: { active: true, slots: [{ start: "09:00", end: "13:00" }, { start: "17:00", end: "20:00" }] },
      thursday: { active: true, slots: [{ start: "09:00", end: "13:00" }, { start: "17:00", end: "20:00" }] },
      friday: { active: true, slots: [{ start: "09:00", end: "13:00" }, { start: "17:00", end: "20:00" }] },
      saturday: { active: true, slots: [{ start: "09:00", end: "13:00" }] },
      sunday: { active: false, slots: [] },
    }
  );

  // 6. Staff State
  const [operators, setOperators] = useState<any[]>([]);
  const [newOpName, setNewOpName] = useState("");
  const [newOpPhone, setNewOpPhone] = useState("");
  const [newOpRole, setNewOpRole] = useState<"Operator" | "Receptionist" | "Clinic Manager">("Operator");

  // 7. Tags State
  const [tags, setTags] = useState<string[]>(profile?.expertiseTags || []);
  const [newTagInput, setNewTagInput] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [reqRes, opRes] = await Promise.all([
        doctorApi.getProfileUpdateRequests().catch(() => ({ requests: [] })),
        doctorApi.getOperators().catch(() => ({ operators: [] })),
      ]);
      setProfileRequests((reqRes as any)?.requests || (reqRes as any)?.data || []);
      setOperators(opRes?.data || opRes?.operators || []);
    } catch (e) {}
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (profile) {
      setClinicImage(profile.clinicImage || "");
      setHospitalName(profile.hospitalName || "");
      setCity(profile.city || "");
      setAddress(profile.address || "");
      setTags(profile.expertiseTags || []);
    }
  }, [profile]);

  useEffect(() => {
    if (settings) {
      setFee(settings.fee);
      setConsultTime(settings.averageConsultationTime);
      setBookingWindowStart(settings.bookingWindowStart || "08:00");
      setEmergencySlots(settings.emergencySlots);
      setEmergencyFee(settings.emergencyFee);
      setFollowUpDays(settings.followUpDays);
    }
  }, [settings]);

  // Photo Pick & Upload
  const handlePickClinicPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please grant camera roll permissions to upload clinic photos.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setIsUploadingPhoto(true);
        const uploadedUrl = await uploadApi.uploadFile(result.assets[0].uri);
        setClinicImage(uploadedUrl);
        Alert.alert("Success", "Clinic photo uploaded. Tap 'Save Clinic Identity' to commit changes.");
      }
    } catch (e: any) {
      Alert.alert("Upload Error", e.message || "Failed to upload clinic image");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Save Clinic Identity
  const handleSaveIdentity = async () => {
    setIsSaving(true);
    try {
      await doctorApi.updateProfile({
        clinicImage: clinicImage || undefined,
        hospitalName: !isVerified ? hospitalName : undefined,
        city: !isVerified ? city : undefined,
        address: !isVerified ? address : undefined,
      });
      await fetchWorkspace();
      Alert.alert("Success", "Clinic identity details updated.");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to update clinic identity.");
    } finally {
      setIsSaving(false);
    }
  };

  // Save Operations
  const handleSaveOperations = async () => {
    setIsSaving(true);
    try {
      await doctorApi.updateSettings({
        fee,
        averageConsultationTime: consultTime,
        bookingWindowStart,
        emergencySlots,
        emergencyFee,
        followUpDays,
      });
      await fetchWorkspace();
      Alert.alert("Success", "Clinic operational controls saved.");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // Save Weekly Schedule
  const handleSaveSchedule = async (newSchedule: WeeklySchedule) => {
    setIsSaving(true);
    try {
      await doctorApi.updateWeeklySchedule(newSchedule);
      await fetchWorkspace();
      Alert.alert("Success", "Weekly operating hours updated successfully.");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to save weekly schedule.");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Leave & Holiday
  const handleToggleHoliday = async (active: boolean) => {
    setIsSaving(true);
    try {
      await doctorApi.toggleHoliday({
        active,
        reason: holidayReason.trim() || undefined,
        mode: "soft",
      });
      setIsHolidayClosed(active);
      Alert.alert(
        "Clinic Status",
        active
          ? "Clinic marked closed for today. New online appointments have been blocked."
          : "Clinic is now marked open for today."
      );
      if (!active) setHolidayReason("");
      await fetchWorkspace();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to update holiday status.");
    } finally {
      setIsSaving(false);
    }
  };

  // Staff / Operator actions
  const handleAddOperator = async () => {
    if (!newOpName.trim() || newOpPhone.length !== 10) {
      Alert.alert("Invalid Input", "Please enter a valid name and 10-digit mobile number.");
      return;
    }
    setIsSaving(true);
    try {
      await doctorApi.addOperator({ name: newOpName.trim(), phone: newOpPhone.trim(), role: newOpRole });
      setNewOpName("");
      setNewOpPhone("");
      const res = await doctorApi.getOperators();
      setOperators(res.data || res.operators || []);
      Alert.alert("Staff Added", `${newOpRole} invited to manage your clinic queue.`);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not add staff member.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveOperator = async (id: string) => {
    try {
      await doctorApi.removeOperator(id);
      setOperators(operators.filter((op) => op.id !== id));
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not remove staff member.");
    }
  };

  // Expertise Tags actions
  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    const updated = [...tags, trimmed];
    setTags(updated);
    setNewTagInput("");
    useWorkspaceStore.getState().updateLocalProfile({ expertiseTags: updated });
    doctorApi.updateSettings({ expertiseTags: updated }).catch(() => {});
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = tags.filter((t) => t !== tagToRemove);
    setTags(updated);
    useWorkspaceStore.getState().updateLocalProfile({ expertiseTags: updated });
    doctorApi.updateSettings({ expertiseTags: updated }).catch(() => {});
  };

  return (
    <ScreenContainer style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
              <ArrowLeft size={20} color={colors.navy} />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Practice Settings</Text>
            <Text style={styles.subtitle}>Configure clinic identity, schedule, operations & staff</Text>
          </View>
        </View>
      </View>

      {/* Sub Tabs */}
      <View style={styles.subTabWrapper}>
        <ScrollView
          ref={subTabScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.subTabScroll}
          contentContainerStyle={styles.subTabRow}
          keyboardShouldPersistTaps="handled"
          bounces={true}
          overScrollMode="always"
          onScroll={(e) => {
            const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
            const isEnd = layoutMeasurement.width + contentOffset.x >= contentSize.width - 25;
            setScrollAtEnd(isEnd);
          }}
          scrollEventThrottle={16}
        >
          {[
            { key: "IDENTITY", label: "Clinic Identity" },
            { key: "OPERATIONS", label: "Operations" },
            { key: "SCHEDULE", label: "Schedule" },
            { key: "HOLIDAY", label: "Leave & Holidays" },
            { key: "EXPERTISE", label: "Expertise" },
            { key: "STAFF", label: "Staff" },
            { key: "LEGAL", label: "Legal & Support" },
          ].map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.subTab, activeSubTab === t.key && styles.subTabActive]}
              onPress={() => {
                setActiveSubTab(t.key as any);
              }}
              activeOpacity={0.75}
            >
              <Text style={[styles.subTabText, activeSubTab === t.key && styles.subTabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {!scrollAtEnd && (
          <View pointerEvents="none" style={styles.trailingFade}>
            <Svg height="100%" width="100%">
              <Defs>
                <SvgGradient id="subTabFade" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
                  <Stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0.85" />
                  <Stop offset="1" stopColor="#FFFFFF" stopOpacity="1" />
                </SvgGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#subTabFade)" />
            </Svg>
            <View style={styles.scrollCueIcon}>
              <ChevronRight size={14} color={colors.textMuted} />
            </View>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* ── PENDING PROFILE CHANGE REQUESTS BANNER (Matching Web) ── */}
        {profileRequests.length > 0 && (
          <View style={styles.requestsBanner}>
            <View style={styles.requestsHeader}>
              <Clock size={16} color="#92400E" />
              <Text style={styles.requestsTitle}>Pending Profile Change Requests</Text>
            </View>
            <Text style={styles.requestsSub}>
              These fields require admin verification before updates take effect on patient portals:
            </Text>
            <View style={styles.requestsList}>
              {profileRequests.map((req: any, idx: number) => (
                <View key={req.id || idx} style={styles.requestItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.requestFieldLabel}>{req.fieldLabel || req.field}</Text>
                    <Text style={styles.requestValues}>
                      {req.oldValue || "—"} → <Text style={{ fontWeight: "700" }}>{req.newValue}</Text>
                    </Text>
                  </View>
                  <Badge
                    label={req.status === "PENDING" ? "Pending approval" : req.status === "APPROVED" ? "Approved" : "Rejected"}
                    variant={req.status === "PENDING" ? "warning" : req.status === "APPROVED" ? "success" : "destructive"}
                    size="sm"
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── SUBTAB 1: CLINIC IDENTITY & PHOTO (Matching Web) ── */}
        {activeSubTab === "IDENTITY" && (
          <View>
            <Card style={styles.cardSection}>
              <View style={styles.sectionTitleRow}>
                <Building2 size={18} color={colors.secondary} />
                <Text style={styles.sectionHeader}>Clinic Identity & Details</Text>
              </View>

              {isVerified && (
                <View style={styles.verifiedNotice}>
                  <ShieldCheck size={16} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.verifiedNoticeTitle}>Verified Clinic Location</Text>
                    <Text style={styles.verifiedNoticeSub}>
                      Core clinic details are verified. Contact support to request edits.
                    </Text>
                  </View>
                </View>
              )}

              {/* Clinic Photo Upload */}
              <Text style={styles.fieldLabel}>Clinic Photo</Text>
              <View style={styles.photoContainer}>
                {clinicImage ? (
                  <Image source={{ uri: clinicImage }} style={styles.clinicImagePreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Building2 size={36} color={colors.textMuted} />
                    <Text style={styles.photoPlaceholderText}>No clinic photo uploaded</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.uploadPhotoBtn}
                  onPress={handlePickClinicPhoto}
                  disabled={isUploadingPhoto}
                  activeOpacity={0.8}
                >
                  {isUploadingPhoto ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Camera size={14} color="#FFFFFF" />
                      <Text style={styles.uploadPhotoBtnText}>
                        {clinicImage ? "Change Photo" : "Upload Photo"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Clinic / Hospital Name */}
              <Input
                label={`Clinic / Hospital Name ${isVerified ? "(Locked)" : ""}`}
                value={hospitalName}
                onChangeText={setHospitalName}
                editable={!isVerified}
                placeholder="e.g. Apollo Clinic"
                containerStyle={{ marginBottom: 14 }}
              />

              {/* City */}
              <Input
                label={`City ${isVerified ? "(Locked)" : ""}`}
                value={city}
                onChangeText={setCity}
                editable={!isVerified}
                placeholder="e.g. Patna"
                containerStyle={{ marginBottom: 14 }}
              />

              {/* Full Address */}
              <Input
                label={`Full Address ${isVerified ? "(Locked)" : ""}`}
                value={address}
                onChangeText={setAddress}
                editable={!isVerified}
                placeholder="e.g. Flat 102, Bailey Road, Patna, Bihar"
                multiline
                containerStyle={{ marginBottom: 14 }}
              />

              <Button
                title="Save Clinic Identity"
                size="lg"
                onPress={handleSaveIdentity}
                loading={isSaving}
                icon={<Save size={18} color="#FFFFFF" />}
                style={styles.saveBtn}
              />
            </Card>
          </View>
        )}

        {/* ── SUBTAB 2: OPERATIONS ── */}
        {activeSubTab === "OPERATIONS" && (
          <View>
            <Card style={styles.cardSection}>
              <Text style={styles.sectionHeader}>Consultation Pricing & Timings</Text>

              {/* Consultation Fee */}
              <Input
                label="Standard Consultation Fee (₹ INR)"
                value={fee}
                onChangeText={setFee}
                keyboardType="number-pad"
                leftIcon={<Wallet size={16} color={colors.primary} />}
                containerStyle={{ marginBottom: 14 }}
              />

              {/* Average Consultation Duration */}
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

              {/* Online Booking Start Time (Clinic-wide Opening / Booking Window) */}
              <Input
                label="Online Booking Start Time (HH:MM)"
                value={bookingWindowStart}
                onChangeText={setBookingWindowStart}
                placeholder="08:00"
                leftIcon={<Clock size={16} color={colors.primary} />}
                containerStyle={{ marginBottom: 14 }}
              />

              {/* Emergency Consultation Slots */}
              <Input
                label="Emergency Consultation Slots"
                value={emergencySlots}
                onChangeText={setEmergencySlots}
                keyboardType="number-pad"
                containerStyle={{ marginBottom: 14 }}
              />

              {/* Emergency Consultation Fee */}
              <Input
                label="Emergency Consultation Fee (₹ INR)"
                value={emergencyFee}
                onChangeText={setEmergencyFee}
                keyboardType="number-pad"
                containerStyle={{ marginBottom: 14 }}
              />

              {/* Free Follow-up Window */}
              <Input
                label="Free Follow-up Window (Days)"
                value={followUpDays}
                onChangeText={setFollowUpDays}
                keyboardType="number-pad"
                placeholder="e.g. 7"
                containerStyle={{ marginBottom: 14 }}
              />

              {/* Informational Notice (Matching Web) */}
              <View style={styles.opNoticeBox}>
                <Text style={styles.opNoticeText}>
                  Note: Changes to fees, consultation times, or emergency slots will apply to new bookings. Daily OPD capacity is set per day under Weekly Operating Hours.
                </Text>
              </View>

              <Button
                title="Save Operational Controls"
                size="lg"
                onPress={handleSaveOperations}
                loading={isSaving}
                icon={<Save size={18} color="#FFFFFF" />}
                style={styles.saveBtn}
              />
            </Card>
          </View>
        )}

        {/* ── SUBTAB 3: SCHEDULE (Interactive per-day editor) ── */}
        {activeSubTab === "SCHEDULE" && (
          <WeeklyScheduleEditor
            initialSchedule={weeklySchedule as any}
            onSave={handleSaveSchedule}
            isSaving={isSaving}
          />
        )}

        {/* ── SUBTAB 4: LEAVE & HOLIDAY MANAGER (Matching Web) ── */}
        {activeSubTab === "HOLIDAY" && (
          <View>
            <Card style={styles.holidaySectionCard}>
              <View style={styles.sectionTitleRow}>
                <CalendarX size={20} color={colors.destructive} />
                <Text style={[styles.sectionHeader, { color: colors.destructive }]}>
                  Leave & Holiday Manager
                </Text>
              </View>
              <Text style={styles.holidaySub}>
                Mark the clinic closed for today to stop accepting new online or walk-in bookings. Current queue patients are informed.
              </Text>

              <Input
                label="Closure Reason (Optional)"
                placeholder="e.g. Attending Medical Conference / Personal Leave"
                value={holidayReason}
                onChangeText={setHolidayReason}
                containerStyle={{ marginBottom: 14 }}
              />

              <View style={styles.holidayActionRow}>
                <Button
                  title={isHolidayClosed ? "Reopen Clinic For Today" : "Mark Clinic Closed Today"}
                  variant={isHolidayClosed ? "secondary" : "destructive"}
                  size="lg"
                  onPress={() => handleToggleHoliday(!isHolidayClosed)}
                  loading={isSaving}
                  icon={<CalendarX size={18} color="#FFFFFF" />}
                  style={{ width: "100%" }}
                />
              </View>
            </Card>
          </View>
        )}

        {/* ── SUBTAB 5: EXPERTISE TAGS ── */}
        {activeSubTab === "EXPERTISE" && (
          <View>
            <Card style={styles.cardSection}>
              <Text style={styles.sectionHeader}>Medical Expertise & Treatments</Text>
              <Text style={styles.sectionSub}>Add symptoms, procedures, and conditions treated.</Text>

              <View style={styles.tagInputRow}>
                <View style={{ flex: 1 }}>
                  <Input
                    placeholder="e.g. Hypertension, Diabetes, Acne"
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
            </Card>
          </View>
        )}

        {/* ── SUBTAB 6: STAFF / OPERATORS ── */}
        {activeSubTab === "STAFF" && (
          <View>
            <Card style={styles.cardSection}>
              <Text style={styles.sectionHeader}>Clinic Reception & Queue Staff</Text>
              <Text style={styles.sectionSub}>
                Authorize assistants to issue walk-ins and call tokens from their own phone.
              </Text>

              <View style={styles.addOperatorCard}>
                <Text style={styles.addOpTitle}>Invite New Staff Member</Text>
                <Input
                  label="Staff Full Name"
                  placeholder="e.g. Ramesh Kumar"
                  value={newOpName}
                  onChangeText={setNewOpName}
                  containerStyle={{ marginBottom: 10 }}
                />
                <Input
                  label="Mobile Number"
                  placeholder="10-digit number"
                  keyboardType="phone-pad"
                  value={newOpPhone}
                  onChangeText={setNewOpPhone}
                  containerStyle={{ marginBottom: 14 }}
                />
                <Text style={styles.inputLabel}>Staff Role</Text>
                <View style={styles.rolePickerRow}>
                  {[
                    { key: "Operator", label: "Primary Operator" },
                    { key: "Receptionist", label: "Receptionist" },
                    { key: "Clinic Manager", label: "Clinic Manager" },
                  ].map((r) => (
                    <TouchableOpacity
                      key={r.key}
                      style={[
                        styles.roleChip,
                        newOpRole === r.key && styles.roleChipActive,
                      ]}
                      onPress={() => setNewOpRole(r.key as any)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.roleChipText,
                          newOpRole === r.key && styles.roleChipTextActive,
                        ]}
                      >
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Button
                  title="Send Staff Invitation"
                  size="md"
                  onPress={handleAddOperator}
                  loading={isSaving}
                  icon={<UserPlus size={16} color="#FFFFFF" />}
                />
              </View>

              <Text style={[styles.sectionHeader, { marginTop: 16 }]}>Active Clinic Staff</Text>
              {operators.length > 0 ? (
                operators.map((op) => (
                  <View key={op.id} style={styles.operatorRow}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <Text style={styles.opName}>{op.name}</Text>
                        <Badge variant="neutral" label={op.role || "Operator"} />
                      </View>
                      <Text style={styles.opPhone}>+91 {op.phone}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveOperator(op.id)}
                      style={styles.deleteOpBtn}
                    >
                      <Trash2 size={16} color={colors.destructive} />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.noStaffText}>No delegated staff members added yet.</Text>
              )}
            </Card>
          </View>
        )}

        {/* ── SUBTAB 7: LEGAL, SUPPORT & ACCOUNT COMPLIANCE ── */}
        {activeSubTab === "LEGAL" && (
          <View style={{ gap: 14 }}>
            {/* Legal & Compliance Card */}
            <Card style={styles.cardSection}>
              <Text style={styles.sectionHeader}>Legal &amp; Regulatory Compliance</Text>
              <Text style={styles.sectionSub}>
                Review provider terms, data protection policies, and medical liability disclaimers.
              </Text>

              <TouchableOpacity
                style={styles.legalRow}
                onPress={() => {
                  setLegalDocType("TERMS");
                  setLegalModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.legalIconBox, { backgroundColor: "#EFF6FF" }]}>
                  <Scale size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.legalRowTitle}>Terms of Service &amp; Partner Agreement</Text>
                  <Text style={styles.legalRowSub}>Intermediary safe harbor, doctor autonomy &amp; policies</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.legalRow}
                onPress={() => {
                  setLegalDocType("PRIVACY");
                  setLegalModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.legalIconBox, { backgroundColor: "#ECFDF5" }]}>
                  <ShieldCheck size={18} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.legalRowTitle}>Privacy &amp; Data Handling Policy</Text>
                  <Text style={styles.legalRowSub}>NMC credentials storage, patient token privacy &amp; retention</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.legalRow}
                onPress={() => {
                  setLegalDocType("DISCLAIMER");
                  setLegalModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.legalIconBox, { backgroundColor: "#FFF1F2" }]}>
                  <ShieldAlert size={18} color="#E11D48" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.legalRowTitle}>Medical &amp; Intermediary Disclaimer</Text>
                  <Text style={styles.legalRowSub}>Routine OPD scope &amp; emergency care exclusions</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </Card>

            {/* Help & Feedback Card */}
            <Card style={styles.cardSection}>
              <Text style={styles.sectionHeader}>Partner Help &amp; Product Feedback</Text>
              <Text style={styles.sectionSub}>
                Get operational support or suggest features directly to our engineering team.
              </Text>

              <TouchableOpacity
                style={styles.legalRow}
                onPress={() => setHelpModalVisible(true)}
                activeOpacity={0.7}
              >
                <View style={[styles.legalIconBox, { backgroundColor: "#F0FDF4" }]}>
                  <HelpCircle size={18} color="#15803D" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.legalRowTitle}>Help Desk &amp; FAQs</Text>
                  <Text style={styles.legalRowSub}>WhatsApp, email &amp; token queue guides</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.legalRow}
                onPress={() => setFeedbackModalVisible(true)}
                activeOpacity={0.7}
              >
                <View style={[styles.legalIconBox, { backgroundColor: "#FAF5FF" }]}>
                  <MessageSquare size={18} color="#9333EA" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.legalRowTitle}>Send Partner Feedback / Bug Report</Text>
                  <Text style={styles.legalRowSub}>Direct suggestion channel to product engineers</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </Card>

            {/* Danger Zone: Account Deletion */}
            <Card style={[styles.cardSection, { borderColor: "#FECDD3", backgroundColor: "#FFF8F8" }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <AlertTriangle size={18} color="#E11D48" />
                <Text style={[styles.sectionHeader, { color: "#9F1239", marginBottom: 0 }]}>Danger Zone</Text>
              </View>
              <Text style={[styles.sectionSub, { color: "#9F1239" }]}>
                Soft-delete unlists your clinic from public search, cancels pending tokens, and revokes staff access. Past completed records are preserved for 3-year statutory medical audit compliance.
              </Text>

              <TouchableOpacity
                style={styles.deleteAccountBtn}
                onPress={() => {
                  setDeleteConfirmationInput("");
                  setDeleteModalVisible(true);
                }}
                activeOpacity={0.8}
              >
                <Trash2 size={16} color="#FFFFFF" />
                <Text style={styles.deleteAccountBtnText}>Delete Practice Account</Text>
              </TouchableOpacity>
            </Card>
          </View>
        )}

        {/* Minimal App Footer Branding */}
        <AppFooterBranding />
      </ScrollView>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalCard}>
            <View style={styles.deleteModalHeader}>
              <View style={styles.deleteIconCircle}>
                <AlertTriangle size={24} color="#E11D48" />
              </View>
              <Text style={styles.deleteModalTitle}>Delete Practice Account?</Text>
            </View>

            <Text style={styles.deleteModalWarning}>
              This will immediately:{"\n"}
              • Unlist your clinic and doctor profile from public search{"\n"}
              • Cancel all active/pending patient queue tokens{"\n"}
              • Revoke staff and receptionist access{"\n\n"}
              To confirm, type <Text style={{ fontWeight: "700", color: "#E11D48" }}>DELETE</Text> below:
            </Text>

            <Input
              placeholder="Type DELETE to confirm"
              value={deleteConfirmationInput}
              onChangeText={(text) => setDeleteConfirmationInput(text.toUpperCase())}
              containerStyle={{ marginVertical: 14 }}
            />

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Button
                title="Cancel"
                variant="outline"
                size="md"
                onPress={() => setDeleteModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={isDeletingAccount ? "Deleting..." : "Confirm Delete"}
                variant="destructive"
                size="md"
                onPress={async () => {
                  if (deleteConfirmationInput.trim() !== "DELETE") {
                    Alert.alert("Confirmation Required", "Please type DELETE in capital letters.");
                    return;
                  }
                  setIsDeletingAccount(true);
                  try {
                    await doctorApi.deleteAccount("DELETE");
                    setDeleteModalVisible(false);
                    Alert.alert(
                      "Practice Closed",
                      "Your clinic has been unlisted and account deactivated.",
                      [
                        {
                          text: "OK",
                          onPress: () => {
                            useAuthStore.getState().clearAuth();
                          },
                        },
                      ]
                    );
                  } catch (err: any) {
                    Alert.alert("Error", err?.message || "Failed to delete account.");
                  } finally {
                    setIsDeletingAccount(false);
                  }
                }}
                disabled={deleteConfirmationInput.trim() !== "DELETE" || isDeletingAccount}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* In-App Legal Viewer Modal */}
      <LegalViewerModal
        visible={legalModalVisible}
        initialDoc={legalDocType}
        onClose={() => setLegalModalVisible(false)}
      />

      {/* In-App Help & Support Modal */}
      <HelpSupportModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
      />

      {/* In-App Doctor Feedback Modal */}
      <DoctorFeedbackModal
        visible={feedbackModalVisible}
        onClose={() => setFeedbackModalVisible(false)}
      />
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
  subTabWrapper: {
    position: "relative",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  subTabScroll: {
    maxHeight: 52,
  },
  subTabRow: {
    flexDirection: "row",
    paddingLeft: 16,
    paddingRight: 48,
    gap: 8,
    alignItems: "center",
    paddingVertical: 8,
  },
  subTab: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    backgroundColor: colors.mutedBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  subTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  subTabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "700",
    fontSize: 12,
    textTransform: "none",
  },
  subTabTextActive: {
    color: "#FFFFFF",
  },
  trailingFade: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 44,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  scrollCueIcon: {
    position: "absolute",
    right: 6,
    top: "50%",
    transform: [{ translateY: -7 }],
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 130,
  },
  cardSection: {
    padding: 16,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    marginBottom: 16,
    ...shadows.soft,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionHeader: {
    ...typography.titleSmall,
    color: colors.navy,
    fontWeight: "700",
  },
  sectionSub: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 14,
    textTransform: "none",
  },
  requestsBanner: {
    backgroundColor: "#FEF3C7",
    borderRadius: radius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FCD34D",
    marginBottom: 16,
  },
  requestsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  requestsTitle: {
    ...typography.titleSmall,
    fontSize: 13,
    color: "#92400E",
    fontWeight: "700",
  },
  requestsSub: {
    ...typography.caption,
    fontSize: 11,
    color: "#B45309",
    marginBottom: 10,
    textTransform: "none",
  },
  requestsList: {
    gap: 8,
  },
  requestItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  requestFieldLabel: {
    ...typography.caption,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  requestValues: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  verifiedNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.accent,
    padding: 10,
    borderRadius: radius.md,
    gap: 8,
    marginBottom: 14,
  },
  verifiedNoticeTitle: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  verifiedNoticeSub: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
    textTransform: "none",
  },
  fieldLabel: {
    ...typography.caption,
    fontWeight: "700",
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: "none",
  },
  photoContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  clinicImagePreview: {
    width: "100%",
    height: 160,
    borderRadius: radius.lg,
    marginBottom: 8,
  },
  photoPlaceholder: {
    width: "100%",
    height: 120,
    borderRadius: radius.lg,
    backgroundColor: colors.mutedBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  photoPlaceholderText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 6,
    textTransform: "none",
  },
  uploadPhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.md,
  },
  uploadPhotoBtnText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    textTransform: "none",
  },
  durationRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  durationBtn: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  durationBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },
  durationText: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: "none",
  },
  durationTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  holidaySectionCard: {
    padding: 16,
    borderRadius: radius.xl,
    backgroundColor: "#FFF8F8",
    borderColor: colors.destructiveBorder,
    borderWidth: 1,
    marginBottom: 16,
  },
  holidaySub: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 14,
    textTransform: "none",
  },
  holidayActionRow: {
    marginTop: 8,
  },
  tagInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tagBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    gap: 6,
  },
  tagText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 11,
    textTransform: "none",
  },
  tagRemove: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  addOperatorCard: {
    backgroundColor: colors.mutedBackground,
    padding: 12,
    borderRadius: radius.lg,
    marginBottom: 14,
  },
  addOpTitle: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    color: colors.navy,
    marginBottom: 8,
    textTransform: "none",
  },
  operatorRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 8,
  },
  opName: {
    ...typography.titleSmall,
    fontSize: 13,
    color: colors.textPrimary,
  },
  opPhone: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: "none",
  },
  deleteOpBtn: {
    padding: 6,
  },
  noStaffText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 8,
    textTransform: "none",
  },
  opNoticeBox: {
    backgroundColor: colors.accent,
    padding: 10,
    borderRadius: radius.md,
    marginBottom: 14,
  },
  opNoticeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: "none",
  },
  backButton: {
    padding: 6,
    borderRadius: radius.md,
    backgroundColor: colors.mutedBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  inputLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  rolePickerRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  roleChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
  },
  roleChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },
  roleChipText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
    textTransform: "none",
  },
  roleChipTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  saveBtn: {
    marginTop: 8,
    width: "100%",
  },
  legalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  legalIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  legalRowTitle: {
    ...typography.titleSmall,
    fontSize: 13,
    color: colors.textPrimary,
  },
  legalRowSub: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: "none",
  },
  deleteAccountBtn: {
    backgroundColor: "#E11D48",
    paddingVertical: 12,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  deleteAccountBtnText: {
    ...typography.button,
    fontSize: 13,
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  deleteModalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    width: "100%",
    maxWidth: 380,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  deleteModalHeader: {
    alignItems: "center",
    marginBottom: 12,
  },
  deleteIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFE4E6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  deleteModalTitle: {
    ...typography.titleMedium,
    fontSize: 17,
    color: "#9F1239",
  },
  deleteModalWarning: {
    ...typography.bodySmall,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});
