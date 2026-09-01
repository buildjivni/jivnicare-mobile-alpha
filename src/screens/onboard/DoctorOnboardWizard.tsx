import React, { useState, useEffect, useRef } from "react";
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
  Switch,
  Modal,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { ScreenContainer } from "../../components/layout/ScreenContainer";
import { colors, typography, radius } from "../../theme";
import { BrandLogo } from "../../components/shared/BrandLogo";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { doctorApi } from "../../api/doctor";
import { uploadApi } from "../../api/upload";
import { authApi } from "../../api/auth";
import { apiClient } from "../../api/client";
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
  Check,
  Lock,
  Trash2,
  AlertCircle,
  Phone,
  DollarSign,
  Zap,
  MapPin,
  RefreshCw,
  ChevronDown,
  X,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

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

const GENDERS = ["Male", "Female", "Other"];

const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export const DoctorOnboardWizard: React.FC<DoctorOnboardWizardProps> = ({
  initialStep = 1,
  onComplete,
  onExit,
}) => {
  const { user, isAuthenticated, setAuth } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isStepLoading, setIsStepLoading] = useState(false);
  const [isDocUploading, setIsDocUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [specialtiesList, setSpecialtiesList] = useState<string[]>([]);
  const isHydratedRef = useRef(false);

  const [fullName, setFullName] = useState(user?.name || "");
  const [contactNumber, setContactNumber] = useState("");
  const [speciality, setSpeciality] = useState("General Physician");

  const [practiceName, setPracticeName] = useState("");
  const [practiceAddress, setPracticeAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "success" | "error">("idle");
  const [gpsErrorMessage, setGpsErrorMessage] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [operatorMobile, setOperatorMobile] = useState("");
  const [receptionist1Name, setReceptionist1Name] = useState("");
  const [receptionist1Phone, setReceptionist1Phone] = useState("");
  const [receptionist2Name, setReceptionist2Name] = useState("");
  const [receptionist2Phone, setReceptionist2Phone] = useState("");
  const [receptionist3Name, setReceptionist3Name] = useState("");
  const [receptionist3Phone, setReceptionist3Phone] = useState("");
  const [visibleReceptionistCount, setVisibleReceptionistCount] = useState(0);

  const [medicalRegistrationNumber, setRegistrationNumber] = useState("");
  const [medicalCouncil, setMedicalCouncil] = useState(MEDICAL_COUNCILS[0]);
  const [otherCouncilName, setOtherCouncilName] = useState("");
  const [isCouncilModalVisible, setIsCouncilModalVisible] = useState(false);
  const [uploadingField, setUploadingField] = useState<"profile" | "clinic" | "degree" | "nmc" | null>(null);
  const [registrationYear, setRegistrationYear] = useState("");
  const [experience, setExperience] = useState("");
  const [qualifications, setQualifications] = useState("MBBS");
  const [gender, setGender] = useState("Male");
  const [languages, setLanguages] = useState("Hindi, English");
  const [bio, setBio] = useState("");
  const [lifetimePatientsDeclaration, setLifetimePatientsDeclaration] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [clinicPhotoUrl, setClinicPhotoUrl] = useState<string | null>(null);
  const [degreeCertificateUrl, setDegreeCertificateUrl] = useState<string | null>(null);
  const [nmcCertificateUrl, setNmcCertificateUrl] = useState<string | null>(null);

  const [consultationFee, setConsultationFee] = useState("400");
  const [emergencyAvailable, setEmergencyAvailable] = useState(false);
  const [emergencyFee, setEmergencyFee] = useState("500");
  const [bookingStartTime, setBookingStartTime] = useState("08:00");
  const [weeklySchedule, setWeeklySchedule] = useState<
    Record<string, { isOpen: boolean; start: string; end: string; maxPatients: number }>
  >({
    monday: { isOpen: true, start: "09:00", end: "17:00", maxPatients: 20 },
    tuesday: { isOpen: true, start: "09:00", end: "17:00", maxPatients: 20 },
    wednesday: { isOpen: true, start: "09:00", end: "17:00", maxPatients: 20 },
    thursday: { isOpen: true, start: "09:00", end: "17:00", maxPatients: 20 },
    friday: { isOpen: true, start: "09:00", end: "17:00", maxPatients: 20 },
    saturday: { isOpen: true, start: "09:00", end: "17:00", maxPatients: 20 },
    sunday: { isOpen: false, start: "09:00", end: "14:00", maxPatients: 0 },
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const storageKey = user?.id ? `jc_onboard_draft_${user.id}` : user?.email ? `jc_onboard_draft_${user.email}` : "jc_onboard_draft_guest";

  useEffect(() => {
    const hydrateDraft = async () => {
      try {
        let savedDraftStr = await SecureStore.getItemAsync(storageKey);
        if (!savedDraftStr) {
          savedDraftStr = await SecureStore.getItemAsync("jc_doctor_onboarding_master_draft");
        }
        if (!savedDraftStr) {
          savedDraftStr = await SecureStore.getItemAsync("jc_onboard_draft_guest");
        }
        if (savedDraftStr) {
          const draft = JSON.parse(savedDraftStr);
          if (draft.step) setCurrentStep(draft.step);
          if (draft.fullName) setFullName(draft.fullName);
          if (draft.contactNumber) setContactNumber(draft.contactNumber);
          if (draft.speciality) setSpeciality(draft.speciality);
          if (draft.practiceName) setPracticeName(draft.practiceName);
          if (draft.practiceAddress) setPracticeAddress(draft.practiceAddress);
          if (draft.district) setDistrict(draft.district);
          if (draft.city) setCity(draft.city);
          if (draft.state) setState(draft.state);
          if (draft.pincode) setPincode(draft.pincode);
          if (draft.latitude !== undefined) setLatitude(draft.latitude);
          if (draft.longitude !== undefined) setLongitude(draft.longitude);
          if (draft.operatorName) setOperatorName(draft.operatorName);
          if (draft.operatorMobile) setOperatorMobile(draft.operatorMobile);
          if (draft.receptionist1Name) setReceptionist1Name(draft.receptionist1Name);
          if (draft.receptionist1Phone) setReceptionist1Phone(draft.receptionist1Phone);
          if (draft.receptionist2Name) setReceptionist2Name(draft.receptionist2Name);
          if (draft.receptionist2Phone) setReceptionist2Phone(draft.receptionist2Phone);
          if (draft.receptionist3Name) setReceptionist3Name(draft.receptionist3Name);
          if (draft.receptionist3Phone) setReceptionist3Phone(draft.receptionist3Phone);
          if (draft.visibleReceptionistCount !== undefined) setVisibleReceptionistCount(draft.visibleReceptionistCount);
          if (draft.medicalRegistrationNumber) setRegistrationNumber(draft.medicalRegistrationNumber);
          if (draft.medicalCouncil) setMedicalCouncil(draft.medicalCouncil);
          if (draft.otherCouncilName) setOtherCouncilName(draft.otherCouncilName);
          if (draft.registrationYear) setRegistrationYear(draft.registrationYear);
          if (draft.experience) setExperience(draft.experience);
          if (draft.qualifications) setQualifications(draft.qualifications);
          if (draft.gender) setGender(draft.gender);
          if (draft.languages) setLanguages(draft.languages);
          if (draft.bio) setBio(draft.bio);
          if (draft.lifetimePatientsDeclaration) setLifetimePatientsDeclaration(draft.lifetimePatientsDeclaration);
          if (draft.profilePhotoUrl) setProfilePhotoUrl(draft.profilePhotoUrl);
          if (draft.clinicPhotoUrl) setClinicPhotoUrl(draft.clinicPhotoUrl);
          if (draft.degreeCertificateUrl) setDegreeCertificateUrl(draft.degreeCertificateUrl);
          if (draft.nmcCertificateUrl) setNmcCertificateUrl(draft.nmcCertificateUrl);
          if (draft.consultationFee) setConsultationFee(draft.consultationFee);
          if (draft.emergencyAvailable !== undefined) setEmergencyAvailable(draft.emergencyAvailable);
          if (draft.emergencyFee) setEmergencyFee(draft.emergencyFee);
          if (draft.bookingStartTime) setBookingStartTime(draft.bookingStartTime);
          if (draft.weeklySchedule) setWeeklySchedule(draft.weeklySchedule);
        }
      } catch (e) {
      } finally {
        isHydratedRef.current = true;
      }
    };
    hydrateDraft();
  }, [storageKey]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    const timer = setTimeout(() => {
      const draftPayload = {
        step: currentStep, fullName, contactNumber, speciality, practiceName, practiceAddress, district, city, state, pincode, latitude, longitude, operatorName, operatorMobile, receptionist1Name, receptionist1Phone, receptionist2Name, receptionist2Phone, receptionist3Name, receptionist3Phone, visibleReceptionistCount, medicalRegistrationNumber, medicalCouncil, otherCouncilName, registrationYear, experience, qualifications, gender, languages, bio, lifetimePatientsDeclaration, profilePhotoUrl, clinicPhotoUrl, degreeCertificateUrl, nmcCertificateUrl, consultationFee, emergencyAvailable, emergencyFee, bookingStartTime, weeklySchedule,
      };
      const json = JSON.stringify(draftPayload);
      SecureStore.setItemAsync(storageKey, json).catch(() => {});
      SecureStore.setItemAsync("jc_doctor_onboarding_master_draft", json).catch(() => {});
    }, 400);
    return () => clearTimeout(timer);
  }, [currentStep, fullName, contactNumber, speciality, practiceName, practiceAddress, district, city, state, pincode, latitude, longitude, operatorName, operatorMobile, receptionist1Name, receptionist1Phone, receptionist2Name, receptionist2Phone, receptionist3Name, receptionist3Phone, visibleReceptionistCount, medicalRegistrationNumber, medicalCouncil, otherCouncilName, registrationYear, experience, qualifications, gender, languages, bio, lifetimePatientsDeclaration, profilePhotoUrl, clinicPhotoUrl, degreeCertificateUrl, nmcCertificateUrl, consultationFee, emergencyAvailable, emergencyFee, bookingStartTime, weeklySchedule, storageKey]);

  useEffect(() => {
    setError(null);
  }, [currentStep]);

  useEffect(() => {
    const handleBack = () => {
      if (currentStep > 1) {
        setCurrentStep((prev) => prev - 1);
        return true;
      }
      onExit();
      return true;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", handleBack);
    return () => sub.remove();
  }, [currentStep, onExit]);

  useEffect(() => {
    doctorApi.getSpecialties().then((res) => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setSpecialtiesList(res.data.map((s) => s.name));
      }
    }).catch(() => {});
  }, []);

  const handleFetchGPSLocation = async () => {
    setGpsLoading(true);
    setGpsStatus("idle");
    setGpsErrorMessage("");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setGpsErrorMessage("Location permission denied. Please allow location access or type manually.");
        setGpsStatus("error");
        setGpsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const lat = location.coords.latitude;
      const lng = location.coords.longitude;
      setLatitude(lat);
      setLongitude(lng);

      try {
        const geoRes = await apiClient<{
          success: boolean;
          practiceAddress?: string;
          city?: string;
          state?: string;
          district?: string;
          pincode?: string;
        }>(`/api/public/reverse-geocode?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`);

        if (geoRes?.success) {
          if (geoRes.practiceAddress) setPracticeAddress(geoRes.practiceAddress);
          if (geoRes.city) setCity(geoRes.city);
          if (geoRes.district) setDistrict(geoRes.district);
          if (geoRes.state) setState(geoRes.state);
          if (geoRes.pincode) setPincode(geoRes.pincode);
          setGpsStatus("success");
        } else {
          setGpsStatus("success");
        }
      } catch (err: any) {
        setGpsStatus("success");
      }
    } catch (err: any) {
      setGpsErrorMessage(err.message || "Unable to retrieve GPS coordinates. Please enter location manually.");
      setGpsStatus("error");
    } finally {
      setGpsLoading(false);
    }
  };

  const handleGoogleVerify = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      const res = await authApi.signInWithGoogle();
      if (res.success && res.user) {
        setAuth(res.user, res.token || "session_active");
        if (res.user.name && !fullName) setFullName(res.user.name);
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify Google account.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handlePickImage = async (type: "profile" | "clinic" | "degree" | "nmc") => {
    try {
      const isDocument = type === "degree" || type === "nmc";
      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: !isDocument, // Documents preserve full native aspect ratio without forced crops
        quality: 0.9,
      };

      if (type === "profile") {
        pickerOptions.aspect = [1, 1]; // Strict 1:1 Square avatar
      } else if (type === "clinic") {
        pickerOptions.aspect = [16, 9]; // Strict 16:9 Landscape banner
      }

      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
      if (!result.canceled && result.assets[0]?.uri) {
        const localUri = result.assets[0].uri;
        setUploadingField(type);
        setIsDocUploading(true);

        const prefix =
          type === "profile"
            ? "doctor-profile"
            : type === "clinic"
            ? "clinic-cover"
            : type === "degree"
            ? "doctor-degree"
            : "doctor-nmc";

        let finalUrl = localUri;
        try {
          finalUrl = await uploadApi.uploadFile(localUri, prefix);
        } catch (uploadErr) {
          console.log("[Upload note] Saved local URI for onboarding step:", uploadErr);
          finalUrl = localUri;
        }

        if (type === "profile") setProfilePhotoUrl(finalUrl);
        if (type === "clinic") setClinicPhotoUrl(finalUrl);
        if (type === "degree") setDegreeCertificateUrl(finalUrl);
        if (type === "nmc") setNmcCertificateUrl(finalUrl);

        Alert.alert(
          "Photo Attached",
          type === "profile"
            ? "Doctor profile photo cropped (1:1 square) and attached."
            : type === "clinic"
            ? "Clinic banner photo cropped (16:9 widescreen) and attached."
            : "Document certificate attached in full resolution."
        );
      }
    } catch (e: any) {
      Alert.alert("Selection Failed", e.message || "Could not select image. Please try again.");
    } finally {
      setUploadingField(null);
      setIsDocUploading(false);
    }
  };

  const handleNextStep1 = async () => {
    if (!fullName.trim() || fullName.trim().length < 3) {
      setError("Legal Full Name must be at least 3 characters.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(contactNumber)) {
      setError("Valid 10-digit Indian mobile number required.");
      return;
    }
    setError(null);
    setIsStepLoading(true);
    try {
      if (isAuthenticated) {
        await doctorApi.submitOnboardStep1({
          fullName: fullName.trim(),
          contactNumber: contactNumber.trim(),
          speciality,
        }).catch((e) => {
          console.log("[Onboard Step 1 API sync note]", e?.message);
        });
      }
      setCurrentStep(2);
    } catch (err: any) {
      setCurrentStep(2);
    } finally {
      setIsStepLoading(false);
    }
  };

  const handleNextStep2 = async () => {
    if (!practiceName.trim()) {
      setError("Practice name is required.");
      return;
    }
    if (!practiceAddress.trim()) {
      setError("Address is required.");
      return;
    }
    if (!pincode.trim() || !/^\d{6}$/.test(pincode)) {
      setError("Valid 6-digit Pincode is required.");
      return;
    }
    if (!operatorName.trim() || !/^[6-9]\d{9}$/.test(operatorMobile)) {
      setError("Valid operator name and phone required.");
      return;
    }
    setError(null);
    setIsStepLoading(true);
    try {
      if (isAuthenticated) {
        await doctorApi.submitOnboardStep2({
          practiceName: practiceName.trim(),
          practiceAddress: practiceAddress.trim(),
          district: district.trim(),
          city: (city || district).trim(),
          state: state.trim() || "India",
          pincode: pincode.trim(),
          latitude: latitude || undefined,
          longitude: longitude || undefined,
          operatorName: operatorName.trim(),
          operatorMobile: operatorMobile.trim(),
          receptionist1Name: receptionist1Name.trim() || undefined,
          receptionist1Phone: receptionist1Phone.trim() || undefined,
          receptionist2Name: receptionist2Name.trim() || undefined,
          receptionist2Phone: receptionist2Phone.trim() || undefined,
          receptionist3Name: receptionist3Name.trim() || undefined,
          receptionist3Phone: receptionist3Phone.trim() || undefined,
        }).catch((e) => {
          console.log("[Onboard Step 2 API sync note]", e?.message);
        });
      }
      setCurrentStep(3);
    } catch (err: any) {
      setCurrentStep(3);
    } finally {
      setIsStepLoading(false);
    }
  };

  const handleNextStep3 = async () => {
    if (!medicalRegistrationNumber.trim()) {
      setError("Registration Number is required.");
      return;
    }
    if (medicalCouncil === "Other State Medical Council" && !otherCouncilName.trim()) {
      setError("Please specify the name of your State Medical Council.");
      return;
    }
    setError(null);
    setIsStepLoading(true);
    const effectiveCouncil =
      medicalCouncil === "Other State Medical Council" && otherCouncilName.trim()
        ? otherCouncilName.trim()
        : medicalCouncil;

    try {
      if (isAuthenticated) {
        await doctorApi.submitOnboardStep3({
          qualifications: qualifications.trim(),
          experience: parseInt(experience, 10) || 0,
          medicalRegistrationNumber: medicalRegistrationNumber.trim(),
          medicalCouncil: effectiveCouncil,
          registrationYear: parseInt(registrationYear, 10) || 2000,
          specialization: speciality,
          profilePhoto: profilePhotoUrl,
          clinicPhoto: clinicPhotoUrl,
          degreeCertificate: degreeCertificateUrl,
          nmcCertificate: nmcCertificateUrl,
          languages: languages.trim(),
          bio: bio.trim(),
          gender,
          lifetimePatientsDeclaration: lifetimePatientsDeclaration
            ? parseInt(lifetimePatientsDeclaration, 10)
            : undefined,
        }).catch((e) => {
          console.log("[Onboard Step 3 API sync note]", e?.message);
        });
      }
      setCurrentStep(4);
    } catch (err: any) {
      setCurrentStep(4);
    } finally {
      setIsStepLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    const feeNum = parseInt(consultationFee, 10);
    if (!acceptedTerms) {
      setError("Please agree to the terms.");
      return;
    }
    if (!isAuthenticated) {
      setError("Please verify your Google account before submitting application.");
      return;
    }
    setError(null);
    setIsStepLoading(true);
    try {
      await doctorApi.submitOnboardStep4({
        weeklySchedule,
        consultationFee: feeNum,
        emergencyAvailable,
        emergencyFee: emergencyAvailable ? parseInt(emergencyFee, 10) : null,
        bookingStartTime,
      }).catch((e) => {
        console.log("[Onboard Step 4 final sync note]", e?.message);
      });

      await SecureStore.deleteItemAsync(storageKey).catch(() => {});
      await SecureStore.deleteItemAsync("jc_doctor_onboarding_master_draft").catch(() => {});
      await SecureStore.deleteItemAsync("jc_onboard_draft_guest").catch(() => {});

      Alert.alert(
        "Application Submitted Successfully! 🎉",
        "Your clinical credentials and practice details have been submitted to the JivniCare Medical Verification Board. Your profile will be reviewed within 24 hours.",
        [
          {
            text: "Done",
            onPress: () => onComplete(),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        "Application Submitted",
        "Your onboarding application has been saved and submitted for verification.",
        [
          {
            text: "OK",
            onPress: () => onComplete(),
          },
        ]
      );
    } finally {
      setIsStepLoading(false);
    }
  };

  const handleDayToggle = (dayKey: string) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], isOpen: !prev[dayKey].isOpen },
    }));
  };

  const handleDayTimeChange = (dayKey: string, field: "start" | "end" | "maxPatients", value: any) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], [field]: field === "maxPatients" ? parseInt(String(value), 10) || 0 : value },
    }));
  };

  return (
    <ScreenContainer style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (currentStep > 1) setCurrentStep((prev) => prev - 1);
            else onExit();
          }}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={20} color={colors.navy} />
        </TouchableOpacity>
        <BrandLogo size="sm" />
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>
            Step {currentStep} of 4 •{" "}
            {currentStep === 1
              ? "Identity"
              : currentStep === 2
              ? "Clinic & Staff"
              : currentStep === 3
              ? "Credentials"
              : "Schedule & Fees"}
          </Text>
        </View>
      </View>

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
          {error && (
            <View style={styles.errorBox}>
              <AlertCircle size={18} color={colors.destructive} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* STEP 1: Doctor Identity & Core Contact                    */}
          {/* ═════════════════════════════════════════════════════════ */}
          {currentStep === 1 && (
            <View>
              <Text style={styles.stepTitle}>Doctor Identity & Contact</Text>
              <Text style={styles.stepSubtitle}>
                Provide your primary contact and clinical specialty details for NMC-verified directory listing.
              </Text>

              {/* Google Verification Status Card */}
              <Card style={styles.googleVerifyCard}>
                <View style={styles.googleVerifyRow}>
                  <View
                    style={[
                      styles.googleVerifyIconBox,
                      isAuthenticated && { backgroundColor: "#ECFDF5" },
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
                      {isAuthenticated ? "Google Account Linked" : "Google Authentication"}
                    </Text>
                    <Text style={styles.googleVerifySub} numberOfLines={1}>
                      {isAuthenticated && user?.email
                        ? user.email
                        : "Required to secure your clinical portal"}
                    </Text>
                  </View>
                  {!isAuthenticated && (
                    <Button
                      title="Verify"
                      variant="primary"
                      size="sm"
                      loading={isGoogleLoading}
                      onPress={handleGoogleVerify}
                    />
                  )}
                </View>
              </Card>

              <Card style={styles.formCard}>
                <Input
                  label="Legal Full Name (with Dr. prefix)"
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={fullName}
                  onChangeText={(val) => setFullName(val.replace(/[^a-zA-Z\s.]/g, ""))}
                  leftIcon={<User size={18} color={colors.primary} />}
                />

                <Input
                  label="Doctor Contact Mobile Number"
                  placeholder="10-digit mobile number"
                  value={contactNumber}
                  onChangeText={(val) => setContactNumber(val.replace(/[^0-9]/g, "").slice(0, 10))}
                  keyboardType="numeric"
                  maxLength={10}
                  leftIcon={<Phone size={18} color={colors.primary} />}
                  helper="Used for verification SMS and important practice alerts."
                />

                <Text style={styles.fieldLabel}>Primary Specialization</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.specialityPillRow}
                >
                  {(specialtiesList.length > 0
                    ? specialtiesList
                    : [
                        "General Physician",
                        "Dentist",
                        "Cardiologist",
                        "Pediatrician",
                        "Dermatologist & Cosmetologist",
                        "Orthopedic Surgeon",
                        "Gynecologist & Obstetrician",
                      ]
                  ).map((s) => (
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
                  ))}
                </ScrollView>
              </Card>

              <Button
                title="Continue to Clinic & Staff"
                variant="primary"
                size="lg"
                onPress={handleNextStep1}
                loading={isStepLoading}
                icon={<ArrowRight size={18} color="#FFFFFF" />}
                iconPosition="right"
                style={{ marginTop: 14 }}
              />
            </View>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* STEP 2: Clinic Location & Clinic Staff Pre-registration  */}
          {/* ═════════════════════════════════════════════════════════ */}
          {currentStep === 2 && (
            <View>
              <Text style={styles.stepTitle}>Clinic Location & Staff</Text>
              <Text style={styles.stepSubtitle}>
                Enter your practice premises and pre-configure staff accounts for instant front-desk access upon verification.
              </Text>

              {/* Clinic Identity & Address with GPS Auto-Detection */}
              <Card style={styles.formCard}>
                <View style={styles.gpsHeaderRow}>
                  <View style={styles.gpsIconBox}>
                    <Building2 size={20} color="#D97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardHeadingTitle}>Clinic Location & Address</Text>
                    <Text style={styles.cardSubText}>
                      Enable GPS to automatically detect your clinic's location across India.
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleFetchGPSLocation}
                    disabled={gpsLoading}
                    style={[
                      styles.gpsButton,
                      gpsStatus === "success" && styles.gpsButtonSuccess,
                      gpsStatus === "error" && styles.gpsButtonError,
                    ]}
                    activeOpacity={0.7}
                  >
                    {gpsLoading ? (
                      <View style={styles.gpsButtonContent}>
                        <RefreshCw size={13} color="#0284C7" />
                        <Text style={[styles.gpsButtonText, { color: "#0284C7" }]}>Locating...</Text>
                      </View>
                    ) : gpsStatus === "success" ? (
                      <View style={styles.gpsButtonContent}>
                        <CheckCircle2 size={13} color="#059669" />
                        <Text style={[styles.gpsButtonText, { color: "#059669" }]}>Located!</Text>
                      </View>
                    ) : (
                      <View style={styles.gpsButtonContent}>
                        <MapPin size={13} color={colors.primary} />
                        <Text style={styles.gpsButtonText}>Use GPS</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {gpsStatus === "error" && (
                  <View style={styles.gpsErrorBanner}>
                    <AlertCircle size={14} color={colors.destructive} />
                    <Text style={styles.gpsErrorText}>
                      {gpsErrorMessage || "GPS detection failed. Please type your location manually below."}
                    </Text>
                  </View>
                )}

                <Input
                  label="Practice / Clinic / Hospital Name"
                  placeholder="e.g. City Care Clinic"
                  value={practiceName}
                  onChangeText={setPracticeName}
                />

                <Input
                  label="Complete Street Address"
                  placeholder="e.g. Shop No. 5, Ground Floor, Main Road"
                  value={practiceAddress}
                  onChangeText={setPracticeAddress}
                  multiline
                />

                <View style={styles.twoColumnRow}>
                  <Input
                    containerStyle={{ flex: 1 }}
                    label="District"
                    placeholder="e.g. Patna / Ranchi"
                    value={district}
                    onChangeText={(val) => setDistrict(val.replace(/[^a-zA-Z\s]/g, ""))}
                  />
                  <Input
                    containerStyle={{ flex: 1 }}
                    label="City / Town"
                    placeholder="e.g. Patna / Ranchi"
                    value={city}
                    onChangeText={(val) => setCity(val.replace(/[^a-zA-Z\s]/g, ""))}
                  />
                </View>

                <View style={styles.twoColumnRow}>
                  <Input
                    containerStyle={{ flex: 1 }}
                    label="State"
                    placeholder="e.g. Bihar / Jharkhand / Delhi"
                    value={state}
                    onChangeText={(val) => setState(val.replace(/[^a-zA-Z\s]/g, ""))}
                  />
                  <Input
                    containerStyle={{ flex: 1 }}
                    label="Pincode"
                    placeholder="6 digits"
                    value={pincode}
                    onChangeText={(val) => setPincode(val.replace(/[^0-9]/g, "").slice(0, 6))}
                    keyboardType="numeric"
                    maxLength={6}
                  />
                </View>
              </Card>

              {/* Primary Operator */}
              <Card style={styles.formCard}>
                <Text style={styles.cardHeadingTitle}>Primary Clinic Operator</Text>
                <Text style={styles.cardSubText}>
                  Staff member managing the live OPD queue counter and patient check-in.
                </Text>

                <Input
                  label="Operator Full Name"
                  placeholder="e.g. Amit Kumar"
                  value={operatorName}
                  onChangeText={(val) => setOperatorName(val.replace(/[^a-zA-Z\s.]/g, ""))}
                />

                <Input
                  label="Operator Mobile Number (10 digits)"
                  placeholder="e.g. 9876543210"
                  value={operatorMobile}
                  onChangeText={(val) => setOperatorMobile(val.replace(/[^0-9]/g, "").slice(0, 10))}
                  keyboardType="numeric"
                  maxLength={10}
                  helper="Will be provisioned with instant Operator Portal credentials."
                />
              </Card>

              {/* Pre-registered Receptionists (Up to 3) */}
              <Card style={styles.formCard}>
                <Text style={styles.cardHeadingTitle}>Pre-Register Receptionists (Optional)</Text>
                <Text style={styles.cardSubText}>
                  Pre-configure up to 3 front-desk receptionists so their logins are ready immediately.
                </Text>

                {/* Receptionist 1 */}
                {(visibleReceptionistCount >= 1 || receptionist1Name || receptionist1Phone) && (
                  <View style={styles.receptionistCardBox}>
                    <View style={styles.receptionistCardHeader}>
                      <Text style={styles.receptionistCardTitle}>Receptionist 1</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setReceptionist1Name("");
                          setReceptionist1Phone("");
                          setVisibleReceptionistCount((c) => Math.max(0, c - 1));
                        }}
                      >
                        <Trash2 size={16} color={colors.destructive} />
                      </TouchableOpacity>
                    </View>
                    <Input
                      label="Staff Full Name"
                      placeholder="e.g. Priya Sharma"
                      value={receptionist1Name}
                      onChangeText={(val) => setReceptionist1Name(val.replace(/[^a-zA-Z\s.]/g, ""))}
                    />
                    <Input
                      label="10-digit Mobile"
                      placeholder="e.g. 9876543211"
                      value={receptionist1Phone}
                      onChangeText={(val) => setReceptionist1Phone(val.replace(/[^0-9]/g, "").slice(0, 10))}
                      keyboardType="numeric"
                      maxLength={10}
                    />
                  </View>
                )}

                {/* Receptionist 2 */}
                {(visibleReceptionistCount >= 2 || receptionist2Name || receptionist2Phone) && (
                  <View style={styles.receptionistCardBox}>
                    <View style={styles.receptionistCardHeader}>
                      <Text style={styles.receptionistCardTitle}>Receptionist 2</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setReceptionist2Name("");
                          setReceptionist2Phone("");
                          setVisibleReceptionistCount((c) => Math.max(1, c - 1));
                        }}
                      >
                        <Trash2 size={16} color={colors.destructive} />
                      </TouchableOpacity>
                    </View>
                    <Input
                      label="Staff Full Name"
                      placeholder="e.g. Rahul Verma"
                      value={receptionist2Name}
                      onChangeText={(val) => setReceptionist2Name(val.replace(/[^a-zA-Z\s.]/g, ""))}
                    />
                    <Input
                      label="10-digit Mobile"
                      placeholder="e.g. 9876543212"
                      value={receptionist2Phone}
                      onChangeText={(val) => setReceptionist2Phone(val.replace(/[^0-9]/g, "").slice(0, 10))}
                      keyboardType="numeric"
                      maxLength={10}
                    />
                  </View>
                )}

                {/* Receptionist 3 */}
                {(visibleReceptionistCount >= 3 || receptionist3Name || receptionist3Phone) && (
                  <View style={styles.receptionistCardBox}>
                    <View style={styles.receptionistCardHeader}>
                      <Text style={styles.receptionistCardTitle}>Receptionist 3</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setReceptionist3Name("");
                          setReceptionist3Phone("");
                          setVisibleReceptionistCount((c) => Math.max(2, c - 1));
                        }}
                      >
                        <Trash2 size={16} color={colors.destructive} />
                      </TouchableOpacity>
                    </View>
                    <Input
                      label="Staff Full Name"
                      placeholder="e.g. Sunita Devi"
                      value={receptionist3Name}
                      onChangeText={(val) => setReceptionist3Name(val.replace(/[^a-zA-Z\s.]/g, ""))}
                    />
                    <Input
                      label="10-digit Mobile"
                      placeholder="e.g. 9876543213"
                      value={receptionist3Phone}
                      onChangeText={(val) => setReceptionist3Phone(val.replace(/[^0-9]/g, "").slice(0, 10))}
                      keyboardType="numeric"
                      maxLength={10}
                    />
                  </View>
                )}

                {visibleReceptionistCount < 3 && (
                  <Button
                    title={`+ Add Receptionist ${visibleReceptionistCount + 1}`}
                    variant="outline"
                    size="sm"
                    onPress={() => setVisibleReceptionistCount((c) => Math.min(3, c + 1))}
                    style={{ marginTop: 8 }}
                  />
                )}
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
                  title="Continue to Credentials"
                  variant="primary"
                  size="lg"
                  onPress={handleNextStep2}
                  loading={isStepLoading}
                  style={{ flex: 2 }}
                />
              </View>
            </View>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* STEP 3: Medical Credentials & Clinical Profile           */}
          {/* ═════════════════════════════════════════════════════════ */}
          {currentStep === 3 && (
            <View>
              <Text style={styles.stepTitle}>Credentials & Verification</Text>
              <Text style={styles.stepSubtitle}>
                NMC registration details, clinical qualifications, biography, and verification documents.
              </Text>

              <Card style={styles.formCard}>
                <Input
                  label="Medical Registration Number"
                  placeholder="e.g. BMC-54892"
                  value={medicalRegistrationNumber}
                  onChangeText={setRegistrationNumber}
                />

                <Text style={styles.fieldLabel}>State Medical Council</Text>
                <TouchableOpacity
                  style={styles.selectTrigger}
                  onPress={() => setIsCouncilModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.selectTriggerText}>
                    {medicalCouncil || "Select State Medical Council"}
                  </Text>
                  <ChevronDown size={18} color="#64748B" />
                </TouchableOpacity>

                {medicalCouncil === "Other State Medical Council" && (
                  <Input
                    label="Specify Other State Medical Council *"
                    placeholder="e.g. Karnataka Medical Council"
                    value={otherCouncilName}
                    onChangeText={setOtherCouncilName}
                    containerStyle={{ marginBottom: 14 }}
                  />
                )}

                <View style={styles.twoColumnRow}>
                  <Input
                    containerStyle={{ flex: 1 }}
                    label="Registration Year"
                    placeholder="e.g. 2018"
                    value={registrationYear}
                    onChangeText={(val) => setRegistrationYear(val.replace(/[^0-9]/g, "").slice(0, 4))}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                  <Input
                    containerStyle={{ flex: 1 }}
                    label="Experience (Years)"
                    placeholder="e.g. 12"
                    value={experience}
                    onChangeText={(val) => setExperience(val.replace(/[^0-9]/g, "").slice(0, 2))}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>

                <Input
                  label="Qualifications (comma separated)"
                  placeholder="e.g. MBBS, MD (Medicine)"
                  value={qualifications}
                  onChangeText={setQualifications}
                />

                {/* Gender selection */}
                <Text style={styles.fieldLabel}>Gender</Text>
                <View style={styles.genderRow}>
                  {GENDERS.map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.genderPill,
                        gender === g && styles.genderPillActive,
                      ]}
                      onPress={() => setGender(g)}
                    >
                      <Text
                        style={[
                          styles.genderPillText,
                          gender === g && styles.genderPillTextActive,
                        ]}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Input
                  label="Languages Spoken"
                  placeholder="e.g. Hindi, English, Maithili"
                  value={languages}
                  onChangeText={setLanguages}
                />

                <Input
                  label="Short Biography & Practice Focus"
                  placeholder="Briefly introduce your clinical philosophy, specialty focus, and background..."
                  value={bio}
                  onChangeText={setBio}
                  multiline
                />

                <Input
                  label="Career Patients Treated (Declaration)"
                  placeholder="e.g. 2500"
                  value={lifetimePatientsDeclaration}
                  onChangeText={(val) => setLifetimePatientsDeclaration(val.replace(/[^0-9]/g, ""))}
                  keyboardType="numeric"
                  helper="Displayed as an achievement badge on your public booking profile."
                />
              </Card>

              {/* Documents & Photos Upload Card */}
              <Card style={styles.formCard}>
                <Text style={styles.cardHeadingTitle}>Verification Documents & Photos</Text>

                {/* 1. Doctor Profile Photo */}
                <View style={styles.uploadRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.uploadLabel}>Doctor Profile Photo *</Text>
                    <Text style={styles.uploadSub}>Formal headshot for patient trust</Text>
                  </View>
                  {profilePhotoUrl ? (
                    <TouchableOpacity
                      style={styles.uploadedBadge}
                      onPress={() => handlePickImage("profile")}
                      activeOpacity={0.7}
                    >
                      <CheckCircle2 size={14} color={colors.secondary} />
                      <Text style={styles.uploadedBadgeText}>Attached (Change)</Text>
                    </TouchableOpacity>
                  ) : (
                    <Button
                      title="Upload"
                      variant="outline"
                      size="sm"
                      loading={uploadingField === "profile"}
                      disabled={uploadingField !== null}
                      onPress={() => handlePickImage("profile")}
                    />
                  )}
                </View>

                {/* 2. Clinic Photo */}
                <View style={styles.uploadRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.uploadLabel}>Clinic Cover Photo *</Text>
                    <Text style={styles.uploadSub}>Front facade or reception area</Text>
                  </View>
                  {clinicPhotoUrl ? (
                    <TouchableOpacity
                      style={styles.uploadedBadge}
                      onPress={() => handlePickImage("clinic")}
                      activeOpacity={0.7}
                    >
                      <CheckCircle2 size={14} color={colors.secondary} />
                      <Text style={styles.uploadedBadgeText}>Attached (Change)</Text>
                    </TouchableOpacity>
                  ) : (
                    <Button
                      title="Upload"
                      variant="outline"
                      size="sm"
                      loading={uploadingField === "clinic"}
                      disabled={uploadingField !== null}
                      onPress={() => handlePickImage("clinic")}
                    />
                  )}
                </View>

                {/* 3. Degree Certificate */}
                <View style={styles.uploadRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.uploadLabel}>Medical Degree Certificate *</Text>
                    <Text style={styles.uploadSub}>MBBS / MD / Specialist Degree</Text>
                  </View>
                  {degreeCertificateUrl ? (
                    <TouchableOpacity
                      style={styles.uploadedBadge}
                      onPress={() => handlePickImage("degree")}
                      activeOpacity={0.7}
                    >
                      <CheckCircle2 size={14} color={colors.secondary} />
                      <Text style={styles.uploadedBadgeText}>Attached (Change)</Text>
                    </TouchableOpacity>
                  ) : (
                    <Button
                      title="Upload"
                      variant="outline"
                      size="sm"
                      loading={uploadingField === "degree"}
                      disabled={uploadingField !== null}
                      onPress={() => handlePickImage("degree")}
                    />
                  )}
                </View>

                {/* 4. NMC Certificate */}
                <View style={styles.uploadRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.uploadLabel}>NMC / State Registration Certificate *</Text>
                    <Text style={styles.uploadSub}>Official council certificate with reg #</Text>
                  </View>
                  {nmcCertificateUrl ? (
                    <TouchableOpacity
                      style={styles.uploadedBadge}
                      onPress={() => handlePickImage("nmc")}
                      activeOpacity={0.7}
                    >
                      <CheckCircle2 size={14} color={colors.secondary} />
                      <Text style={styles.uploadedBadgeText}>Attached (Change)</Text>
                    </TouchableOpacity>
                  ) : (
                    <Button
                      title="Upload"
                      variant="outline"
                      size="sm"
                      loading={uploadingField === "nmc"}
                      disabled={uploadingField !== null}
                      onPress={() => handlePickImage("nmc")}
                    />
                  )}
                </View>
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
                  title="Continue to Schedule"
                  variant="primary"
                  size="lg"
                  onPress={handleNextStep3}
                  loading={isStepLoading}
                  style={{ flex: 2 }}
                />
              </View>
            </View>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* STEP 4: Operations, Schedule & Consultation Fees         */}
          {/* ═════════════════════════════════════════════════════════ */}
          {currentStep === 4 && (
            <View>
              <Text style={styles.stepTitle}>OPD Operations & Pricing</Text>
              <Text style={styles.stepSubtitle}>
                Configure your OPD pricing, emergency consultation availability, and weekly shift timings.
              </Text>

              {/* Pricing Card */}
              <Card style={styles.formCard}>
                <Text style={styles.cardHeadingTitle}>Consultation Fees & Availability</Text>
                <Text style={styles.cardSubText}>
                  Set your standard appointment fees and emergency consultation rates in INR (₹).
                </Text>

                <Input
                  label="Standard OPD Consultation Fee (₹)"
                  placeholder="e.g. 400"
                  value={consultationFee}
                  onChangeText={(val) => setConsultationFee(val.replace(/[^0-9]/g, ""))}
                  keyboardType="numeric"
                  leftIcon={
                    <Text style={{ fontSize: 16, fontWeight: "700", color: colors.primary }}>
                      ₹
                    </Text>
                  }
                  helper="Standard token consultation fee collected per patient visit."
                />

                {/* Emergency Toggle */}
                <View style={styles.switchRow}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Zap size={15} color="#EF4444" />
                      <Text style={styles.switchTitle}>Emergency Walk-in Consultations</Text>
                    </View>
                    <Text style={styles.switchSub}>
                      Accept urgent walk-in emergency consultations alongside regular OPD shifts.
                    </Text>
                  </View>
                  <Switch
                    value={emergencyAvailable}
                    onValueChange={setEmergencyAvailable}
                    trackColor={{ false: "#E2E8F0", true: "#FCA5A5" }}
                    thumbColor={emergencyAvailable ? "#EF4444" : "#94A3B8"}
                  />
                </View>

                {emergencyAvailable && (
                  <Input
                    label="Emergency Consultation Fee (₹)"
                    placeholder="e.g. 600"
                    value={emergencyFee}
                    onChangeText={(val) => setEmergencyFee(val.replace(/[^0-9]/g, ""))}
                    keyboardType="numeric"
                    leftIcon={
                      <Text style={{ fontSize: 16, fontWeight: "700", color: "#EF4444" }}>
                        ₹
                      </Text>
                    }
                    helper="Applied when issuing emergency priority tokens."
                  />
                )}

                <Input
                  label="Daily Token Booking Start Time"
                  placeholder="08:00"
                  value={bookingStartTime}
                  onChangeText={setBookingStartTime}
                  helper="When online token booking opens for patients each morning."
                />
              </Card>

              {/* Weekly Schedule Editor */}
              <Card style={styles.formCard}>
                <Text style={styles.cardHeadingTitle}>Weekly OPD Shift Schedule</Text>

                {DAYS_OF_WEEK.map((day) => {
                  const dayData = weeklySchedule[day.key] || {
                    isOpen: false,
                    start: "09:00",
                    end: "17:00",
                    maxPatients: 20,
                  };

                  return (
                    <View key={day.key} style={styles.dayScheduleBox}>
                      <View style={styles.dayScheduleHeader}>
                        <Text style={styles.dayScheduleLabel}>{day.label}</Text>
                        <Switch
                          value={dayData.isOpen}
                          onValueChange={() => handleDayToggle(day.key)}
                          trackColor={{ false: "#E2E8F0", true: "#A7F3D0" }}
                          thumbColor={dayData.isOpen ? colors.secondary : "#94A3B8"}
                        />
                      </View>

                      {dayData.isOpen ? (
                        <View style={styles.dayScheduleInputs}>
                          <Input
                            containerStyle={{ flex: 1 }}
                            label="Start"
                            value={dayData.start}
                            onChangeText={(v) => handleDayTimeChange(day.key, "start", v)}
                            placeholder="09:00"
                          />
                          <Input
                            containerStyle={{ flex: 1 }}
                            label="End"
                            value={dayData.end}
                            onChangeText={(v) => handleDayTimeChange(day.key, "end", v)}
                            placeholder="17:00"
                          />
                          <Input
                            containerStyle={{ flex: 1 }}
                            label="Max Tokens"
                            value={String(dayData.maxPatients || "")}
                            onChangeText={(v) => handleDayTimeChange(day.key, "maxPatients", v)}
                            keyboardType="numeric"
                            placeholder="20"
                          />
                        </View>
                      ) : (
                        <Text style={styles.dayClosedText}>Clinic Closed</Text>
                      )}
                    </View>
                  );
                })}
              </Card>

              {/* Terms & Agreement Card */}
              <Card style={styles.formCard}>
                <TouchableOpacity
                  style={styles.termsCheckboxRow}
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.checkboxBox,
                      acceptedTerms && styles.checkboxBoxActive,
                    ]}
                  >
                    {acceptedTerms && <Check size={14} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.termsText}>
                    I confirm that the medical credentials and clinic details provided are authentic and compliant with National Medical Commission (NMC) regulations.
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
                  variant="secondary"
                  size="lg"
                  onPress={handleFinalSubmit}
                  loading={isStepLoading}
                  disabled={!acceptedTerms}
                  style={{ flex: 2 }}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Medical Council Picker Modal (Bottom Sheet) */}
      <Modal
        visible={isCouncilModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCouncilModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsCouncilModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalContentBox}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>Select Medical Council</Text>
                <Text style={styles.modalSub}>
                  Select your registering State Medical Council
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setIsCouncilModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ maxHeight: 380 }}
              showsVerticalScrollIndicator={false}
            >
              {MEDICAL_COUNCILS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.modalCouncilItem,
                    medicalCouncil === c && styles.modalCouncilItemActive,
                  ]}
                  onPress={() => {
                    setMedicalCouncil(c);
                    setIsCouncilModalVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modalCouncilText,
                      medicalCouncil === c && styles.modalCouncilTextActive,
                    ]}
                  >
                    {c}
                  </Text>
                  {medicalCouncil === c && (
                    <CheckCircle2 size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  iconButton: {
    padding: 6,
    borderRadius: radius.md,
    backgroundColor: colors.mutedBackground,
  },
  stepBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  stepBadgeText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primary,
    fontWeight: "700",
  },
  progressContainer: {
    height: 3,
    backgroundColor: "#E2E8F0",
    width: "100%",
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: radius.lg,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    ...typography.caption,
    fontSize: 11.5,
    color: colors.destructive,
    flex: 1,
  },
  stepTitle: {
    ...typography.titleMedium,
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  stepSubtitle: {
    ...typography.bodySmall,
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  googleVerifyCard: {
    padding: 14,
    marginBottom: 14,
    borderRadius: 16,
  },
  googleVerifyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  googleVerifyIconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  googleVerifyTitle: {
    ...typography.titleSmall,
    fontSize: 13.5,
    color: "#0F172A",
    fontWeight: "700",
  },
  googleVerifySub: {
    ...typography.caption,
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 1,
  },
  formCard: {
    padding: 16,
    marginBottom: 14,
    borderRadius: 16,
  },
  cardHeadingTitle: {
    ...typography.titleSmall,
    color: "#0F172A",
    fontSize: 13.5,
    fontWeight: "700",
    marginBottom: 3,
  },
  cardSubText: {
    ...typography.caption,
    fontSize: 11.5,
    color: "#64748B",
    marginBottom: 12,
    lineHeight: 16,
  },
  gpsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  gpsIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  gpsButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  gpsButtonSuccess: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  gpsButtonError: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  gpsButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  gpsButtonText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  gpsErrorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: radius.md,
    padding: 8,
    marginBottom: 12,
  },
  gpsErrorText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.destructive,
    flex: 1,
  },
  fieldLabel: {
    ...typography.caption,
    fontSize: 11.5,
    fontWeight: "700",
    color: "#334155",
    marginTop: 10,
    marginBottom: 8,
  },
  specialityPillRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 4,
  },
  specialityPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.mutedBackground,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  specialityPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  specialityPillText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.navy,
    fontWeight: "600",
  },
  specialityPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  selectTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 14,
  },
  selectTriggerText: {
    ...typography.bodySmall,
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContentBox: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    ...typography.titleMedium,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalSub: {
    ...typography.caption,
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
  },
  modalCloseButton: {
    padding: 6,
    borderRadius: radius.full,
    backgroundColor: "#F1F5F9",
  },
  modalCouncilItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FAFAFA",
    marginBottom: 8,
  },
  modalCouncilItemActive: {
    borderColor: colors.primary,
    backgroundColor: "#EFF6FF",
  },
  modalCouncilText: {
    ...typography.bodySmall,
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "500",
  },
  modalCouncilTextActive: {
    fontWeight: "700",
    color: colors.primary,
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: 12,
  },
  receptionistCardBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: radius.lg,
    padding: 12,
    marginBottom: 10,
  },
  receptionistCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  receptionistCardTitle: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "800",
    color: colors.navy,
  },
  genderRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  genderPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FAFAFA",
    alignItems: "center",
    justifyContent: "center",
  },
  genderPillActive: {
    borderColor: colors.primary,
    backgroundColor: "#EFF6FF",
  },
  genderPillText: {
    ...typography.caption,
    fontSize: 11.5,
    color: colors.navy,
    fontWeight: "600",
  },
  genderPillTextActive: {
    color: colors.primary,
    fontWeight: "800",
  },
  uploadRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  uploadLabel: {
    ...typography.caption,
    fontSize: 11.5,
    fontWeight: "700",
    color: colors.navy,
  },
  uploadSub: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  uploadedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  uploadedBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: colors.secondary,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginVertical: 4,
  },
  switchTitle: {
    ...typography.caption,
    fontSize: 11.5,
    fontWeight: "700",
    color: colors.navy,
  },
  switchSub: {
    ...typography.caption,
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 14,
  },
  dayScheduleBox: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  dayScheduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  dayScheduleLabel: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: "700",
    color: colors.navy,
  },
  dayScheduleInputs: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  dayClosedText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: "italic",
  },
  termsCheckboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxBoxActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  termsText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
});

