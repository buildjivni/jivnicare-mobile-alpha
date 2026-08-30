import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from "react-native";
import { colors, typography, radius, shadows } from "../theme";
import { useAuthStore } from "../store/useAuthStore";
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

export const DoctorTabNavigator: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isOperator = Boolean(user?.isOperator || user?.role === "OPERATOR");

  // Operators default to QUEUE; Doctors default to OVERVIEW
  const [activeTab, setActiveTab] = useState<DoctorTab>(isOperator ? "QUEUE" : "QUEUE");

  // Role-gated tabs
  const doctorTabs = [
    { key: "QUEUE", label: "Live Queue", icon: Users },
    { key: "OVERVIEW", label: "Overview", icon: LayoutDashboard },
    { key: "PATIENTS", label: "Records", icon: History },
    { key: "SETTINGS", label: "Settings", icon: Settings },
    { key: "PROFILE", label: "Profile", icon: UserCircle },
  ];

  const operatorTabs = [
    { key: "QUEUE", label: "Live Queue", icon: Users },
    { key: "PATIENTS", label: "Records", icon: History },
  ];

  const currentTabs = isOperator ? operatorTabs : doctorTabs;

  return (
    <View style={styles.container}>
      {/* Screen Views */}
      <View style={styles.screenContainer}>
        {activeTab === "QUEUE" && <LiveQueueScreen />}
        {activeTab === "OVERVIEW" && (
          <OverviewDashboardScreen
            onNavigateToQueue={() => setActiveTab("QUEUE")}
            onNavigateToRecords={() => setActiveTab("PATIENTS")}
            onNavigateToSettings={() => setActiveTab("SETTINGS")}
          />
        )}
        {activeTab === "PATIENTS" && <PatientRecordsScreen />}
        {activeTab === "SETTINGS" && <SettingsScreen />}
        {activeTab === "PROFILE" && (
          <DoctorProfileScreen onLogout={() => useAuthStore.getState().clearAuth()} />
        )}
        {activeTab === "BILLING" && <BillingScreen />}
        {activeTab === "PERFORMANCE" && <PerformanceScreen />}
      </View>

      {/* Floating Bottom Tab Bar */}
      <View style={styles.tabBarWrapper}>
        <View style={styles.tabBar}>
          {currentTabs.map((t) => {
            const isActive = activeTab === t.key;
            const Icon = t.icon;
            return (
              <TouchableOpacity
                key={t.key}
                style={styles.tabItem}
                onPress={() => setActiveTab(t.key as DoctorTab)}
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
                    color={isActive ? colors.primary : colors.textMuted}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    isActive && styles.tabLabelActive,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
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
