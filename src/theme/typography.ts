import { TextStyle, Platform } from "react-native";

export const fontFamilies = {
  heading: Platform.select({ ios: "System", android: "Roboto", default: "System" }),
  body: Platform.select({ ios: "System", android: "Roboto", default: "System" }),
};

export const typography = {
  // Display & Headings (Outfit-matching weights and line heights)
  display: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.8,
    lineHeight: 38,
  } as TextStyle,
  
  titleLarge: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 32,
  } as TextStyle,
  
  titleMedium: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
    lineHeight: 26,
  } as TextStyle,
  
  titleSmall: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.2,
    lineHeight: 22,
  } as TextStyle,

  // Body & Content (Inter-matching weights)
  bodyLarge: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  } as TextStyle,
  
  bodyMedium: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  } as TextStyle,
  
  bodySmall: {
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 18,
  } as TextStyle,

  // UI Badges, Tags, Micro-Labels
  caption: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  } as TextStyle,
  
  button: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.1,
  } as TextStyle,
};
