import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, BackHandler } from "react-native";
import { useAuthStore } from "../store/useAuthStore";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { PartnerIntroScreen } from "../screens/intro/PartnerIntroScreen";
import { DoctorSignInScreen } from "../screens/auth/DoctorSignInScreen";
import { DoctorOnboardWizard } from "../screens/onboard/DoctorOnboardWizard";
import { DoctorTabNavigator } from "./DoctorTabNavigator";
import { colors } from "../theme";

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuthStore();
  const {
    profile,
    isLoading: isWorkspaceLoading,
    error: workspaceError,
    isDraftDoctor,
    fetchWorkspace,
  } = useWorkspaceStore();

  // Navigation flow state when unauthenticated
  const [unauthScreen, setUnauthScreen] = useState<"INTRO" | "LOGIN" | "ONBOARD">("INTRO");
  const [reopenOnboarding, setReopenOnboarding] = useState(false);

  // Hardware Back-Button Handling for Android
  useEffect(() => {
    const onBackPress = () => {
      if (!isAuthenticated) {
        if (unauthScreen === "LOGIN" || unauthScreen === "ONBOARD") {
          setUnauthScreen("INTRO");
          return true;
        }
        return false;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, [unauthScreen, isAuthenticated]);

  // ══════════════════════════════════════════════════════════
  // 0. AUTHENTICATED USER FLOW (Takes priority whenever user is logged in)
  // ══════════════════════════════════════════════════════════
  if (isAuthenticated && user) {
    // 0A. Initial loading state while probing backend profile
    if (isWorkspaceLoading && !profile && !workspaceError && !isDraftDoctor) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    // 0B. Network or server error for existing doctor (prevent routing verified doctors into onboarding)
    if (workspaceError && !profile && !isDraftDoctor) {
      return (
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <View style={styles.errorIconBadge}>
              <ActivityIndicator size="small" color="#DC2626" />
            </View>
            <Text style={styles.errorTitle}>Connection Issue</Text>
            <Text style={styles.errorSub}>
              {workspaceError || "Unable to load your doctor practice account. Please check your connection."}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchWorkspace()}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Retry Connection</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signOutButton}
              onPress={() => useAuthStore.getState().clearAuth()}
              activeOpacity={0.7}
            >
              <Text style={styles.signOutButtonText}>Sign In with Different Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // 0C. Unregistered / Incomplete Draft Doctor (Confirmed 401/404 or explicit DRAFT status)
    if (isDraftDoctor || reopenOnboarding || unauthScreen === "ONBOARD") {
      return (
        <DoctorOnboardWizard
          initialStep={profile?.registrationStep || 1}
          onComplete={async () => {
            setReopenOnboarding(false);
            setUnauthScreen("INTRO");
            await fetchWorkspace();
          }}
          onExit={() => {
            setReopenOnboarding(false);
            setUnauthScreen("INTRO");
            useAuthStore.getState().clearAuth();
          }}
        />
      );
    }

    // 0D. All registered doctors (PENDING_REVIEW, REJECTED, SUSPENDED, VERIFIED, or OPERATOR)
    return (
      <DoctorTabNavigator
        onReopenOnboarding={() => setReopenOnboarding(true)}
      />
    );
  }

  // ══════════════════════════════════════════════════════════
  // 1. ROOT LOADING GATE FOR COLD LAUNCH (UNAUTHENTICATED)
  // ══════════════════════════════════════════════════════════
  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // ══════════════════════════════════════════════════════════
  // 2. UNAUTHENTICATED GUEST FLOW
  // ══════════════════════════════════════════════════════════
  if (unauthScreen === "ONBOARD") {
    return (
      <DoctorOnboardWizard
        initialStep={1}
        onComplete={async () => {
          setUnauthScreen("INTRO");
          await fetchWorkspace();
        }}
        onExit={() => {
          setUnauthScreen("INTRO");
        }}
      />
    );
  }

  if (unauthScreen === "LOGIN") {
    return (
      <DoctorSignInScreen
        onBackToIntro={() => setUnauthScreen("INTRO")}
        onLoginSuccess={async (isComplete) => {
          setUnauthScreen("INTRO");
          await fetchWorkspace();
        }}
      />
    );
  }

  return (
    <PartnerIntroScreen
      onJoinNetwork={() => setUnauthScreen("ONBOARD")}
      onSignIn={() => setUnauthScreen("LOGIN")}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  errorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  errorIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },
  errorSub: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  signOutButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  signOutButtonText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },
});
