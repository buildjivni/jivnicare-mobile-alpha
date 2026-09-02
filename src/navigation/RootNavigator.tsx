import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, BackHandler } from "react-native";
import { useAuthStore } from "../store/useAuthStore";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { PartnerIntroScreen } from "../screens/intro/PartnerIntroScreen";
import { DoctorSignInScreen } from "../screens/auth/DoctorSignInScreen";
import { DoctorOnboardWizard } from "../screens/onboard/DoctorOnboardWizard";
import { DoctorTabNavigator } from "./DoctorTabNavigator";
import { colors } from "../theme";

export type RootNavigationState =
  | "INITIALIZING"
  | "UNAUTH_INTRO"
  | "UNAUTH_LOGIN"
  | "UNAUTH_ONBOARD"
  | "AUTH_PROBING"
  | "AUTH_CONNECTION_ERROR"
  | "DRAFT_ONBOARDING"
  | "DOCTOR_WORKSPACE";

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isInitialized, user } = useAuthStore();
  const {
    profile,
    isLoading: isWorkspaceLoading,
    error: workspaceError,
    isDraftDoctor,
    fetchWorkspace,
  } = useWorkspaceStore();

  // Guest flow route (only active when unauthenticated)
  const [guestRoute, setGuestRoute] = useState<"INTRO" | "LOGIN" | "ONBOARD">("INTRO");
  // Explicit edit mode when verified/review doctor wants to modify submitted details
  const [isEditingDraft, setIsEditingDraft] = useState(false);

  // Trigger workspace fetch when authenticated user has no cached profile or draft status
  useEffect(() => {
    if (isAuthenticated && user && !profile && !isDraftDoctor && !workspaceError && !isWorkspaceLoading) {
      console.log("[RootNavigator] Authenticated session detected without profile -> probing workspace...");
      fetchWorkspace();
    }
  }, [isAuthenticated, user, profile, isDraftDoctor, workspaceError, isWorkspaceLoading, fetchWorkspace]);

  // Hardware Back-Button Handling for Android
  useEffect(() => {
    const onBackPress = () => {
      if (!isAuthenticated) {
        if (guestRoute === "LOGIN" || guestRoute === "ONBOARD") {
          setGuestRoute("INTRO");
          return true;
        }
        return false;
      }
      if (isEditingDraft) {
        setIsEditingDraft(false);
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, [guestRoute, isAuthenticated, isEditingDraft]);

  // ══════════════════════════════════════════════════════════
  // DETERMINISTIC ROOT STATE MACHINE CALCULATION
  // ══════════════════════════════════════════════════════════
  let navState: RootNavigationState = "INITIALIZING";

  if (!isInitialized) {
    navState = "INITIALIZING";
  } else if (!isAuthenticated || !user) {
    if (guestRoute === "ONBOARD") {
      navState = "UNAUTH_ONBOARD";
    } else if (guestRoute === "LOGIN") {
      navState = "UNAUTH_LOGIN";
    } else {
      navState = "UNAUTH_INTRO";
    }
  } else {
    // Authenticated flow
    if (isEditingDraft) {
      navState = "DRAFT_ONBOARDING";
    } else if (isWorkspaceLoading && !profile && !workspaceError && !isDraftDoctor) {
      navState = "AUTH_PROBING";
    } else if (workspaceError && !profile && !isDraftDoctor) {
      navState = "AUTH_CONNECTION_ERROR";
    } else if (isDraftDoctor) {
      navState = "DRAFT_ONBOARDING";
    } else if (profile || user.isOperator || user.role === "OPERATOR") {
      navState = "DOCTOR_WORKSPACE";
    } else {
      navState = "AUTH_PROBING";
    }
  }

  // Log every state transition for live diagnostic telemetry
  const lastLoggedState = useRef<string | null>(null);
  if (lastLoggedState.current !== navState) {
    console.log(`[RootNavigator State Transition] -> ${navState}`);
    lastLoggedState.current = navState;
  }

  // ══════════════════════════════════════════════════════════
  // RENDER CORRESPONDING VIEW ACCORDING TO STATE ENUM
  // ══════════════════════════════════════════════════════════
  switch (navState) {
    case "INITIALIZING":
    case "AUTH_PROBING":
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );

    case "AUTH_CONNECTION_ERROR":
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
              onPress={() => {
                setGuestRoute("INTRO");
                useAuthStore.getState().clearAuth();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.signOutButtonText}>Sign In with Different Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      );

    case "DRAFT_ONBOARDING":
      return (
        <DoctorOnboardWizard
          initialStep={profile?.registrationStep || 1}
          onComplete={async () => {
            setIsEditingDraft(false);
            setGuestRoute("INTRO");
            await fetchWorkspace();
          }}
          onExit={() => {
            setIsEditingDraft(false);
            setGuestRoute("INTRO");
            useAuthStore.getState().clearAuth();
          }}
        />
      );

    case "DOCTOR_WORKSPACE":
      return (
        <DoctorTabNavigator
          onReopenOnboarding={() => setIsEditingDraft(true)}
        />
      );

    case "UNAUTH_ONBOARD":
      return (
        <DoctorOnboardWizard
          initialStep={1}
          onComplete={async () => {
            setGuestRoute("INTRO");
            await fetchWorkspace();
          }}
          onExit={() => {
            setGuestRoute("INTRO");
          }}
        />
      );

    case "UNAUTH_LOGIN":
      return (
        <DoctorSignInScreen
          onBackToIntro={() => setGuestRoute("INTRO")}
          onLoginSuccess={async () => {
            setGuestRoute("INTRO");
            await fetchWorkspace();
          }}
        />
      );

    case "UNAUTH_INTRO":
    default:
      return (
        <PartnerIntroScreen
          onJoinNetwork={() => setGuestRoute("ONBOARD")}
          onSignIn={() => setGuestRoute("LOGIN")}
        />
      );
  }
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
