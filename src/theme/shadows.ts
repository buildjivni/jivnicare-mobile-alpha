import { ViewStyle } from "react-native";

export const shadows = {
  soft: {
    shadowColor: "#1B3F6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  } as ViewStyle,
  
  card: {
    shadowColor: "#1B3F6B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  } as ViewStyle,
  
  premium: {
    shadowColor: "#1B3F6B",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 8,
  } as ViewStyle,
  
  button: {
    shadowColor: "#4B9F5F",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  } as ViewStyle,
};
