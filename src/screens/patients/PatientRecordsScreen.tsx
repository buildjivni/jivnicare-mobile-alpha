import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Share,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { ScreenContainer } from "../../components/layout/ScreenContainer";
import { colors, typography, radius, shadows } from "../../theme";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
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
  Globe,
  TrendingUp,
  MapPin,
  ChevronDown,
  ArrowLeft,
} from "lucide-react-native";

type DatePreset = "today" | "week" | "month" | "custom";

export interface PatientRecordsScreenProps {
  onBack?: () => void;
}

export const PatientRecordsScreen: React.FC<PatientRecordsScreenProps> = ({ onBack }) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [preset, setPreset] = useState<DatePreset>("month");

  // Custom date strings (YYYY-MM-DD)
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Records & Pagination State
  const [patients, setPatients] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Analytics Channel Breakdown
  const [onlineCount, setOnlineCount] = useState(0);
  const [walkInCount, setWalkInCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Apply preset dates
  const applyPreset = (p: DatePreset) => {
    setPreset(p);
    const now = new Date();
    let from = new Date();
    if (p === "today") {
      from = now;
    } else if (p === "week") {
      from.setDate(now.getDate() - 7);
    } else if (p === "month") {
      from.setDate(now.getDate() - 30);
    }
    if (p !== "custom") {
      setFromDate(from.toISOString().split("T")[0]);
      setToDate(now.toISOString().split("T")[0]);
    }
  };

  const fetchRecords = useCallback(
    async (pageToLoad: number, append: boolean = false) => {
      if (pageToLoad === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const [res, analyticsRes] = await Promise.all([
          doctorApi.getPatients({
            search: debouncedSearch || undefined,
            from: fromDate,
            to: toDate,
            page: pageToLoad,
            limit: 20,
          }),
          pageToLoad === 1
            ? doctorApi.getAnalytics(30).catch(() => ({ period: { onlineBookings: 0, walkInBookings: 0 } }))
            : Promise.resolve(null),
        ]);

        const rawList = res.data || res.patients || [];
        const pagination = res.pagination || {};
        const count = pagination.total ?? rawList.length;
        const pages = pagination.pages ?? 1;

        setTotalCount(count);
        setTotalPages(pages);
        setHasMore(pageToLoad < pages);
        setPage(pageToLoad);

        if (append) {
          setPatients((prev) => {
            const seen = new Set(prev.map((p) => p.id));
            const fresh = rawList.filter((p: any) => !seen.has(p.id));
            return [...prev, ...fresh];
          });
        } else {
          setPatients(rawList);
        }

        if (analyticsRes) {
          const aData = analyticsRes.period || analyticsRes.data?.period || {};
          setOnlineCount(aData.onlineBookings || 0);
          setWalkInCount(aData.walkInBookings || 0);
        }
      } catch (e) {
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
      }
    },
    [debouncedSearch, fromDate, toDate]
  );

  useEffect(() => {
    fetchRecords(1, false);
  }, [fetchRecords]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRecords(1, false);
  };

  const handleLoadMore = () => {
    if (!isLoading && !isLoadingMore && hasMore) {
      fetchRecords(page + 1, true);
    }
  };

  const chartTotal = onlineCount + walkInCount;
  const onlinePercent = chartTotal > 0 ? Math.round((onlineCount / chartTotal) * 100) : 0;
  const walkInPercent = chartTotal > 0 ? 100 - onlinePercent : 0;

  const handleExport = async () => {
    try {
      const content = patients
        .map(
          (p) =>
            `#${p.tokenNumber} - ${p.patientName || p.name} (${p.patientPhone || p.phone || "N/A"}) - ${p.status} - ${p.date || ""}`
        )
        .join("\n");
      await Share.share({
        title: "Patient Records Export",
        message: `JivniCare OPD Patient Records Summary (${fromDate} to ${toDate}):\n\n${content}`,
      });
    } catch (e) {}
  };

  return (
    <ScreenContainer style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
              <ArrowLeft size={20} color={colors.navy} />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Patient Records</Text>
            <Text style={styles.subtitle}>Directory of past consultations and visit history</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport} activeOpacity={0.8}>
          <FileDown size={15} color={colors.primary} />
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={patients}
        keyExtractor={(item: any, index: number) => item.id || String(index)}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <View>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Input
                placeholder="Search patient name, phone..."
                value={search}
                onChangeText={setSearch}
                leftIcon={<Search size={16} color={colors.primary} />}
                containerStyle={{ marginBottom: 10 }}
              />

              {/* Date Filter Preset Pills */}
              <View style={styles.presetRow}>
                {[
                  { key: "today", label: "Today" },
                  { key: "week", label: "This Week" },
                  { key: "month", label: "Last 30 Days" },
                  { key: "custom", label: "Custom Range" },
                ].map((p) => (
                  <TouchableOpacity
                    key={p.key}
                    style={[styles.presetPill, preset === p.key && styles.presetPillActive]}
                    onPress={() => applyPreset(p.key as DatePreset)}
                  >
                    <Text style={[styles.presetText, preset === p.key && styles.presetTextActive]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ── 2. CUSTOM FROM / TO DATE PICKERS (Matching Web) ── */}
              <View style={styles.customDateGrid}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dateLabel}>FROM (YYYY-MM-DD)</Text>
                  <View style={styles.dateInputWrapper}>
                    <Calendar size={13} color={colors.primary} />
                    <TextInput
                      style={styles.dateInput}
                      value={fromDate}
                      onChangeText={(v) => {
                        setFromDate(v);
                        setPreset("custom");
                      }}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.dateLabel}>TO (YYYY-MM-DD)</Text>
                  <View style={styles.dateInputWrapper}>
                    <Calendar size={13} color={colors.primary} />
                    <TextInput
                      style={styles.dateInput}
                      value={toDate}
                      onChangeText={(v) => {
                        setToDate(v);
                        setPreset("custom");
                      }}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* ── 1. CHANNEL DISTRIBUTION BREAKDOWN STRIP (Matching Web) ── */}
            <Card style={styles.channelStrip}>
              <View style={styles.channelHeaderRow}>
                <View>
                  <Text style={styles.channelTotalCount}>
                    {totalCount} total record{totalCount === 1 ? "" : "s"}
                  </Text>
                  <Text style={styles.channelTotalSub}>
                    Showing {patients.length} loaded
                  </Text>
                </View>

                {/* Channel Breakdown Pills */}
                <View style={styles.channelPillsGroup}>
                  <View style={styles.onlinePill}>
                    <Globe size={11} color={colors.primary} />
                    <Text style={styles.onlinePillText}>
                      Online {onlinePercent}% ({onlineCount})
                    </Text>
                  </View>

                  <View style={styles.walkInPill}>
                    <Users size={11} color={colors.secondary} />
                    <Text style={styles.walkInPillText}>
                      Walk-in {walkInPercent}% ({walkInCount})
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          </View>
        }
        renderItem={({ item }: { item: any }) => {
          const isEmergency = item.isEmergency || item.tokenNumber >= 9000;
          const displayName = item.patientName || item.name || "Patient";
          const displayPhone = item.patientPhone || item.phone || "";
          const isOnlineSource = item.type === "ONLINE" || item.source === "ONLINE";

          return (
            <TouchableOpacity
              style={styles.patientCard}
              onPress={() => setSelectedPatient(item)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={styles.tokenBox}>
                  <Text style={[styles.tokenText, isEmergency && { color: colors.destructive }]}>
                    #{item.tokenNumber}
                  </Text>
                </View>

                <View style={styles.badgeRow}>
                  <Badge
                    label={isOnlineSource ? "Online" : "Walk-in"}
                    variant="neutral"
                    size="sm"
                  />
                  <Badge
                    label={item.status || "COMPLETED"}
                    variant={item.status === "COMPLETED" ? "neutral" : "success"}
                    size="sm"
                  />
                  {isEmergency && (
                    <Badge label="Emergency" variant="destructive" size="sm" />
                  )}
                </View>

                <Text style={styles.dateText}>
                  {item.date || new Date(item.createdAt || Date.now()).toLocaleDateString([], { month: "short", day: "numeric" })}
                </Text>
              </View>

              <View style={styles.patientBody}>
                <Text style={styles.patientName}>{displayName}</Text>
                <Text style={styles.patientMeta}>
                  {item.condition || item.symptoms || "General OPD"}
                  {item.age ? ` • ${item.age} yrs` : ""}
                  {item.gender ? ` • ${item.gender}` : ""}
                </Text>
                {Boolean(displayPhone) && (
                  <Text style={styles.phoneText}>+91 {displayPhone}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loadingMoreBox}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingMoreText}>Loading more records...</Text>
            </View>
          ) : hasMore ? (
            <TouchableOpacity
              style={styles.loadMoreBtn}
              onPress={handleLoadMore}
              activeOpacity={0.8}
            >
              <Text style={styles.loadMoreBtnText}>Load More Records</Text>
              <ChevronDown size={14} color={colors.primary} />
            </TouchableOpacity>
          ) : patients.length > 0 ? (
            <View style={styles.endOfListBox}>
              <Text style={styles.endOfListText}>All {totalCount} records loaded</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Users size={36} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Records Found</Text>
              <Text style={styles.emptySub}>
                {debouncedSearch
                  ? "No matching patients match your search query."
                  : "No visits recorded in this date window."}
              </Text>
            </View>
          ) : null
        }
      />

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <Modal
          visible={Boolean(selectedPatient)}
          onClose={() => setSelectedPatient(null)}
          title={`Token #${selectedPatient.tokenNumber}`}
          subtitle="Full visit details"
        >
          <View style={styles.modalContent}>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Patient Name</Text>
              <Text style={styles.modalValue}>
                {selectedPatient.patientName || selectedPatient.name || "Patient"}
              </Text>
            </View>

            {Boolean(selectedPatient.patientPhone || selectedPatient.phone) && (
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Mobile Number</Text>
                <Text style={styles.modalValue}>
                  +91 {selectedPatient.patientPhone || selectedPatient.phone}
                </Text>
              </View>
            )}

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Booking Type</Text>
              <Text style={styles.modalValue}>
                {selectedPatient.type || selectedPatient.source || "Walk-in"}
              </Text>
            </View>

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Status</Text>
              <Text style={styles.modalValue}>{selectedPatient.status || "COMPLETED"}</Text>
            </View>

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Chief Complaint / Symptoms</Text>
              <Text style={styles.modalValue}>
                {selectedPatient.condition || selectedPatient.symptoms || "General"}
              </Text>
            </View>
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
    backgroundColor: colors.surface,
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
  backButton: {
    padding: 6,
    borderRadius: radius.md,
    backgroundColor: colors.mutedBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
  },
  exportText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primary,
    fontWeight: "700",
    textTransform: "none",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  presetRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
  },
  presetPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
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
    fontWeight: "600",
  },
  presetTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  customDateGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  dateLabel: {
    ...typography.caption,
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: "700",
    marginBottom: 3,
  },
  dateInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
  },
  dateInput: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    color: colors.textPrimary,
    padding: 0,
  },
  channelStrip: {
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 10,
    padding: 12,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.soft,
  },
  channelHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  channelTotalCount: {
    ...typography.titleSmall,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  channelTotalSub: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
    textTransform: "none",
  },
  channelPillsGroup: {
    flexDirection: "row",
    gap: 6,
  },
  onlinePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  onlinePillText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "none",
  },
  walkInPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  walkInPillText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: colors.secondary,
    textTransform: "none",
  },
  listContent: {
    paddingBottom: 130,
  },
  patientCard: {
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 12,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.soft,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  tokenBox: {
    marginRight: 8,
  },
  tokenText: {
    ...typography.titleSmall,
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  dateText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
  patientBody: {
    marginTop: 2,
  },
  patientName: {
    ...typography.titleSmall,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  patientMeta: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    textTransform: "none",
  },
  phoneText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: "none",
  },
  loadingMoreBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  loadingMoreText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  loadMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
  },
  loadMoreBtnText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "none",
  },
  endOfListBox: {
    alignItems: "center",
    paddingVertical: 14,
  },
  endOfListText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "none",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
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
  modalContent: {
    gap: 12,
  },
  modalRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingBottom: 8,
  },
  modalLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "700",
    textTransform: "none",
  },
  modalValue: {
    ...typography.bodySmall,
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 2,
  },
});
