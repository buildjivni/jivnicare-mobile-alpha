import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  BackHandler,
} from "react-native";
import { colors, typography, radius, shadows } from "../theme";
import { useAuthStore } from "../store/useAuthStore";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { LiveQueueScreen } from "../screens/queue/LiveQueueScreen";
import { OverviewDashboardScreen } from "../screens/overview/OverviewDashboardScreen";
import { PatientRecordsScreen } from "../screens/patients/PatientRecordsScreen";
import { SettingsScreen } from "../screens/settings/SettingsScreen";
import { DoctorProfileScreen } from "../screens/profile/DoctorProfileScreen";
import { BillingScreen } from "../screens/billing/BillingScreen";
import { PerformanceScreen } from "../screens/performance/PerformanceScreen";
import {
  LayoutDashboard,
  Users,
  History,
  Settings,
  UserCircle,
  CreditCard,
  TrendingUp,
} from "lucide-react-native";

export type DoctorTab =
  | "OVERVIEW"
  | "QUEUE"
  | "PATIENTS"
  | "SETTINGS"
  | "PROFILE"
  | "BILLING"
  | "PERFORMANCE";

export interface DoctorTabNavigatorProps {
  onReopenOnboarding?: () => void;
}

export const DoctorTabNavigator: React.FC<DoctorTabNavigatorProps> = ({
  onReopenOnboarding,
}) => {
  const user = useAuthStore((state) => state.user);
  const { profile } = useWorkspaceStore();
  const isOperator = Boolean(user?.isOperator || user?.role === "OPERATOR");
  const isVerified = isOperator || profile?.verificationStatus === "VERIFIED";

  // Operators default to QUEUE; Doctors default to OVERVIEW
  const defaultTab: DoctorTab = isOperator ? "QUEUE" : "OVERVIEW";
  const [activeTab, setActiveTab] = useState<DoctorTab>(defaultTab);
  const [tabHistory, setTabHistory] = useState<DoctorTab[]>([defaultTab]);

  // Role-gated tabs
  const doctorTabs = [
    { key: "OVERVIEW", label: "Overview", icon: LayoutDashboard },
    { key: "QUEUE", label: "Live Queue", icon: Users },
    { key: "PATIENTS", label: "Records", icon: History },
    { key: "SETTINGS", label: "Settings", icon: Settings },
    { key: "PROFILE", label: "Profile", icon: UserCircle },
  ];

  const operatorTabs = [
    { key: "QUEUE", label: "Live Queue", icon: Users },
    { key: "PATIENTS", label: "Records", icon: History },
  ];

  const currentTabs = isOperator ? operatorTabs : doctorTabs;

  const navigateTab = useCallback((tabKey: DoctorTab) => {
    if (!isVerified && (tabKey === "QUEUE" || tabKey === "PATIENTS" || tabKey === "SETTINGS")) {
      setActiveTab("OVERVIEW");
      return;
    }
    setActiveTab(tabKey);
    setTabHistory((prev) => {
      if (prev[prev.length - 1] === tabKey) return prev;
      return [...prev, tabKey];
    });
  }, [isVerified]);

  const handleGoBack = useCallback(() => {
    if (tabHistory.length > 1) {
      const nextHistory = [...tabHistory];
      nextHistory.pop(); // Remove current tab
      const previousTab = nextHistory[nextHistory.length - 1];
      setTabHistory(nextHistory);
      setActiveTab(previousTab);
      return true;
    }
    if (activeTab !== defaultTab) {
      setActiveTab(defaultTab);
      setTabHistory([defaultTab]);
      return true;
    }
    // At root screen (OVERVIEW for doctor, QUEUE for operator) -> allow Android exit
    return false;
  }, [tabHistory, activeTab, defaultTab]);

  // Handle hardware & gesture back button on Android
  useEffect(() => {
    const onHardwareBack = () => {
      return handleGoBack();
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", onHardwareBack);
    return () => backHandler.remove();
  }, [handleGoBack]);

  return (
    <View style={styles.container}>
      {/* Screen Views */}
      <View style={styles.screenContainer}>
        {activeTab === "QUEUE" && (
          <LiveQueueScreen onBack={activeTab !== defaultTab ? handleGoBack : undefined} />
        )}
        {activeTab === "OVERVIEW" && (
          <OverviewDashboardScreen
            onNavigateToQueue={() => navigateTab("QUEUE")}
            onNavigateToRecords={() => navigateTab("PATIENTS")}
            onNavigateToSettings={() => navigateTab("SETTINGS")}
            onNavigateToBilling={() => navigateTab("BILLING")}
            onNavigateToPerformance={() => navigateTab("PERFORMANCE")}
            onEditProfileAndReapply={onReopenOnboarding}
          />
        )}
        {activeTab === "PATIENTS" && (
          <PatientRecordsScreen onBack={handleGoBack} />
        )}
        {activeTab === "SETTINGS" && (
          <SettingsScreen onBack={handleGoBack} />
        )}
        {activeTab === "BILLING" && (
          <BillingScreen onBack={handleGoBack} />
        )}
        {activeTab === "PROFILE" && (
          <DoctorProfileScreen
            onBack={handleGoBack}
            onLogout={() => useAuthStore.getState().clearAuth()}
          />
        )}
        {activeTab === "PERFORMANCE" && (
          <PerformanceScreen onBack={handleGoBack} />
        )}
      </View>

      {/* Floating Bottom Tab Bar - Only for verified doctors */}
      {isVerified && (
        <SafeAreaView style={styles.tabBarWrapper}>
          <View style={styles.tabBar}>
            {currentTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              const isLocked = !isVerified && (tab.key === "QUEUE" || tab.key === "PATIENTS" || tab.key === "SETTINGS");

              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabItem]}
                  onPress={() => navigateTab(tab.key as DoctorTab)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      isActive && styles.iconCircleActive,
                    ]}
                  >
                    <Icon
                      size={20}
                      color={isActive ? colors.primary : isLocked ? "#CBD5E1" : colors.textMuted}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </View>
                  <Text
                    style={[
                      styles.tabLabel,
                      isActive && styles.tabLabelActive,
                      isLocked && { color: "#CBD5E1" },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SafeAreaView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  screenContainer: {
    flex: 1,
  },
  tabBarWrapper: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 20 : 12,
    left: 16,
    right: 16,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: radius["2xl"],
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(27, 63, 107, 0.12)",
    alignItems: "center",
    justifyContent: "space-around",
    ...shadows.premium,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleActive: {
    backgroundColor: colors.primaryLight,
  },
  tabLabel: {
    ...typography.caption,
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: "none",
    fontWeight: "700",
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: "900",
  },
});
