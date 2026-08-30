import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  BackHandler,
} from "react-native";
import { ScreenContainer } from "../../components/layout/ScreenContainer";
import { colors, typography, radius, shadows } from "../../theme";
import { BrandLogo } from "../../components/shared/BrandLogo";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { doctorApi } from "../../api/doctor";
import { uploadApi } from "../../api/upload";
import { authApi } from "../../api/auth";
import { useAuthStore } from "../../store/useAuthStore";
import {
  User,
  Building2,
  Calendar,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Upload,
  Clock,
  Check,
  Lock,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

export interface DoctorOnboardWizardProps {
  initialStep?: number;
  onComplete: () => void;
  onExit: () => void;
}

const MEDICAL_COUNCILS = [
  "Bihar Medical Council",
  "National Medical Commission (NMC)",
  "Medical Council of India (MCI)",
  "Delhi Medical Council",
  "Uttar Pradesh Medical Council",
  "West Bengal Medical Council",
  "Jharkhand Medical Council",
  "Other State Medical Council",
];

export const DoctorOnboardWizard: React.FC<DoctorOnboardWizardProps> = ({
  initialStep = 1,
  onComplete,
  onExit,
}) => {
  const { user, isAuthenticated, setAuth } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Doctor Identity & Council
  const [name, setName] = useState(user?.name || "");
  const [speciality, setSpeciality] = useState("General Physician");
  const [experience, setExperience] = useState("");
  const [qualifications, setQualifications] = useState("MBBS");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [medicalCouncil, setMedicalCouncil] = useState(MEDICAL_COUNCILS[0]);
  const [specialtiesList, setSpecialtiesList] = useState<string[]>([]);

  // Step 2: Clinic & Fee
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [clinicDistrict, setClinicDistrict] = useState("Jamui");
  const [clinicCity, setClinicCity] = useState("");
  const [clinicPincode, setClinicPincode] = useState("");
  const [consultationFee, setConsultationFee] = useState("300");

  // Step 3: Shift Schedule
  const [slotDuration, setSlotDuration] = useState("15");
  const [morningStart, setMorningStart] = useState("09:00");
  const [morningEnd, setMorningEnd] = useState("13:00");
  const [eveningStart, setEveningStart] = useState("17:00");
  const [eveningEnd, setEveningEnd] = useState("20:00");
  const [maxTokens, setMaxTokens] = useState("30");

  // Step 4: Documents & Photo
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [regDocUrl, setRegDocUrl] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    if (user?.name && !name) {
      setName(user.name);
    }
  }, [user]);

  useEffect(() => {
    const handleBack = () => {
      if (currentStep > 1) {
        setCurrentStep((prev) => prev - 1);
        return true;
      }
      onExit();
      return true;
    };
    const subscription = BackHandler.addEventListener("hardwareBackPress", handleBack);
    return () => subscription.remove();
  }, [currentStep, onExit]);

  useEffect(() => {
    doctorApi
      .getSpecialties()
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setSpecialtiesList(res.data.map((s) => s.name));
        }
      })
      .catch(() => {});
  }, []);

  const handleGoogleVerify = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.signInWithGoogle();
      if (res.success && res.user) {
        setAuth(res.user, res.token || "session_active");
        if (res.user.name && !name) {
          setName(res.user.name);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify Google account.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImage = async (type: "profile" | "regDoc") => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setIsLoading(true);
        const uploaded = await uploadApi.uploadFile(result.assets[0].uri);
        if (type === "profile") setProfilePhotoUrl(uploaded);
        if (type === "regDoc") setRegDocUrl(uploaded);
      }
    } catch (e: any) {
      Alert.alert("Upload Failed", e.message || "Could not upload image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep1 = async () => {
    if (!isAuthenticated) {
      setError("Please verify your Google account before proceeding.");
      return;
    }
    if (!name.trim() || !registrationNumber.trim()) {
      setError("Please enter your full name and medical registration number.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await doctorApi.submitOnboardStep1({
        name,
        speciality,
        experienceYears: parseInt(experience, 10) || 1,
        qualifications: qualifications.split(",").map((q) => q.trim()),
        registrationNumber,
        medicalCouncil,
      });
      setCurrentStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to save step 1.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep2 = async () => {
    if (!clinicName.trim() || !clinicAddress.trim()) {
      setError("Please provide your clinic name and address.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await doctorApi.submitOnboardStep2({
        clinicName,
        clinicAddress,
        clinicDistrict,
        clinicCity: clinicCity || clinicDistrict,
        clinicPincode,
        consultationFee: parseInt(consultationFee, 10) || 0,
      });
      setCurrentStep(3);
    } catch (err: any) {
      setError(err.message || "Failed to save step 2.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep3 = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const defaultDaySchedule = {
        enabled: true,
        shifts: [
          { enabled: true, start: morningStart, end: morningEnd, maxTokens: parseInt(maxTokens, 10) / 2 },
          { enabled: true, start: eveningStart, end: eveningEnd, maxTokens: parseInt(maxTokens, 10) / 2 },
        ],
      };

      const weeklySchedule = {
        monday: defaultDaySchedule,
        tuesday: defaultDaySchedule,
        wednesday: defaultDaySchedule,
        thursday: defaultDaySchedule,
        friday: defaultDaySchedule,
        saturday: defaultDaySchedule,
        sunday: { enabled: false, shifts: [] },
      };

      await doctorApi.submitOnboardStep3({
        weeklySchedule: weeklySchedule as any,
        averageConsultationMinutes: parseInt(slotDuration, 10) || 15,
      });
      setCurrentStep(4);
    } catch (err: any) {
      setError(err.message || "Failed to save schedule.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!acceptedTerms) {
      setError("Please agree to the JivniCare Doctor Network Terms.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await doctorApi.submitOnboardStep4({
        profilePhoto: profilePhotoUrl || undefined,
        registrationDocUrl: regDocUrl || undefined,
        acceptTerms: true,
      });
      onComplete();
    } catch (err: any) {
      setError(err.message || "Failed to submit verification application.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit} style={styles.iconButton}>
          <ArrowLeft size={20} color={colors.navy} />
        </TouchableOpacity>
        <BrandLogo size="sm" />
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>Step {currentStep} of 4</Text>
        </View>
      </View>

      {/* Step Indicator Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${(currentStep / 4) * 100}%` }]} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Error Banner */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* STEP 1: Medical Identity */}
          {currentStep === 1 && (
            <View>
              <Text style={styles.stepTitle}>Medical Credentials</Text>
              <Text style={styles.stepSubtitle}>
                Provide your professional qualifications for NMC verified directory listing.
              </Text>

              {/* Google Verification Status Card */}
              <Card style={styles.googleVerifyCard} variant="elevated">
                <View style={styles.googleVerifyRow}>
                  <View
                    style={[
                      styles.googleVerifyIconBox,
                      isAuthenticated && { backgroundColor: colors.secondaryLight },
                    ]}
                  >
                    {isAuthenticated ? (
                      <Check size={18} color={colors.secondary} />
                    ) : (
                      <Lock size={18} color={colors.primary} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.googleVerifyTitle}>
                      {isAuthenticated ? "Google Account Linked" : "Google Authentication Required"}
                    </Text>
                    <Text style={styles.googleVerifySub}>
                      {isAuthenticated && user?.email
                        ? user.email
                        : "Required to secure clinical dashboard"}
                    </Text>
                  </View>
                  {!isAuthenticated && (
                    <Button
                      title="Verify"
                      variant="primary"
                      size="sm"
                      loading={isLoading}
                      onPress={handleGoogleVerify}
                    />
                  )}
                </View>
              </Card>

              <Card style={styles.formCard}>
                <Input
                  label="Full Name (with Dr. prefix)"
                  placeholder="Dr. Rajesh Kumar"
                  value={name}
                  onChangeText={setName}
                  leftIcon={<User size={18} color={colors.primary} />}
                />

                <Text style={styles.fieldLabel}>Primary Specialization</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.specialityPillRow}
                >
                  {(specialtiesList.length > 0 ? specialtiesList : ["General Physician", "Dentist", "Cardiologist", "Pediatrician", "Dermatologist"]).map(
                    (s) => (
                      <TouchableOpacity
                        key={s}
                        style={[
                          styles.specialityPill,
                          speciality === s && styles.specialityPillActive,
                        ]}
                        onPress={() => setSpeciality(s)}
                      >
                        <Text
                          style={[
                            styles.specialityPillText,
                            speciality === s && styles.specialityPillTextActive,
                          ]}
                        >
                          {s}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </ScrollView>

                <Input
                  label="Years of Experience"
                  placeholder="e.g. 12"
                  value={experience}
                  onChangeText={setExperience}
                  keyboardType="numeric"
                  containerStyle={{ marginTop: 16 }}
                />

                <Input
                  label="Qualifications (comma separated)"
                  placeholder="MBBS, MD (Medicine)"
                  value={qualifications}
                  onChangeText={setQualifications}
                />

                <Input
                  label="Medical Registration Number"
                  placeholder="e.g. BMC-54892"
                  value={registrationNumber}
                  onChangeText={setRegistrationNumber}
                />

                <Text style={styles.fieldLabel}>State Medical Council</Text>
                <View style={styles.councilList}>
                  {MEDICAL_COUNCILS.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.councilItem,
                        medicalCouncil === c && styles.councilItemActive,
                      ]}
                      onPress={() => setMedicalCouncil(c)}
                    >
                      <Text
                        style={[
                          styles.councilText,
                          medicalCouncil === c && styles.councilTextActive,
                        ]}
                      >
                        {c}
                      </Text>
                      {medicalCouncil === c && (
                        <CheckCircle2 size={16} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>

              <Button
                title="Continue to Clinic Location"
                variant="primary"
                size="lg"
                onPress={handleNextStep1}
                loading={isLoading}
                icon={<ArrowRight size={18} color="#FFFFFF" />}
                iconPosition="right"
                style={{ marginTop: 20 }}
              />
            </View>
          )}

          {/* STEP 2: Clinic Location & Fee */}
          {currentStep === 2 && (
            <View>
              <Text style={styles.stepTitle}>Clinic Location & Fee</Text>
              <Text style={styles.stepSubtitle}>
                Patients find and navigate to your clinic using these location details.
              </Text>

              <Card style={styles.formCard}>
                <Input
                  label="Clinic / Hospital Name"
                  placeholder="Kumar Health Clinic"
                  value={clinicName}
                  onChangeText={setClinicName}
                  leftIcon={<Building2 size={18} color={colors.primary} />}
                />

                <Input
                  label="Clinic Address & Landmark"
                  placeholder="Near Station Road, Main Market"
                  value={clinicAddress}
                  onChangeText={setClinicAddress}
                  multiline
                />

                <Input
                  label="District"
                  placeholder="e.g. Jamui"
                  value={clinicDistrict}
                  onChangeText={setClinicDistrict}
                />

                <Input
                  label="City / Town"
                  placeholder="e.g. Jamui"
                  value={clinicCity}
                  onChangeText={setClinicCity}
                />

                <Input
                  label="Pincode"
                  placeholder="811307"
                  value={clinicPincode}
                  onChangeText={setClinicPincode}
                  keyboardType="numeric"
                />

                <Input
                  label="OPD Consultation Fee (₹)"
                  placeholder="300"
                  value={consultationFee}
                  onChangeText={setConsultationFee}
                  keyboardType="numeric"
                  helper="100% of patient fees are collected directly by you at your clinic."
                />
              </Card>

              <View style={styles.buttonRow}>
                <Button
                  title="Back"
                  variant="outline"
                  size="lg"
                  onPress={() => setCurrentStep(1)}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Continue to Schedule"
                  variant="primary"
                  size="lg"
                  onPress={handleNextStep2}
                  loading={isLoading}
                  style={{ flex: 2 }}
                />
              </View>
            </View>
          )}

          {/* STEP 3: Shift Schedule */}
          {currentStep === 3 && (
            <View>
              <Text style={styles.stepTitle}>OPD Shift Schedule</Text>
              <Text style={styles.stepSubtitle}>
                Configure your daily shifts to control token booking limits and estimated wait times.
              </Text>

              <Card style={styles.formCard}>
                <Input
                  label="Average Consultation Time (Minutes)"
                  placeholder="15"
                  value={slotDuration}
                  onChangeText={setSlotDuration}
                  keyboardType="numeric"
                  helper="Used to calculate real-time estimated waiting queue times."
                />

                <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Morning Shift</Text>
                <View style={styles.shiftRow}>
                  <Input
                    placeholder="09:00"
                    value={morningStart}
                    onChangeText={setMorningStart}
                    containerStyle={{ flex: 1 }}
                  />
                  <Text style={styles.toText}>to</Text>
                  <Input
                    placeholder="13:00"
                    value={morningEnd}
                    onChangeText={setMorningEnd}
                    containerStyle={{ flex: 1 }}
                  />
                </View>

                <Text style={styles.fieldLabel}>Evening Shift</Text>
                <View style={styles.shiftRow}>
                  <Input
                    placeholder="17:00"
                    value={eveningStart}
                    onChangeText={setEveningStart}
                    containerStyle={{ flex: 1 }}
                  />
                  <Text style={styles.toText}>to</Text>
                  <Input
                    placeholder="20:00"
                    value={eveningEnd}
                    onChangeText={setEveningEnd}
                    containerStyle={{ flex: 1 }}
                  />
                </View>

                <Input
                  label="Max Tokens per Day"
                  placeholder="30"
                  value={maxTokens}
                  onChangeText={setMaxTokens}
                  keyboardType="numeric"
                  containerStyle={{ marginTop: 10 }}
                />
              </Card>

              <View style={styles.buttonRow}>
                <Button
                  title="Back"
                  variant="outline"
                  size="lg"
                  onPress={() => setCurrentStep(2)}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Continue to Documents"
                  variant="primary"
                  size="lg"
                  onPress={handleNextStep3}
                  loading={isLoading}
                  style={{ flex: 2 }}
                />
              </View>
            </View>
          )}

          {/* STEP 4: Verification Documents */}
          {currentStep === 4 && (
            <View>
              <Text style={styles.stepTitle}>Verification & Photo</Text>
              <Text style={styles.stepSubtitle}>
                Upload your profile photo and medical degree registration for NMC validation.
              </Text>

              <Card style={styles.formCard}>
                {/* Profile Photo */}
                <Text style={styles.fieldLabel}>Doctor Profile Photo</Text>
                <TouchableOpacity
                  style={styles.uploadBox}
                  onPress={() => handlePickImage("profile")}
                >
                  <Upload size={24} color={colors.primary} />
                  <Text style={styles.uploadTitle}>
                    {profilePhotoUrl ? "Change Profile Photo" : "Upload Doctor Photo"}
                  </Text>
                  <Text style={styles.uploadSub}>JPEG, PNG up to 5MB</Text>
                </TouchableOpacity>

                {/* Registration Doc */}
                <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
                  Medical Council Registration Certificate
                </Text>
                <TouchableOpacity
                  style={styles.uploadBox}
                  onPress={() => handlePickImage("regDoc")}
                >
                  <Upload size={24} color={colors.secondary} />
                  <Text style={styles.uploadTitle}>
                    {regDocUrl ? "Change Registration Doc" : "Upload Certificate / Degree"}
                  </Text>
                  <Text style={styles.uploadSub}>PDF, JPEG or PNG</Text>
                </TouchableOpacity>

                {/* Terms Acceptance */}
                <TouchableOpacity
                  style={styles.termsRow}
                  activeOpacity={0.8}
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                >
                  <View style={[styles.checkbox, acceptedTerms && styles.checkboxActive]}>
                    {acceptedTerms && <CheckCircle2 size={16} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.termsText}>
                    I confirm that I am a registered medical practitioner and agree to the JivniCare Doctor Network Terms & DPDP Compliance Guidelines.
                  </Text>
                </TouchableOpacity>
              </Card>

              <View style={styles.buttonRow}>
                <Button
                  title="Back"
                  variant="outline"
                  size="lg"
                  onPress={() => setCurrentStep(3)}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Submit Application"
                  variant="primary"
                  size="lg"
                  onPress={handleFinalSubmit}
                  loading={isLoading}
                  style={{ flex: 2 }}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.mutedBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
  },
  stepBadgeText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primary,
    fontWeight: "700",
  },
  progressContainer: {
    height: 3,
    backgroundColor: colors.mutedBackground,
    width: "100%",
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.mutedBackground,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  stepTitle: {
    ...typography.titleMedium,
    color: colors.navy,
    marginBottom: 4,
  },
  stepSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: colors.destructiveBg,
    borderWidth: 1,
    borderColor: colors.destructiveBorder,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.destructive,
    fontWeight: "600",
  },
  googleVerifyCard: {
    padding: 14,
    marginBottom: 14,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },
  googleVerifyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  googleVerifyIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  googleVerifyTitle: {
    ...typography.titleSmall,
    fontSize: 13,
    color: colors.navy,
  },
  googleVerifySub: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: "none",
  },
  formCard: {
    padding: 18,
    borderRadius: radius.xl,
  },
  fieldLabel: {
    ...typography.bodySmall,
    color: colors.navy,
    fontWeight: "700",
    marginBottom: 8,
  },
  specialityPillRow: {
    gap: 8,
    paddingBottom: 4,
  },
  specialityPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.mutedBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  specialityPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  specialityPillText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
    textTransform: "none",
  },
  specialityPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  councilList: {
    gap: 6,
  },
  councilItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.mutedBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  councilItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  councilText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  councilTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  shiftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  toText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontWeight: "600",
    paddingBottom: 16,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.navyBorder,
    borderRadius: radius.lg,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.mutedBackground,
  },
  uploadTitle: {
    ...typography.titleSmall,
    fontSize: 13,
    color: colors.navy,
    marginTop: 8,
  },
  uploadSub: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: "none",
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 18,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.navyBorder,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  termsText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
    textTransform: "none",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
});
