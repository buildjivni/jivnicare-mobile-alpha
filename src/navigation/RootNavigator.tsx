import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, BackHandler } from "react-native";
import { useAuthStore } from "../store/useAuthStore";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { PartnerIntroScreen } from "../screens/intro/PartnerIntroScreen";
import { DoctorSignInScreen } from "../screens/auth/DoctorSignInScreen";
import { DoctorOnboardWizard } from "../screens/onboard/DoctorOnboardWizard";
import { DoctorTabNavigator } from "./DoctorTabNavigator";
import { colors } from "../theme";

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const { profile } = useWorkspaceStore();

  // Navigation flow state when unauthenticated
  const [authScreen, setAuthScreen] = useState<"INTRO" | "LOGIN" | "ONBOARD">("INTRO");

  // Hardware Back-Button Handling for Android
  useEffect(() => {
    const onBackPress = () => {
      if (!isAuthenticated) {
        if (authScreen === "LOGIN") {
          setAuthScreen("INTRO");
          return true; // Handled: navigated back to Intro
        }
        if (authScreen === "ONBOARD") {
          // Handled inside DoctorOnboardWizard step state or root exit
          return false;
        }
        // At true root (INTRO) -> let Android exit the app
        return false;
      }
      // When logged in -> let Android exit the app (no looping back to Login)
      return false;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, [authScreen, isAuthenticated]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // 1. If currently in onboarding flow, always render DoctorOnboardWizard
  if (authScreen === "ONBOARD") {
    return (
      <DoctorOnboardWizard
        initialStep={profile?.registrationStep || 1}
        onComplete={() => {
          useWorkspaceStore.getState().fetchWorkspace();
          setAuthScreen("LOGIN");
        }}
        onExit={() => {
          if (isAuthenticated) {
            useAuthStore.getState().clearAuth();
          }
          setAuthScreen("INTRO");
        }}
      />
    );
  }

  // 2. Authenticated User Flow
  if (isAuthenticated && user) {
    // If registration is not verified/completed, keep doctor in onboarding wizard
    if (
      user.role === "DOCTOR" &&
      (!profile || !profile.registrationComplete || profile.verificationStatus === "DRAFT")
    ) {
      return (
        <DoctorOnboardWizard
          initialStep={profile?.registrationStep || 1}
          onComplete={() => useWorkspaceStore.getState().fetchWorkspace()}
          onExit={() => useAuthStore.getState().clearAuth()}
        />
      );
    }

    return <DoctorTabNavigator />;
  }

  // 3. Unauthenticated Flow
  if (authScreen === "LOGIN") {
    return (
      <DoctorSignInScreen
        onBackToIntro={() => setAuthScreen("INTRO")}
        onLoginSuccess={(isComplete) => {
          if (!isComplete) {
            setAuthScreen("ONBOARD");
          }
        }}
      />
    );
  }

  return (
    <PartnerIntroScreen
      onJoinNetwork={() => setAuthScreen("ONBOARD")}
      onSignIn={() => setAuthScreen("LOGIN")}
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
});
