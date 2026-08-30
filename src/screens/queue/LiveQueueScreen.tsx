import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { colors, typography, radius, shadows } from "../../theme";
import { QueueStatCards } from "./components/QueueStatCards";
import { UpNextCallingDeck } from "./components/UpNextCallingDeck";
import { PatientCardItem } from "./components/PatientCardItem";
import { WalkInPatientModal } from "./components/WalkInPatientModal";
import { ClinicStatusModal } from "./components/ClinicStatusModal";
import { HolidayOverrideModal } from "./components/HolidayOverrideModal";
import { UndoToastBar } from "./components/UndoToastBar";
import { StatusPill } from "../../components/ui/StatusPill";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { doctorApi } from "../../api/doctor";
import { QueueTokenItem, QueueStats } from "../../types/queue";
import { ClinicAvailabilityStatus } from "../../types/doctor";
import {
  Search,
  UserPlus,
  CalendarX,
  RefreshCw,
  AlertCircle,
  Users,
} from "lucide-react-native";

export const LiveQueueScreen: React.FC = () => {
  const [tokens, setTokens] = useState<QueueTokenItem[]>([]);
  const [stats, setStats] = useState<QueueStats>({
    total: 0,
    waiting: 0,
    completed: 0,
    currentActive: 0,
    avgWaitTime: 15,
    emergencyCount: 0,
    heldCount: 0,
    noShowCount: 0,
  });
  const [clinicStatus, setClinicStatus] = useState<ClinicAvailabilityStatus>("AVAILABLE");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("All");

  // Modals state
  const [isWalkInVisible, setIsWalkInVisible] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isHolidayModalVisible, setIsHolidayModalVisible] = useState(false);

  // Undo Toast state
  const [undoToast, setUndoToast] = useState<{
    visible: boolean;
    token: string | null;
    patientName: string;
  }>({ visible: false, token: null, patientName: "" });

  const fetchQueueData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await doctorApi.getQueue();
      if (res.success && res.tokens) {
        const avgTime = res.doctor?.averageConsultationTime || 15;
        const currentActive = res.stats?.currentActive || 0;

        let emergencyCount = 0;
        let heldCount = 0;
        let noShowCount = 0;

        res.tokens.forEach((t: any) => {
          const isEmergency = t.isEmergency || t.tokenNumber >= 9000;
          if (isEmergency && t.status !== "COMPLETED" && t.status !== "CANCELLED") emergencyCount++;
          if (t.status === "HELD" || t.status === "AWAITING_ARRIVAL") heldCount++;
          if (t.status === "NO_SHOW") noShowCount++;
        });

        const formatted = res.tokens.map((t: any): QueueTokenItem => {
          const isEmergency = t.isEmergency || t.tokenNumber >= 9000;
          const waitTokens = isEmergency ? 0 : Math.max(0, t.tokenNumber - currentActive - 1);
          const isWaitingState = ["BOOKED", "READY", "PAYMENT_PENDING"].includes(t.status);
          const waitTime = isWaitingState && !isEmergency ? waitTokens * avgTime : 0;
          const displayName = t.patient?.name || t.user?.name || t.walkinName || t.walkInEntry?.patientName || "Patient";

          let mappedStatus = t.status;
          if (isWaitingState) mappedStatus = "Waiting";
          else if (t.status === "COMPLETED") mappedStatus = "Served";
          else if (["IN_CONSULTATION", "CALLED"].includes(t.status)) mappedStatus = "In-Person";
          else if (t.status === "HELD" || t.status === "AWAITING_ARRIVAL") mappedStatus = "Held";
          else if (t.status === "NO_SHOW") mappedStatus = "No-Show";

          return {
            id: t.id,
            tokenNumber: t.tokenNumber,
            token: t.tokenNumber,
            name: displayName,
            initials: displayName.substring(0, 2).toUpperCase(),
            phone: t.walkinPhone || t.patient?.phone || t.user?.phone || "",
            condition: t.walkInEntry?.symptoms || "General",
            visitType: (t.type === "ONLINE" || t.source === "ONLINE") ? "Online" : "Walk-in",
            waitTime,
            priority: isEmergency ? "Emergency" : "Standard",
            location: t.walkinAddress || t.patient?.location || "Local",
            status: mappedStatus,
            appointmentTime: new Date(t.tokenIssuedAt || t.createdAt || Date.now()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            age: t.age ?? null,
            paymentVerified: Boolean(t.paymentVerified),
            paymentMode: t.verifiedBy === "CASH" ? "CASH" : t.verifiedBy === "ONLINE" ? "ONLINE" : null,
            isFollowUpWaived: Boolean(t.isFollowUpWaived),
          };
        });

        setTokens(formatted);
        setStats({
          ...res.stats,
          emergencyCount,
          heldCount,
          noShowCount,
        });
      }
    } catch (e) {
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // 30s Polling Loop
  useEffect(() => {
    fetchQueueData();
    const timer = setInterval(() => {
      fetchQueueData(false);
    }, 30000);
    return () => clearInterval(timer);
  }, [fetchQueueData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchQueueData(false);
  };

  // Derive Active Patient and Up Next Patient
  const currentPatient = useMemo(() => {
    return tokens.find((t) => t.status === "In-Person") || null;
  }, [tokens]);

  const upNextPatient = useMemo(() => {
    return tokens.find((t) => t.status === "Waiting") || null;
  }, [tokens]);

  // Filtered Tokens for List
  const filteredTokens = useMemo(() => {
    return tokens.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.phone.includes(searchQuery) ||
        String(t.tokenNumber).includes(searchQuery);

      if (!matchesSearch) return false;

      if (selectedFilter === "All") return true;
      if (selectedFilter === "Emergency") return t.priority === "Emergency";
      return t.status === selectedFilter;
    });
  }, [tokens, searchQuery, selectedFilter]);

  // Calling Actions
  const handleAdvanceNextPatient = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await doctorApi.advanceNextPatient(currentPatient?.id);
      if (res.data?.undoToken && currentPatient) {
        setUndoToast({
          visible: true,
          token: res.data.undoToken,
          patientName: currentPatient.name,
        });
      }
      await fetchQueueData(false);
    } catch (e: any) {
      Alert.alert("Queue Action", e.message || "Failed to call next patient");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUndoNext = async (undoToken: string) => {
    setIsProcessing(true);
    try {
      await doctorApi.undoNextPatient(undoToken);
      setUndoToast({ visible: false, token: null, patientName: "" });
      await fetchQueueData(false);
    } catch (e: any) {
      Alert.alert("Undo Failed", e.message || "Could not undo previous call");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinishConsultation = async (tokenId: string) => {
    setIsProcessing(true);
    try {
      await doctorApi.finishConsultation(tokenId);
      await fetchQueueData(false);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to finish consultation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHoldPatient = async (tokenId: string) => {
    setIsProcessing(true);
    try {
      await doctorApi.holdPatient(tokenId);
      await fetchQueueData(false);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to place on hold");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResumePatient = async (tokenId: string) => {
    setIsProcessing(true);
    try {
      await doctorApi.resumePatient(tokenId);
      await fetchQueueData(false);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to resume patient");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNoShow = async (tokenId: string) => {
    setIsProcessing(true);
    try {
      await doctorApi.markNoShow(tokenId);
      await fetchQueueData(false);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to mark no-show");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCollectPayment = async (tokenId: string, mode: "CASH" | "ONLINE") => {
    try {
      await doctorApi.recordPayment(tokenId, mode);
      await fetchQueueData(false);
    } catch (e: any) {
      Alert.alert("Payment Error", e.message || "Failed to record payment");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Live OPD Queue</Text>
          <StatusPill
            status={clinicStatus}
            onPress={() => setIsStatusModalVisible(true)}
          />
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setIsHolidayModalVisible(true)}
          >
            <CalendarX size={18} color={colors.navy} />
          </TouchableOpacity>

          <Button
            title="+ Walk-In"
            variant="primary"
            size="sm"
            onPress={() => setIsWalkInVisible(true)}
            icon={<UserPlus size={14} color="#FFFFFF" />}
          />
        </View>
      </View>

      <FlatList
        data={filteredTokens}
        keyExtractor={(item: QueueTokenItem) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <View>
            {/* Stat Cards */}
            <QueueStatCards stats={stats} />

            {/* Up Next Calling Deck */}
            <View style={{ marginTop: 14 }}>
              <UpNextCallingDeck
                currentPatient={currentPatient}
                upNextPatient={upNextPatient}
                isProcessing={isProcessing}
                onNextPatient={handleAdvanceNextPatient}
                onConfirmEntry={(id) => doctorApi.confirmEntry(id).then(() => fetchQueueData(false))}
                onFinish={handleFinishConsultation}
                onHold={handleHoldPatient}
                onNoShow={handleNoShow}
              />
            </View>

            {/* Search & Filter Bar */}
            <View style={styles.searchSection}>
              <Input
                placeholder="Search patient name, phone, token..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                leftIcon={<Search size={16} color={colors.primary} />}
                containerStyle={{ marginBottom: 10 }}
              />

              {/* Status Filter Pills */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillRow}>
                {["All", "Waiting", "In-Person", "Emergency", "Held", "No-Show", "Served"].map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.filterPill, selectedFilter === f && styles.filterPillActive]}
                    onPress={() => setSelectedFilter(f)}
                  >
                    <Text style={[styles.filterPillText, selectedFilter === f && styles.filterPillTextActive]}>
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        }
        renderItem={({ item }: { item: QueueTokenItem }) => (
          <PatientCardItem
            patient={item}
            onCall={handleAdvanceNextPatient}
            onHold={handleHoldPatient}
            onResume={handleResumePatient}
            onNoShow={handleNoShow}
            onCollectPayment={handleCollectPayment}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyList}>
              <Users size={36} color={colors.textMuted} />
              <Text style={styles.emptyListTitle}>No Patients in Selected View</Text>
              <Text style={styles.emptyListSub}>
                {searchQuery ? "Try searching with a different name or number." : "Patients will appear here once added to queue."}
              </Text>
            </View>
          ) : (
            <View style={{ padding: 20 }}>
              <Skeleton height={80} style={{ marginBottom: 10 }} />
              <Skeleton height={80} style={{ marginBottom: 10 }} />
            </View>
          )
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Undo Toast */}
      <UndoToastBar
        visible={undoToast.visible}
        undoToken={undoToast.token}
        patientName={undoToast.patientName}
        onUndo={handleUndoNext}
        onDismiss={() => setUndoToast({ visible: false, token: null, patientName: "" })}
      />

      {/* Modals */}
      <WalkInPatientModal
        visible={isWalkInVisible}
        onClose={() => setIsWalkInVisible(false)}
        onSubmit={async (data) => {
          await doctorApi.registerWalkIn(data);
          await fetchQueueData(false);
        }}
      />

      <ClinicStatusModal
        visible={isStatusModalVisible}
        currentStatus={clinicStatus}
        onClose={() => setIsStatusModalVisible(false)}
        onSubmit={async (status, reason, duration) => {
          await doctorApi.updateClinicStatus({ status, reason, durationMinutes: duration });
          setClinicStatus(status);
        }}
      />

      <HolidayOverrideModal
        visible={isHolidayModalVisible}
        onClose={() => setIsHolidayModalVisible(false)}
        onSubmit={async (active, reason, mode) => {
          await doctorApi.toggleHoliday({ active, reason, mode });
          await fetchQueueData(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.surface,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    ...typography.titleMedium,
    color: colors.navy,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.mutedBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  filterPillRow: {
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.mutedBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: "none",
    fontWeight: "700",
  },
  filterPillTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyList: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyListTitle: {
    ...typography.titleSmall,
    color: colors.navy,
    marginTop: 10,
  },
  emptyListSub: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
});
