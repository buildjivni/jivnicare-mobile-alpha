import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { colors, typography, radius, shadows } from "../../../theme";
import { RotateCcw, X } from "lucide-react-native";

export interface UndoToastBarProps {
  visible: boolean;
  undoToken: string | null;
  patientName: string;
  onUndo: (undoToken: string) => void;
  onDismiss: () => void;
}

export const UndoToastBar: React.FC<UndoToastBarProps> = ({
  visible,
  undoToken,
  patientName,
  onUndo,
  onDismiss,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(25);

  useEffect(() => {
    if (!visible) return;
    setSecondsRemaining(25);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible || !undoToken) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textBlock}>
          <Text style={styles.title}>Called Next Patient</Text>
          <Text style={styles.subtitle}>Previous: {patientName} ({secondsRemaining}s)</Text>
        </View>

        <TouchableOpacity
          style={styles.undoButton}
          onPress={() => onUndo(undoToken)}
        >
          <RotateCcw size={14} color="#FFFFFF" />
          <Text style={styles.undoText}>UNDO</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <X size={16} color="rgba(255, 255, 255, 0.7)" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 85,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.navy,
    borderRadius: radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...shadows.premium,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    ...typography.titleSmall,
    fontSize: 13,
    color: "#FFFFFF",
  },
  subtitle: {
    ...typography.caption,
    fontSize: 10,
    color: colors.primaryLight,
    textTransform: "none",
    marginTop: 2,
  },
  undoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    marginRight: 8,
  },
  undoText: {
    ...typography.caption,
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "900",
  },
  dismissButton: {
    padding: 4,
  },
});
