import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { colors, typography, radius } from "../../../theme";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Clock, Users, Check, X, Save } from "lucide-react-native";

export interface DaySchedule {
  isOpen: boolean;
  start: string;
  end: string;
  maxPatients?: number | string;
}

export type WeeklySchedule = Record<string, DaySchedule>;

const DAYS = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

export function buildDefaultSchedule(defaultMaxPatients = 30): WeeklySchedule {
  return {
    monday: { isOpen: true, start: "09:00", end: "17:00", maxPatients: defaultMaxPatients },
    tuesday: { isOpen: true, start: "09:00", end: "17:00", maxPatients: defaultMaxPatients },
    wednesday: { isOpen: true, start: "09:00", end: "17:00", maxPatients: defaultMaxPatients },
    thursday: { isOpen: true, start: "09:00", end: "17:00", maxPatients: defaultMaxPatients },
    friday: { isOpen: true, start: "09:00", end: "17:00", maxPatients: defaultMaxPatients },
    saturday: { isOpen: false, start: "09:00", end: "17:00", maxPatients: 0 },
    sunday: { isOpen: false, start: "09:00", end: "17:00", maxPatients: 0 },
  };
}

export interface WeeklyScheduleEditorProps {
  initialSchedule?: WeeklySchedule;
  onSave: (schedule: WeeklySchedule) => Promise<void>;
  isSaving?: boolean;
}

export const WeeklyScheduleEditor: React.FC<WeeklyScheduleEditorProps> = ({
  initialSchedule,
  onSave,
  isSaving = false,
}) => {
  const [schedule, setSchedule] = useState<WeeklySchedule>(() => {
    if (initialSchedule && Object.keys(initialSchedule).length > 0) {
      const merged = { ...buildDefaultSchedule() };
      for (const day of DAYS) {
        if (initialSchedule[day.id]) {
          merged[day.id] = {
            isOpen: Boolean(initialSchedule[day.id].isOpen),
            start: initialSchedule[day.id].start || "09:00",
            end: initialSchedule[day.id].end || "17:00",
            maxPatients: initialSchedule[day.id].maxPatients ?? 30,
          };
        }
      }
      return merged;
    }
    return buildDefaultSchedule();
  });

  const toggleDay = (dayId: string) => {
    const current = schedule[dayId] || { isOpen: false, start: "09:00", end: "17:00", maxPatients: 30 };
    setSchedule({
      ...schedule,
      [dayId]: {
        ...current,
        isOpen: !current.isOpen,
        maxPatients: !current.isOpen && (!current.maxPatients || Number(current.maxPatients) < 1) ? 30 : current.maxPatients,
      },
    });
  };

  const updateField = (dayId: string, field: "start" | "end" | "maxPatients", val: string) => {
    const current = schedule[dayId] || { isOpen: true, start: "09:00", end: "17:00", maxPatients: 30 };
    setSchedule({
      ...schedule,
      [dayId]: {
        ...current,
        [field]: field === "maxPatients" ? (val === "" ? "" : parseInt(val, 10) || 0) : val,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Weekly Operating Hours</Text>
      <Text style={styles.sectionSub}>
        Configure open days, start/end consultation timings, and max patient capacity.
      </Text>

      {DAYS.map((day) => {
        const dayConfig = schedule[day.id] || { isOpen: false, start: "09:00", end: "17:00", maxPatients: 0 };
        const isOpen = dayConfig.isOpen;

        return (
          <Card key={day.id} style={[styles.dayCard, isOpen ? styles.dayCardOpen : styles.dayCardClosed]}>
            {/* Top row: Day Name & Toggle */}
            <View style={styles.dayTopRow}>
              <View style={styles.dayTitleBlock}>
                <Text style={[styles.dayName, !isOpen && styles.dayNameClosed]}>{day.label}</Text>
                <Badge
                  label={isOpen ? "OPEN" : "CLOSED"}
                  variant={isOpen ? "success" : "neutral"}
                  size="sm"
                />
              </View>

              <TouchableOpacity
                style={[styles.toggleBtn, isOpen ? styles.toggleBtnActive : styles.toggleBtnInactive]}
                onPress={() => toggleDay(day.id)}
                activeOpacity={0.8}
              >
                {isOpen ? <Check size={14} color="#FFFFFF" /> : <X size={14} color={colors.textMuted} />}
                <Text style={[styles.toggleBtnText, isOpen && styles.toggleBtnTextActive]}>
                  {isOpen ? "Open" : "Closed"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Inline Editor Fields when day is OPEN */}
            {isOpen && (
              <View style={styles.editorFields}>
                <View style={styles.timeInputsRow}>
                  {/* Start Time */}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Start Time</Text>
                    <View style={styles.inputWrapper}>
                      <Clock size={13} color={colors.primary} />
                      <TextInput
                        style={styles.timeInput}
                        value={dayConfig.start}
                        onChangeText={(v) => updateField(day.id, "start", v)}
                        placeholder="09:00"
                        placeholderTextColor={colors.textMuted}
                      />
                    </View>
                  </View>

                  {/* End Time */}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>End Time</Text>
                    <View style={styles.inputWrapper}>
                      <Clock size={13} color={colors.primary} />
                      <TextInput
                        style={styles.timeInput}
                        value={dayConfig.end}
                        onChangeText={(v) => updateField(day.id, "end", v)}
                        placeholder="17:00"
                        placeholderTextColor={colors.textMuted}
                      />
                    </View>
                  </View>

                  {/* Max Patients */}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Max Limit</Text>
                    <View style={styles.inputWrapper}>
                      <Users size={13} color={colors.secondary} />
                      <TextInput
                        style={styles.timeInput}
                        value={dayConfig.maxPatients !== undefined && dayConfig.maxPatients !== null ? String(dayConfig.maxPatients) : ""}
                        onChangeText={(v) => updateField(day.id, "maxPatients", v)}
                        placeholder="30"
                        keyboardType="number-pad"
                        placeholderTextColor={colors.textMuted}
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}
          </Card>
        );
      })}

      <Button
        title="Save Weekly Operating Hours"
        size="lg"
        variant="primary"
        onPress={() => onSave(schedule)}
        loading={isSaving}
        icon={<Save size={18} color="#FFFFFF" />}
        style={styles.saveBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  sectionHeader: {
    ...typography.titleMedium,
    color: colors.navy,
    fontWeight: "700",
  },
  sectionSub: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 14,
    textTransform: "none",
  },
  dayCard: {
    padding: 14,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  dayCardOpen: {
    borderColor: "rgba(86, 150, 199, 0.3)",
    backgroundColor: "#FFFFFF",
  },
  dayCardClosed: {
    opacity: 0.75,
    backgroundColor: colors.mutedBackground,
  },
  dayTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dayTitleBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dayName: {
    ...typography.titleSmall,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  dayNameClosed: {
    color: colors.textMuted,
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
  },
  toggleBtnActive: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  toggleBtnInactive: {
    backgroundColor: colors.mutedBackground,
  },
  toggleBtnText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "700",
    textTransform: "none",
  },
  toggleBtnTextActive: {
    color: "#FFFFFF",
  },
  editorFields: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  timeInputsRow: {
    flexDirection: "row",
    gap: 8,
  },
  fieldLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "none",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 38,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
  },
  timeInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
    padding: 0,
  },
  saveBtn: {
    marginTop: 14,
    width: "100%",
  },
});
