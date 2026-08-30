import React from "react";
import { View, StyleSheet, ViewStyle, Platform, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  edges?: ("top" | "bottom" | "left" | "right")[];
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  style,
  backgroundColor = "#F8FAFC",
  edges = ["top"],
}) => {
  const insets = useSafeAreaInsets();

  // On Android, ensure minimum status bar height if insets.top reports 0
  const androidStatusBarHeight = StatusBar.currentHeight || 28;
  const topInset = edges.includes("top")
    ? Math.max(insets.top, Platform.OS === "android" ? androidStatusBarHeight : 0)
    : 0;
  const bottomInset = edges.includes("bottom") ? insets.bottom : 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          paddingTop: topInset,
          paddingBottom: bottomInset,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
