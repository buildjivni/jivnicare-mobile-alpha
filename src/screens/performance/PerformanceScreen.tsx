import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Rect,
  Circle,
  Path,
  Line,
  Text as SvgText,
  G,
} from "react-native-svg";
import { ScreenContainer } from "../../components/layout/ScreenContainer";
import { colors, typography, radius, shadows } from "../../theme";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { doctorApi } from "../../api/doctor";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import {
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  CalendarDays,
  Activity,
  Globe,
  UserX,
  Zap,
  IndianRupee,
  Lightbulb,
  Info,
  ArrowLeft,
} from "lucide-react-native";

export interface PerformanceScreenProps {
  onBack?: () => void;
}

function formatShortDate(iso: string) {
  try {
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return iso;
  }
}

export const PerformanceScreen: React.FC<PerformanceScreenProps> = ({ onBack }) => {
  const { profile } = useWorkspaceStore();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chartWidth, setChartWidth] = useState(Dimensions.get("window").width - 72);

  const loadAnalytics = async () => {
    try {
      const res = await doctorApi.getAnalytics(30);
      setData(res.period || res.data || res);
    } catch {
      // Graceful error handling
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const total = data?.totalBookings || 0;
  const completed = data?.completed || 0;
  const online = data?.onlineBookings || 0;
  const walkin = data?.walkInBookings || 0;
  const noShows = data?.noShows || 0;
  const noShowRate = data?.noShowRatePercent ?? 0;
  const avgWaitMinutes = data?.avgWaitMinutes;
  const peakHourLabel = data?.peakConsultationHourLabel;
  const busiestDayLabel = data?.busiestDayLabel;
  const dailyBookingTrend: Array<{ date: string; completed: number; issued: number }> =
    data?.dailyBookingTrend || [];
  const dailyWaitTrend: Array<{ date: string; avgWaitMinutes: number }> =
    data?.dailyWaitTrend || [];

  const periodDays = data?.days || 30;
  const avgPatientsPerDay =
    periodDays > 0 ? (Math.round((completed / periodDays) * 10) / 10).toFixed(1) : "0";

  const fee = parseInt(profile?.consultationFee || "0", 10);
  const estimatedRevenue = fee * completed;

  const onlinePercent = total > 0 ? Math.round((online / total) * 100) : 50;
  const walkinPercent = total > 0 ? 100 - onlinePercent : 50;

  // Channel dominance computation
  const dominantChannel =
    online >= walkin
      ? { name: "Online Booking", percent: onlinePercent }
      : { name: "Clinic Walk-in", percent: walkinPercent };

  // Calculate 7-day trend difference
  let recentTrend: number | null = null;
  if (dailyBookingTrend.length >= 14) {
    const last7 = dailyBookingTrend
      .slice(-7)
      .reduce((acc, curr) => acc + curr.completed, 0);
    const prev7 = dailyBookingTrend
      .slice(-14, -7)
      .reduce((acc, curr) => acc + curr.completed, 0);
    recentTrend = last7 - prev7;
  }

  // Helper to render Volume Trend Chart
  const renderVolumeTrendChart = () => {
    if (!dailyBookingTrend || dailyBookingTrend.length === 0) {
      return (
        <View style={styles.emptyChartBox}>
          <Text style={styles.emptyChartText}>No completion data yet for this period.</Text>
        </View>
      );
    }

    const hasAnyActivity = dailyBookingTrend.some(
      (d) => d.completed > 0 || d.issued > 0
    );

    if (!hasAnyActivity) {
      return (
        <View style={styles.emptyChartBox}>
          <Text style={styles.emptyChartText}>No completion data yet for this period.</Text>
        </View>
      );
    }

    const maxVal = Math.max(
      ...dailyBookingTrend.map((d) => Math.max(d.completed, d.issued)),
      4
    );

    const chartHeight = 140;
    const paddingLeft = 24;
    const paddingRight = 12;
    const paddingTop = 12;
    const paddingBottom = 24;
    const plotWidth = chartWidth - paddingLeft - paddingRight;
    const plotHeight = chartHeight - paddingTop - paddingBottom;

    const stepX =
      dailyBookingTrend.length > 1 ? plotWidth / (dailyBookingTrend.length - 1) : plotWidth;

    // Build SVG paths for Completed & Issued
    const completedPoints = dailyBookingTrend.map((d, i) => {
      const x = paddingLeft + i * stepX;
      const y = paddingTop + plotHeight - (d.completed / maxVal) * plotHeight;
      return { x, y, val: d.completed };
    });

    const issuedPoints = dailyBookingTrend.map((d, i) => {
      const x = paddingLeft + i * stepX;
      const y = paddingTop + plotHeight - (d.issued / maxVal) * plotHeight;
      return { x, y, val: d.issued };
    });

    const completedPath = completedPoints.reduce(
      (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
      ""
    );

    const issuedPath = issuedPoints.reduce(
      (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
      ""
    );

    const completedArea = `${completedPath} L ${
      completedPoints[completedPoints.length - 1].x
    } ${paddingTop + plotHeight} L ${completedPoints[0].x} ${
      paddingTop + plotHeight
    } Z`;

    // Pick 5 date labels
    const labelIndices = [
      0,
      Math.floor(dailyBookingTrend.length * 0.25),
      Math.floor(dailyBookingTrend.length * 0.5),
      Math.floor(dailyBookingTrend.length * 0.75),
      dailyBookingTrend.length - 1,
    ];

    return (
      <View style={styles.chartContainer}>
        {/* Chart Legend */}
        <View style={styles.chartLegendRow}>
          <View style={styles.legendIndicatorItem}>
            <View style={[styles.legendIndicatorDot, { backgroundColor: "#6366F1" }]} />
            <Text style={styles.legendIndicatorLabel}>Completed ({completed})</Text>
          </View>
          <View style={styles.legendIndicatorItem}>
            <View style={[styles.legendIndicatorDot, { backgroundColor: "#94A3B8" }]} />
            <Text style={styles.legendIndicatorLabel}>Issued ({total})</Text>
          </View>
        </View>

        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <SvgGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#6366F1" stopOpacity="0.3" />
              <Stop offset="1" stopColor="#6366F1" stopOpacity="0.0" />
            </SvgGradient>
          </Defs>

          {/* Grid lines */}
          <Line
            x1={paddingLeft}
            y1={paddingTop}
            x2={chartWidth - paddingRight}
            y2={paddingTop}
            stroke="#F1F5F9"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <SvgText
            x={paddingLeft - 4}
            y={paddingTop + 4}
            fill="#94A3B8"
            fontSize="9"
            textAnchor="end"
          >
            {maxVal}
          </SvgText>

          <Line
            x1={paddingLeft}
            y1={paddingTop + plotHeight / 2}
            x2={chartWidth - paddingRight}
            y2={paddingTop + plotHeight / 2}
            stroke="#F1F5F9"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <SvgText
            x={paddingLeft - 4}
            y={paddingTop + plotHeight / 2 + 3}
            fill="#94A3B8"
            fontSize="9"
            textAnchor="end"
          >
            {Math.round(maxVal / 2)}
          </SvgText>

          <Line
            x1={paddingLeft}
            y1={paddingTop + plotHeight}
            x2={chartWidth - paddingRight}
            y2={paddingTop + plotHeight}
            stroke="#E2E8F0"
            strokeWidth="1"
          />
          <SvgText
            x={paddingLeft - 4}
            y={paddingTop + plotHeight + 3}
            fill="#94A3B8"
            fontSize="9"
            textAnchor="end"
          >
            0
          </SvgText>

          {/* Area fill under Completed */}
          <Path d={completedArea} fill="url(#completedGrad)" />

          {/* Issued line */}
          <Path
            d={issuedPath}
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* Completed line */}
          <Path d={completedPath} fill="none" stroke="#6366F1" strokeWidth="2.5" />

          {/* Data Points */}
          {completedPoints.map(
            (p, idx) =>
              p.val > 0 && (
                <Circle
                  key={`dot-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  fill="#6366F1"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              )
          )}

          {/* X Axis Date Labels */}
          {labelIndices.map((idx) => {
            const d = dailyBookingTrend[idx];
            if (!d) return null;
            const x = paddingLeft + idx * stepX;
            return (
              <SvgText
                key={`label-${idx}`}
                x={x}
                y={chartHeight - 4}
                fill="#94A3B8"
                fontSize="8.5"
                textAnchor="middle"
              >
                {formatShortDate(d.date)}
              </SvgText>
            );
          })}
        </Svg>
      </View>
    );
  };

  // Helper to render Wait Time Trend Chart
  const renderWaitTimeTrendChart = () => {
    if (!dailyWaitTrend || dailyWaitTrend.length === 0) {
      return (
        <Text style={styles.emptyChartTextSmall}>
          Not enough completed visits with timing data to calculate wait times.
        </Text>
      );
    }

    const maxWait = Math.max(...dailyWaitTrend.map((d) => d.avgWaitMinutes), 20);
    const chartHeight = 90;
    const paddingLeft = 24;
    const paddingRight = 12;
    const paddingTop = 8;
    const paddingBottom = 20;
    const plotWidth = chartWidth - paddingLeft - paddingRight;
    const plotHeight = chartHeight - paddingTop - paddingBottom;
    const barWidth = Math.max(
      4,
      Math.min(12, (plotWidth / dailyWaitTrend.length) * 0.6)
    );
    const stepX =
      dailyWaitTrend.length > 1 ? plotWidth / (dailyWaitTrend.length - 1) : plotWidth;

    return (
      <View style={{ marginTop: 8 }}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Baseline */}
          <Line
            x1={paddingLeft}
            y1={paddingTop + plotHeight}
            x2={chartWidth - paddingRight}
            y2={paddingTop + plotHeight}
            stroke="#E2E8F0"
            strokeWidth="1"
          />

          {/* Bars */}
          {dailyWaitTrend.map((d, i) => {
            const x = paddingLeft + i * stepX - barWidth / 2;
            const barH = (d.avgWaitMinutes / maxWait) * plotHeight;
            const y = paddingTop + plotHeight - barH;
            return (
              <G key={`wait-bar-${i}`}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  fill="#10B981"
                  rx="3"
                />
              </G>
            );
          })}

          {/* Y Axis Unit */}
          <SvgText
            x={paddingLeft - 4}
            y={paddingTop + 8}
            fill="#94A3B8"
            fontSize="8.5"
            textAnchor="end"
          >
            {maxWait}m
          </SvgText>
        </Svg>
      </View>
    );
  };

  return (
    <ScreenContainer style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              loadAnalytics();
            }}
          />
        }
        showsVerticalScrollIndicator={false}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width - 40;
          if (w > 100) setChartWidth(w);
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeftRow}>
            {onBack && (
              <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                <ArrowLeft size={20} color={colors.navy} />
              </TouchableOpacity>
            )}
            <View>
              <Text style={styles.title}>Practice Analytics</Text>
              <Text style={styles.subtitle}>
                Last 30 days clinical volume & queue trends
              </Text>
            </View>
          </View>
          <Badge label="30-Day Period" variant="primary" size="sm" />
        </View>

        {/* Top 4 Metric Cards Grid */}
        <View style={styles.grid}>
          <Card style={styles.metricCard}>
            <View style={styles.iconRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
                <TrendingUp size={16} color={colors.primary} />
              </View>
              <Text style={styles.metricLabel}>Total OPD</Text>
            </View>
            <Text style={styles.metricNumber}>{total}</Text>
            <Text style={styles.metricSub}>Issued tokens</Text>
          </Card>

          <Card style={styles.metricCard}>
            <View style={styles.iconRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.secondaryLight }]}>
                <CheckCircle2 size={16} color={colors.secondary} />
              </View>
              <Text style={styles.metricLabel}>Completed</Text>
            </View>
            <Text style={[styles.metricNumber, { color: colors.secondary }]}>
              {completed}
            </Text>
            <Text style={styles.metricSub}>Patients served</Text>
          </Card>
        </View>

        <View style={styles.grid}>
          <Card style={styles.metricCard}>
            <View style={styles.iconRow}>
              <View style={[styles.iconBox, { backgroundColor: "#F3E8FF" }]}>
                <IndianRupee size={16} color="#9333EA" />
              </View>
              <Text style={styles.metricLabel}>Est. Revenue</Text>
            </View>
            <Text style={styles.metricNumber}>₹{estimatedRevenue.toLocaleString("en-IN")}</Text>
            <Text style={styles.metricSub}>₹{fee} × {completed} served</Text>
          </Card>

          <Card style={styles.metricCard}>
            <View style={styles.iconRow}>
              <View style={[styles.iconBox, { backgroundColor: "#FFE4E6" }]}>
                <UserX size={16} color={colors.destructive} />
              </View>
              <Text style={styles.metricLabel}>No-Show Rate</Text>
            </View>
            <Text style={[styles.metricNumber, { color: colors.destructive }]}>
              {noShowRate}%
            </Text>
            <Text style={styles.metricSub}>Of issued bookings</Text>
          </Card>
        </View>

        {/* ── 1. DAILY CONSULTATION VOLUME TREND CHART ── */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconBox, { backgroundColor: "#EEF2FF" }]}>
              <TrendingUp size={16} color="#6366F1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardHeading}>Daily Consultation Volume Trend</Text>
              <Text style={styles.cardSub}>
                Completed patient consultations vs. issued tokens over 30 days
              </Text>
            </View>
          </View>

          {renderVolumeTrendChart()}
        </Card>

        {/* ── 2. BOOKING CHANNEL SPLIT ── */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconBox, { backgroundColor: "#E0F2FE" }]}>
              <Globe size={16} color="#0284C7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardHeading}>Booking Channel Split</Text>
              <Text style={styles.cardSub}>Online JivniCare bookings vs. Clinic walk-ins</Text>
            </View>
          </View>

          <View style={styles.barContainer}>
            <View
              style={[
                styles.barSegment,
                { width: `${onlinePercent}%`, backgroundColor: colors.primary },
              ]}
            />
            <View
              style={[
                styles.barSegment,
                { width: `${walkinPercent}%`, backgroundColor: colors.secondary },
              ]}
            />
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>
                Online ({onlinePercent}%) — {online} patients
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.secondary }]} />
              <Text style={styles.legendText}>
                Walk-in ({walkinPercent}%) — {walkin} patients
              </Text>
            </View>
          </View>
        </Card>

        {/* ── 3. SECONDARY OPERATIONAL METRICS ── */}
        <View style={styles.secondaryMetricsRow}>
          <Card style={styles.secondaryMetricCard}>
            <View style={styles.secMetricIconBox}>
              <Users size={16} color={colors.primary} />
            </View>
            <Text style={styles.secMetricLabel}>Avg Patients / Day</Text>
            <Text style={styles.secMetricValue}>
              {completed > 0 ? avgPatientsPerDay : "—"}
            </Text>
          </Card>

          <Card style={styles.secondaryMetricCard}>
            <View style={styles.secMetricIconBox}>
              <Clock size={16} color="#F59E0B" />
            </View>
            <Text style={styles.secMetricLabel}>Peak Hour</Text>
            <Text style={styles.secMetricValue}>
              {peakHourLabel || "—"}
            </Text>
          </Card>

          <Card style={styles.secondaryMetricCard}>
            <View style={styles.secMetricIconBox}>
              <CalendarDays size={16} color={colors.secondary} />
            </View>
            <Text style={styles.secMetricLabel}>Busiest Day</Text>
            <Text style={styles.secMetricValue}>
              {busiestDayLabel || "—"}
            </Text>
          </Card>
        </View>

        {/* ── 4. PEAK OPERATIONAL INSIGHTS & PRACTICE ADVISORY ── */}
        <View style={styles.insightsSection}>
          <View style={styles.insightsSectionHeader}>
            <Lightbulb size={18} color="#F59E0B" />
            <Text style={styles.insightsSectionTitle}>Practice Insights & Advisory</Text>
          </View>

          {/* Queue Efficiency Card with Daily Wait Trend Chart */}
          <Card style={styles.insightCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBox, { backgroundColor: "#ECFDF5" }]}>
                <Zap size={16} color={colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardHeading}>Queue Efficiency & Wait Times</Text>
                <Text style={styles.cardSub}>
                  Wait time from registration to doctor consultation
                </Text>
              </View>
            </View>

            {avgWaitMinutes != null ? (
              <View style={styles.efficiencyContent}>
                <View style={styles.avgWaitBadge}>
                  <Clock size={14} color="#065F46" />
                  <Text style={styles.avgWaitText}>
                    Average wait: {avgWaitMinutes} mins across served visits
                  </Text>
                </View>

                {/* Daily Wait Trend Chart */}
                {renderWaitTimeTrendChart()}

                <Text style={styles.efficiencyTipText}>
                  {avgWaitMinutes <= 30
                    ? "✨ Your queue is running efficiently — patients are being seen promptly."
                    : "⚠️ Consider adjusting slot timing or walk-in capacity to reduce wait times."}
                </Text>
              </View>
            ) : (
              <Text style={styles.emptyChartTextSmall}>
                Not enough completed visits with timing data to calculate wait times.
              </Text>
            )}
          </Card>

          {/* Channel & Volume Intelligence Card */}
          <Card style={styles.insightCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBox, { backgroundColor: "#F0FDF4" }]}>
                <Globe size={16} color={colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardHeading}>Channel & Volume Intelligence</Text>
                <Text style={styles.cardSub}>Patient acquisition pattern & clinic flow</Text>
              </View>
            </View>

            {total === 0 ? (
              <Text style={styles.emptyChartTextSmall}>
                No completed visits yet — channel insights will appear once you start serving patients.
              </Text>
            ) : (
              <View style={styles.advisoryList}>
                <View style={styles.advisoryItem}>
                  <Text style={styles.advisoryBullet}>•</Text>
                  <Text style={styles.advisoryText}>
                    <Text style={{ fontWeight: "800", color: colors.navy }}>
                      {dominantChannel.name}
                    </Text>{" "}
                    is your primary acquisition channel ({dominantChannel.percent}% of served visits).
                  </Text>
                </View>

                {recentTrend != null && (
                  <View style={styles.advisoryItem}>
                    <Text style={styles.advisoryBullet}>•</Text>
                    <Text style={styles.advisoryText}>
                      {recentTrend > 0
                        ? `Last 7 days had ${recentTrend} more completions than the prior 7 days — volume is trending up.`
                        : recentTrend < 0
                        ? `Last 7 days had ${Math.abs(recentTrend)} fewer completions than the prior 7 days.`
                        : "Completion volume has been steady over the last two weeks."}
                    </Text>
                  </View>
                )}

                {noShowRate > 0 && (
                  <View style={styles.advisoryItem}>
                    <Text style={styles.advisoryBullet}>•</Text>
                    <Text style={styles.advisoryText}>
                      {noShowRate}% no-show rate — consider reminder messages for online bookings.
                    </Text>
                  </View>
                )}

                {peakHourLabel && (
                  <View style={styles.advisoryItem}>
                    <Text style={styles.advisoryBullet}>•</Text>
                    <Text style={styles.advisoryText}>
                      Peak operational window:{" "}
                      <Text style={{ fontWeight: "800", color: colors.navy }}>
                        {peakHourLabel}
                      </Text>
                      {busiestDayLabel ? ` on ${busiestDayLabel}s` : ""}.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Card>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 130,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backBtn: {
    padding: 6,
    borderRadius: radius.md,
    backgroundColor: colors.mutedBackground,
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
    marginTop: 1,
  },
  grid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    padding: 14,
    borderRadius: radius.xl,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  metricLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "700",
    textTransform: "none",
  },
  metricNumber: {
    ...typography.titleLarge,
    fontSize: 22,
    color: colors.navy,
    fontWeight: "900",
  },
  metricSub: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: "none",
  },
  sectionCard: {
    padding: 16,
    marginBottom: 14,
    borderRadius: radius.xl,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardHeading: {
    ...typography.titleSmall,
    color: colors.navy,
    fontSize: 13,
  },
  cardSub: {
    ...typography.caption,
    fontSize: 10.5,
    color: colors.textSecondary,
    marginTop: 1,
    textTransform: "none",
  },
  chartContainer: {
    marginTop: 6,
  },
  chartLegendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 14,
    marginBottom: 8,
  },
  legendIndicatorItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendIndicatorLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: "none",
    fontWeight: "600",
  },
  emptyChartBox: {
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyChartText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: "center",
  },
  emptyChartTextSmall: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 6,
  },
  barContainer: {
    height: 12,
    borderRadius: radius.full,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 12,
  },
  barSegment: {
    height: "100%",
  },
  legendRow: {
    gap: 6,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...typography.bodySmall,
    fontSize: 11,
    color: colors.textSecondary,
  },
  secondaryMetricsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  secondaryMetricCard: {
    flex: 1,
    padding: 10,
    borderRadius: radius.lg,
    alignItems: "center",
  },
  secMetricIconBox: {
    width: 26,
    height: 26,
    borderRadius: radius.md,
    backgroundColor: colors.mutedBackground,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  secMetricLabel: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: "700",
    color: colors.textMuted,
    textAlign: "center",
    textTransform: "none",
  },
  secMetricValue: {
    ...typography.titleSmall,
    fontSize: 12,
    fontWeight: "900",
    color: colors.navy,
    marginTop: 2,
    textAlign: "center",
  },
  insightsSection: {
    marginTop: 4,
  },
  insightsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  insightsSectionTitle: {
    ...typography.titleSmall,
    color: colors.navy,
    fontSize: 14,
  },
  insightCard: {
    padding: 16,
    marginBottom: 14,
    borderRadius: radius.xl,
  },
  efficiencyContent: {
    marginTop: 4,
  },
  avgWaitBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  avgWaitText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "800",
    color: "#065F46",
    textTransform: "none",
  },
  efficiencyTipText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 8,
    textTransform: "none",
    lineHeight: 15,
  },
  advisoryList: {
    gap: 6,
    marginTop: 4,
  },
  advisoryItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  advisoryBullet: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 1,
  },
  advisoryText: {
    ...typography.bodySmall,
    fontSize: 11.5,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
});
