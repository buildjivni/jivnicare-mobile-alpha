import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "../../components/layout/ScreenContainer";
import { colors, typography, radius, shadows } from "../../theme";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { useAuthStore } from "../../store/useAuthStore";
import { doctorApi } from "../../api/doctor";
import { uploadApi } from "../../api/upload";
import { DEFAULT_API_BASE_URL } from "../../api/client";
import * as ImagePicker from "expo-image-picker";
import {
  User,
  Building2,
  MapPin,
  ShieldCheck,
  Share2,
  QrCode,
  LogOut,
  Upload,
  Lock,
  Edit3,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  Users,
  Award,
  BookOpen,
} from "lucide-react-native";

export interface DoctorProfileScreenProps {
  onLogout: () => void;
}

export const DoctorProfileScreen: React.FC<DoctorProfileScreenProps> = ({
  onLogout,
}) => {
  const { profile, fetchWorkspace } = useWorkspaceStore();
  const [isUploading, setIsUploading] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestedChanges, setRequestedChanges] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Editable Profile Fields
  const [bio, setBio] = useState(profile?.bio || "");
  const [lifetimePatients, setLifetimePatients] = useState(
    profile?.lifetimePatientsDeclaration || ""
  );
  const [qualifications, setQualifications] = useState(
    profile?.qualifications || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  // Pending Profile Approvals
  const [profileRequests, setProfileRequests] = useState<any[]>([]);

  const isVerified = profile?.verificationStatus === "VERIFIED";

  // Sync profile when store updates
  useEffect(() => {
    if (profile) {
      setBio(profile.bio || "");
      setLifetimePatients(profile.lifetimePatientsDeclaration || "");
      setQualifications(profile.qualifications || "");
    }
  }, [profile]);

  // Load pending profile approvals
  const loadProfileRequests = async () => {
    try {
      const res = await doctorApi.getProfileUpdateRequests();
      setProfileRequests(res.requests || []);
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    loadProfileRequests();
  }, []);

  const handlePickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setIsUploading(true);
        const uploadedUrl = await uploadApi.uploadFile(result.assets[0].uri);
        await doctorApi.updateProfile({ profilePhoto: uploadedUrl });
        await fetchWorkspace();
        Alert.alert("Success", "Profile photo updated successfully.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to upload photo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleShareProfile = () => {
    if (!profile?.slug && !profile?.id) return;
    const link = `${DEFAULT_API_BASE_URL}/doctors/${profile.slug || profile.id}`;
    const text = `Book your OPD appointment with ${profile.name} on JivniCare: ${link}`;
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(text)}`).catch(() => {
      Linking.openURL(`https://wa.me/?text=${encodeURIComponent(text)}`);
    });
  };

  const handleDownloadQrSticker = () => {
    Linking.openURL(`${DEFAULT_API_BASE_URL}/api/doctor/qr-sticker`);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const payload: any = {
        bio: bio.trim(),
        lifetimePatientsDeclaration: lifetimePatients
          ? parseInt(lifetimePatients, 10) || null
          : null,
      };

      if (qualifications.trim()) {
        payload.qualifications = qualifications.trim();
      }

      await doctorApi.updateSettings(payload);
      await fetchWorkspace();
      await loadProfileRequests();
      Alert.alert("Success", "Doctor profile details updated successfully.");
    } catch (e: any) {
      Alert.alert("Save Failed", e.message || "Could not update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitLockedRequest = async () => {
    if (!requestedChanges.trim()) {
      Alert.alert("Empty Request", "Please describe the changes you want to make.");
      return;
    }
    setIsSubmittingRequest(true);
    try {
      Alert.alert(
        "Request Submitted",
        "Your profile update request has been sent for admin verification."
      );
      setIsRequestModalOpen(false);
      setRequestedChanges("");
      await loadProfileRequests();
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <ScreenContainer style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Title */}
        <View style={styles.screenHeader}>
          <Text style={styles.title}>Doctor Profile</Text>
          <Text style={styles.subtitle}>
            Manage public bio, credentials & verified medical registration
          </Text>
        </View>

        {/* ── 1. PENDING PROFILE APPROVALS BANNER (Matching Web) ── */}
        {profileRequests.length > 0 && (
          <View style={styles.requestsBanner}>
            <View style={styles.requestsHeader}>
              <Clock size={16} color="#92400E" />
              <Text style={styles.requestsTitle}>Pending Profile Approvals</Text>
            </View>
            <Text style={styles.requestsSub}>
              These credential updates require admin verification before taking effect:
            </Text>
            <View style={styles.requestsList}>
              {profileRequests.map((req: any, idx: number) => (
                <View key={req.id || `${req.field}-${idx}`} style={styles.requestItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.requestFieldLabel}>
                      {req.fieldLabel || req.field}
                    </Text>
                    <Text style={styles.requestChangeText} numberOfLines={1}>
                      {req.oldValue || "—"} → {req.newValue}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      req.status === "APPROVED"
                        ? styles.statusPillApproved
                        : req.status === "REJECTED"
                        ? styles.statusPillRejected
                        : styles.statusPillPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        req.status === "APPROVED"
                          ? styles.statusPillTextApproved
                          : req.status === "REJECTED"
                          ? styles.statusPillTextRejected
                          : styles.statusPillTextPending,
                      ]}
                    >
                      {req.status === "PENDING" ? "Pending" : req.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Verified Healthcare Identity Callout */}
        <View style={styles.verifiedNotice}>
          <ShieldCheck size={18} color={colors.primary} style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.verifiedNoticeTitle}>Verified Healthcare Identity</Text>
            <Text style={styles.verifiedNoticeText}>
              Core identity fields (Full Name, Reg No, Medical Council) are locked to protect patient trust. Short biography and career statistics are safe to edit instantly.
            </Text>
          </View>
        </View>

        {/* Header Profile Card */}
        <Card style={styles.profileHeaderCard}>
          <TouchableOpacity
            onPress={handlePickPhoto}
            style={styles.avatarContainer}
            activeOpacity={0.8}
            disabled={isUploading}
          >
            {profile?.profileImage ? (
              <Image source={{ uri: profile.profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : "D"}
                </Text>
              </View>
            )}
            <View style={styles.cameraIconBadge}>
              {isUploading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Upload size={12} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.doctorName}>{profile?.name || "Doctor Profile"}</Text>
          <Text style={styles.doctorSpecialty}>
            {profile?.specialty || "General Medicine"} • {profile?.qualifications || "MBBS"}
          </Text>

          <Badge
            label={isVerified ? "NMC Verified Doctor" : "Verification Pending"}
            variant={isVerified ? "success" : "warning"}
            size="md"
            style={{ marginTop: 8 }}
          />
        </Card>

        {/* Public Sharing & QR Sticker Deck */}
        <View style={styles.actionCardRow}>
          <TouchableOpacity style={styles.quickShareCard} onPress={handleShareProfile}>
            <Share2 size={20} color={colors.primary} />
            <Text style={styles.shareTitle}>Share Link</Text>
            <Text style={styles.shareSub}>WhatsApp booking</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickShareCard} onPress={handleDownloadQrSticker}>
            <QrCode size={20} color={colors.secondary} />
            <Text style={[styles.shareTitle, { color: colors.secondary }]}>Clinic QR</Text>
            <Text style={styles.shareSub}>Print PDF sticker</Text>
          </TouchableOpacity>
        </View>

        {/* ── 2. EDITABLE PUBLIC PROFILE & CAREER STATS ── */}
        <Card style={styles.infoSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.iconHeadingRow}>
              <BookOpen size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Public Bio & Career Profile</Text>
            </View>
            <Badge label="Instant Update" variant="neutral" size="sm" />
          </View>

          {/* Short Biography */}
          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>Short Biography</Text>
            <TextInput
              style={styles.bioTextarea}
              placeholder="e.g. Senior consultant with extensive clinical experience in preventive and chronic care management..."
              placeholderTextColor={colors.textMuted}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.fieldHelperText}>
              This is visible on your public patient booking profile. Safe to edit instantly.
            </Text>
          </View>

          {/* Declared Career Patients */}
          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>Declared Career Patients</Text>
            <Input
              placeholder="e.g. 5000"
              value={lifetimePatients}
              onChangeText={setLifetimePatients}
              keyboardType="number-pad"
              leftIcon={<Users size={16} color={colors.primary} />}
              containerStyle={{ marginBottom: 4 }}
            />
            <Text style={styles.fieldHelperText}>
              Estimated career patients treated across your entire practice.
            </Text>
          </View>

          {/* Additive Qualifications */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelWithBadgeRow}>
              <Text style={styles.inputLabel}>Qualifications</Text>
              {isVerified && (
                <View style={styles.additiveBadge}>
                  <Text style={styles.additiveBadgeText}>additive only</Text>
                </View>
              )}
            </View>
            <Input
              placeholder="e.g. MBBS, MD, DNB"
              value={qualifications}
              onChangeText={setQualifications}
              leftIcon={<Award size={16} color={colors.secondary} />}
              containerStyle={{ marginBottom: 4 }}
            />
            <Text style={styles.fieldHelperText}>
              {isVerified
                ? "Existing verified qualifications remain locked; new qualifications appended here will be added to your record."
                : "Enter degrees, diplomas, and fellowships separated by commas."}
            </Text>
          </View>

          {/* Save Profile Button */}
          <Button
            title="Save & Update Profile"
            size="lg"
            onPress={handleSaveProfile}
            loading={isSaving}
            icon={<Save size={18} color="#FFFFFF" />}
            style={styles.saveProfileBtn}
          />
        </Card>

        {/* ── 3. LOCKED MEDICAL CREDENTIALS ── */}
        <Card style={styles.infoSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Medical Council Credentials</Text>
            {isVerified && (
              <TouchableOpacity
                style={styles.requestEditBtn}
                onPress={() => setIsRequestModalOpen(true)}
              >
                <Lock size={12} color={colors.primary} />
                <Text style={styles.requestEditText}>Request Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Registration No.</Text>
            <Text style={styles.infoValue}>{profile?.regNumber || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Medical Council</Text>
            <Text style={styles.infoValue}>
              {profile?.medicalCouncil || "NMC / State Council"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Experience</Text>
            <Text style={styles.infoValue}>{profile?.experience || "0"} Years</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Primary Specialty</Text>
            <Text style={styles.infoValue}>{profile?.specialty || "Not set"}</Text>
          </View>
        </Card>

        {/* Clinic & Location Details */}
        <Card style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Clinic Facility</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Clinic Name</Text>
            <Text style={styles.infoValue}>{profile?.hospitalName || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{profile?.address || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>City & District</Text>
            <Text style={styles.infoValue}>
              {profile?.city || ""}{profile?.district ? `, ${profile.district}` : ""}
            </Text>
          </View>
        </Card>

        {/* Logout Button */}
        <Button
          title="Sign Out of Doctor Session"
          variant="outline"
          size="lg"
          onPress={onLogout}
          icon={<LogOut size={16} color={colors.destructive} />}
          textStyle={{ color: colors.destructive }}
          style={styles.logoutBtn}
        />
      </ScrollView>

      {/* Locked Field Request Modal */}
      <Modal
        visible={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Profile Update Request"
        subtitle="Medical Council compliance requires admin verification for certified credentials."
        footer={
          <Button
            title="Submit Change Request"
            size="lg"
            onPress={handleSubmitLockedRequest}
            loading={isSubmittingRequest}
            style={{ width: "100%" }}
          />
        }
      >
        <Input
          label="Details of requested changes"
          placeholder="e.g. Updated clinic address or registration renewal"
          value={requestedChanges}
          onChangeText={setRequestedChanges}
          multiline
        />
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 130,
  },
  screenHeader: {
    marginBottom: 14,
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
    marginTop: 2,
  },
  requestsBanner: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: radius.xl,
    padding: 14,
    marginBottom: 14,
  },
  requestsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  requestsTitle: {
    ...typography.caption,
    fontWeight: "900",
    color: "#92400E",
    fontSize: 12,
    textTransform: "none",
  },
  requestsSub: {
    ...typography.caption,
    color: "#B45309",
    fontSize: 11,
    marginBottom: 8,
    textTransform: "none",
  },
  requestsList: {
    gap: 6,
  },
  requestItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#FEF3C7",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  requestFieldLabel: {
    ...typography.caption,
    fontWeight: "800",
    color: colors.navy,
    fontSize: 12,
    textTransform: "none",
  },
  requestChangeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    textTransform: "none",
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  statusPillPending: {
    backgroundColor: "#FEF3C7",
  },
  statusPillApproved: {
    backgroundColor: "#D1FAE5",
  },
  statusPillRejected: {
    backgroundColor: "#FEE2E2",
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  statusPillTextPending: {
    color: "#92400E",
  },
  statusPillTextApproved: {
    color: "#065F46",
  },
  statusPillTextRejected: {
    color: "#991B1B",
  },
  verifiedNotice: {
    flexDirection: "row",
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: radius.xl,
    padding: 14,
    gap: 10,
    marginBottom: 14,
  },
  verifiedNoticeTitle: {
    ...typography.titleSmall,
    fontSize: 12,
    color: colors.navy,
  },
  verifiedNoticeText: {
    ...typography.caption,
    fontSize: 10.5,
    color: colors.textSecondary,
    textTransform: "none",
    marginTop: 2,
    lineHeight: 15,
  },
  profileHeaderCard: {
    alignItems: "center",
    padding: 20,
    marginBottom: 14,
    borderRadius: radius.xl,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  avatarInitial: {
    ...typography.titleLarge,
    color: "#FFFFFF",
    fontSize: 28,
  },
  cameraIconBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  doctorName: {
    ...typography.titleMedium,
    color: colors.navy,
  },
  doctorSpecialty: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionCardRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  quickShareCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.soft,
  },
  shareTitle: {
    ...typography.titleSmall,
    color: colors.primary,
    marginTop: 6,
    fontSize: 13,
  },
  shareSub: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
    textTransform: "none",
  },
  infoSection: {
    padding: 16,
    marginBottom: 14,
    borderRadius: radius.xl,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  iconHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    ...typography.titleSmall,
    color: colors.navy,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    ...typography.caption,
    fontWeight: "800",
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  labelWithBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  additiveBadge: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  additiveBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#047857",
  },
  bioTextarea: {
    minHeight: 84,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    padding: 12,
    fontSize: 13,
    color: colors.navy,
    backgroundColor: colors.mutedBackground,
    marginBottom: 4,
  },
  fieldHelperText: {
    ...typography.caption,
    fontSize: 10.5,
    color: colors.textMuted,
    textTransform: "none",
    lineHeight: 14,
  },
  saveProfileBtn: {
    marginTop: 8,
    borderRadius: radius.xl,
  },
  requestEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
  },
  requestEditText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.primary,
    fontWeight: "700",
    textTransform: "none",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  infoLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.bodySmall,
    color: colors.navy,
    fontWeight: "600",
  },
  logoutBtn: {
    marginTop: 10,
    marginBottom: 20,
    borderColor: colors.destructive,
  },
});
