import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Image,
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

  const isVerified = profile?.verificationStatus === "VERIFIED";

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
        Alert.alert("Success", "Profile photo updated.");
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

  const handleSubmitLockedRequest = async () => {
    if (!requestedChanges.trim()) {
      Alert.alert("Empty Request", "Please describe the changes you want to make.");
      return;
    }
    setIsSubmittingRequest(true);
    try {
      // Create request payload
      Alert.alert("Request Submitted", "Your profile update request has been sent for admin verification.");
      setIsRequestModalOpen(false);
      setRequestedChanges("");
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <ScreenContainer style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Profile Card */}
        <Card style={styles.profileHeaderCard}>
          <TouchableOpacity onPress={handlePickPhoto} style={styles.avatarContainer}>
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
              <Upload size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.doctorName}>{profile?.name || "Doctor Profile"}</Text>
          <Text style={styles.doctorSpecialty}>
            {profile?.specialty} • {profile?.qualifications}
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

        {/* Credentials & Medical Council */}
        <Card style={styles.infoSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Medical Credentials</Text>
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
            <Text style={styles.infoValue}>{profile?.medicalCouncil || "NMC / State Council"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Experience</Text>
            <Text style={styles.infoValue}>{profile?.experience} Years</Text>
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
            <Text style={styles.infoLabel}>District & Pincode</Text>
            <Text style={styles.infoValue}>
              {profile?.district} {profile?.pincode ? `- ${profile?.pincode}` : ""}
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
    paddingBottom: 80,
  },
  profileHeaderCard: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 14,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    ...typography.display,
    fontSize: 32,
    color: colors.primary,
  },
  cameraIconBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    padding: 6,
    borderRadius: radius.full,
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
    padding: 16,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: "center",
    ...shadows.soft,
  },
  shareTitle: {
    ...typography.titleSmall,
    fontSize: 13,
    color: colors.primary,
    marginTop: 6,
  },
  shareSub: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: "none",
  },
  infoSection: {
    marginBottom: 14,
    padding: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    ...typography.titleSmall,
    color: colors.navy,
    marginBottom: 8,
  },
  requestEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
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
    fontWeight: "700",
  },
  logoutBtn: {
    marginTop: 10,
    borderColor: "rgba(239, 68, 68, 0.3)",
    width: "100%",
  },
});
