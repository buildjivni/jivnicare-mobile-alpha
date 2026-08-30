import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Share,
} from "react-native";
import { ScreenContainer } from "../../components/layout/ScreenContainer";
import { colors, typography, radius, shadows } from "../../theme";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Skeleton } from "../../components/ui/Skeleton";
import { doctorApi } from "../../api/doctor";
import {
  Search,
  Calendar,
  Phone,
  FileDown,
  Users,
  CheckCircle2,
  Clock,
  User,
} from "lucide-react-native";

type DatePreset = "today" | "week" | "month";

export const PatientRecordsScreen: React.FC = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [preset, setPreset] = useState<DatePreset>("month");
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const loadPatients = useCallback(async () => {
    try {
      const now = new Date();
      let fromDate = new Date();
      if (preset === "today") {
        fromDate = now;
      } else if (preset === "week") {
        fromDate.setDate(now.getDate() - 7);
      } else if (preset === "month") {
        fromDate.setDate(now.getDate() - 30);
      }

      const from = fromDate.toISOString().split("T")[0];
      const to = now.toISOString().split("T")[0];

      const res = await doctorApi.getPatients({
        search: debouncedSearch || undefined,
        from,
        to,
        limit: 50,
      });

      if (res.data || res.patients) {
        setPatients(res.data || res.patients || []);
      }
    } catch (e) {
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [debouncedSearch, preset]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleExport = async () => {
    try {
      const content = patients.map((p) => `#${p.tokenNumber} - ${p.patientName} (${p.patientPhone || "N/A"}) - ${p.status} - ${p.date || ""}`).join("\n");
      await Share.share({
        title: "Patient Records Export",
        message: `JivniCare OPD Patient Records Summary:\n\n${content}`,
      });
    } catch (e) {}
  };

  return (
    <ScreenContainer style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Patient Records</Text>
          <Text style={styles.subtitle}>Directory of consultations and history</Text>
        </View>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
          <FileDown size={16} color={colors.primary} />
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search by patient name, phone..."
          value={search}
          onChangeText={setSearch}
          leftIcon={<Search size={16} color={colors.primary} />}
          containerStyle={{ marginBottom: 10 }}
        />

        {/* Date Filter Pills */}
        <View style={styles.presetRow}>
          {[
            { key: "today", label: "Today" },
            { key: "week", label: "This Week" },
            { key: "month", label: "Last 30 Days" },
          ].map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.presetPill, preset === p.key && styles.presetPillActive]}
              onPress={() => setPreset(p.key as DatePreset)}
            >
              <Text
                style={[styles.presetText, preset === p.key && styles.presetTextActive]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Records List */}
      <FlatList
        data={patients}
        keyExtractor={(item: any, index: number) => item.id || String(index)}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); loadPatients(); }} />
        }
        renderItem={({ item }: { item: any }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedPatient(item)}
          >
            <Card style={styles.patientCard}>
              <View style={styles.cardTopRow}>
                <View style={styles.tokenBox}>
                  <Text style={styles.tokenNumber}>#{item.tokenNumber}</Text>
                </View>
                <View style={styles.patientNameBox}>
                  <Text style={styles.patientName}>{item.patientName || "Patient"}</Text>
                  <Text style={styles.patientMeta}>
                    {item.type || "Online"} • {item.date || "Today"}
                  </Text>
                </View>
                {item.visitCount && (
                  <Badge
                    label={`Visit #${item.visitCount}`}
                    variant="accent"
                    size="sm"
                  />
                )}
              </View>

              <View style={styles.cardBottomRow}>
                <View style={styles.phoneRow}>
                  <Phone size={12} color={colors.textMuted} />
                  <Text style={styles.phoneText}>
                    {item.patientPhone ? `+91 ${item.patientPhone}` : "No phone provided"}
                  </Text>
                </View>
                <Badge
                  label={item.status || "COMPLETED"}
                  variant={item.status === "COMPLETED" ? "success" : "neutral"}
                  size="sm"
                />
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Users size={36} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Records Found</Text>
              <Text style={styles.emptySub}>
                {search ? "No patients match your search query." : "No consultations recorded in this date range."}
              </Text>
            </View>
          ) : (
            <View style={{ padding: 20 }}>
              <Skeleton height={70} style={{ marginBottom: 10 }} />
              <Skeleton height={70} style={{ marginBottom: 10 }} />
            </View>
          )
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <Modal
          visible={Boolean(selectedPatient)}
          onClose={() => setSelectedPatient(null)}
          title={selectedPatient.patientName || "Patient Profile"}
          subtitle={`Token #${selectedPatient.tokenNumber} • Consultation Summary`}
          footer={
            <Button
              title="Close Details"
              variant="outline"
              size="md"
              onPress={() => setSelectedPatient(null)}
              style={{ width: "100%" }}
            />
          }
        >
          <View style={styles.detailSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mobile Phone</Text>
              <Text style={styles.detailValue}>
                {selectedPatient.patientPhone ? `+91 ${selectedPatient.patientPhone}` : "N/A"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Consultation Date</Text>
              <Text style={styles.detailValue}>{selectedPatient.date || "N/A"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Registration Type</Text>
              <Text style={styles.detailValue}>{selectedPatient.type || "Online Booking"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Consultation Status</Text>
              <Text style={styles.detailValue}>{selectedPatient.status || "COMPLETED"}</Text>
            </View>
            {selectedPatient.address && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Patient Address</Text>
                <Text style={styles.detailValue}>{selectedPatient.address}</Text>
              </View>
            )}
          </View>
        </Modal>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  title: {
    ...typography.titleMedium,
    color: colors.navy,
  },
  subtitle: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: "none",
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  exportText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primary,
    fontWeight: "800",
    textTransform: "none",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
  },
  presetPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.mutedBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  presetPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: "none",
    fontWeight: "700",
  },
  presetTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 80,
  },
  patientCard: {
    marginBottom: 10,
    padding: 14,
    borderRadius: radius.xl,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tokenBox: {
    marginRight: 10,
  },
  tokenNumber: {
    ...typography.titleSmall,
    color: colors.primary,
    fontWeight: "900",
  },
  patientNameBox: {
    flex: 1,
  },
  patientName: {
    ...typography.titleSmall,
    fontSize: 14,
    color: colors.textPrimary,
  },
  patientMeta: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: "none",
  },
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  phoneText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: "none",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyTitle: {
    ...typography.titleSmall,
    color: colors.navy,
    marginTop: 10,
  },
  emptySub: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  detailSection: {
    gap: 12,
    paddingVertical: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  detailLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.bodySmall,
    color: colors.navy,
    fontWeight: "700",
  },
});
