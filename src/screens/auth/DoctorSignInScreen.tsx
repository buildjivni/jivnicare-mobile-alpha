import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  BackHandler,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors, typography, radius, shadows } from "../../theme";
import { BrandLogo } from "../../components/shared/BrandLogo";
import { Card } from "../../components/ui/Card";
import { useAuthStore } from "../../store/useAuthStore";
import { authApi } from "../../api/auth";
import {
  ShieldCheck,
  Stethoscope,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react-native";

export interface DoctorSignInScreenProps {
  onBackToIntro: () => void;
  onLoginSuccess: (isRegistrationComplete: boolean) => void;
}

export const DoctorSignInScreen: React.FC<DoctorSignInScreenProps> = ({
  onBackToIntro,
  onLoginSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleBack = () => {
      onBackToIntro();
      return true;
    };
    const subscription = BackHandler.addEventListener("hardwareBackPress", handleBack);
    return () => subscription.remove();
  }, [onBackToIntro]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.signInWithGoogle();
      if (res.success && res.user) {
        useAuthStore.getState().setAuth(res.user, res.token || "session_active");
        onLoginSuccess(!res.isNewDoctor);
      } else if (!res.cancelled) {
        setError(res.error || "Sign-in could not be completed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to Google authentication. Please check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={onBackToIntro}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={20} color={colors.navy} />
        </TouchableOpacity>
        <BrandLogo size="sm" />
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Trust Pill */}
        <View style={styles.trustBadgeContainer}>
          <View style={styles.trustBadge}>
            <ShieldCheck size={14} color={colors.secondary} />
            <Text style={styles.trustBadgeText}>
              SECURE CLINICAL ACCESS PORTAL
            </Text>
          </View>
        </View>

        {/* Title & Copy */}
        <View style={styles.heroSection}>
          <Text style={styles.title}>
            Partner <Text style={{ color: colors.primary }}>Login</Text>
          </Text>
          <Text style={styles.subtitle}>
            Access your OPD queue, patient consultations, and clinical schedule using your verified Google account.
          </Text>
        </View>

        {/* Error Alert */}
        {error && (
          <View style={styles.errorBox}>
            <AlertCircle size={16} color={colors.destructive} style={{ marginTop: 1 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Main Sign-In Card */}
        <Card style={styles.signInCard} variant="elevated">
          <View style={styles.cardHeader}>
            <View style={styles.doctorIconBox}>
              <Stethoscope size={24} color={colors.primary} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Doctor & Clinic Staff</Text>
              <Text style={styles.cardSub}>NMC Verified Identity Authentication</Text>
            </View>
          </View>

          {/* Official Google Sign-In Button */}
          <TouchableOpacity
            style={styles.googleButton}
            activeOpacity={0.85}
            disabled={isLoading}
            onPress={handleGoogleSignIn}
          >
            {isLoading ? (
              <View style={styles.googleContentRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.googleButtonText}>Opening Google Sign-In...</Text>
              </View>
            ) : (
              <View style={styles.googleContentRow}>
                <Svg width={22} height={22} viewBox="0 0 24 24">
                  <Path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <Path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <Path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <Path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </Svg>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>SECURED WITH 256-BIT ENCRYPTION</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Value Checklist */}
          <View style={styles.trustList}>
            <View style={styles.trustItem}>
              <CheckCircle2 size={16} color={colors.secondary} />
              <Text style={styles.trustItemText}>
                Instant synchronization with live clinic waiting room
              </Text>
            </View>
            <View style={styles.trustItem}>
              <CheckCircle2 size={16} color={colors.secondary} />
              <Text style={styles.trustItemText}>
                Role-based security: Doctors and authorized receptionists only
              </Text>
            </View>
            <View style={styles.trustItem}>
              <CheckCircle2 size={16} color={colors.secondary} />
              <Text style={styles.trustItemText}>
                Zero passwords to remember — protected by Google Workspace
              </Text>
            </View>
          </View>
        </Card>

        {/* Security & Regulatory Assurance */}
        <View style={styles.complianceBox}>
          <Lock size={14} color={colors.textMuted} />
          <Text style={styles.complianceText}>
            Compliant with National Medical Commission (NMC) & DPDP healthcare data privacy standards.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.mutedBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  trustBadgeContainer: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondaryLight,
    borderWidth: 1,
    borderColor: "rgba(75, 159, 95, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    gap: 6,
  },
  trustBadgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.secondary,
    fontWeight: "900",
  },
  heroSection: {
    marginBottom: 24,
  },
  title: {
    ...typography.display,
    color: colors.navy,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.destructiveBg,
    borderWidth: 1,
    borderColor: colors.destructiveBorder,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.destructive,
    fontWeight: "600",
    flex: 1,
    lineHeight: 18,
  },
  signInCard: {
    padding: 20,
    borderRadius: radius["2xl"],
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: "rgba(86, 150, 199, 0.15)",
    marginBottom: 24,
    ...shadows.premium,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  doctorIconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    ...typography.titleSmall,
    color: colors.navy,
    fontSize: 16,
  },
  cardSub: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: "none",
    marginTop: 2,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: radius.xl,
    height: 54,
    paddingHorizontal: 20,
    ...shadows.soft,
  },
  googleContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  googleButtonText: {
    ...typography.button,
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "700",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.cardBorder,
  },
  dividerText: {
    ...typography.caption,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  trustList: {
    gap: 12,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  trustItemText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  complianceBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  complianceText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "none",
    textAlign: "center",
    lineHeight: 16,
  },
});
