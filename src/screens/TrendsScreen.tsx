// screens/TrendsScreen.tsx
import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from "react-native";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import { VintageColors } from "../themes/vintage/colors";
import { VintageStyles } from "../themes/vintage/styles_vintage";
import { useTrendsData } from "../hooks/useTrendsData";
import { TimeRangeSelector } from "../components/trends/TimeRangeSelector";
import { AggregatedChart } from "../components/trends/AggregatedChart";
import { HourlyTrendsChart } from "../components/trends/HourlyTrendsChart";
import { TrendsMetrics } from "../components/trends/TrendsMetrics";
import { TrendsInfoModal } from "../components/trends/TrendsInfoModal";
import { VintageAlertModal } from "../components/trends/VintageAlertModel";

const TrendsScreen: React.FC = () => {
  const {
    metrics,
    aggregatedData,
    hourlyAverages,
    isLoading,
    isAnalyzing,
    error,
    timeRange,
    customStartDate,
    customEndDate,
    refreshData,
    setRange,
    setCustomRange,
    clearCache,
    largeDataWarning,
    handleConfirmLargeFetch,
    handleCancelLargeFetch,
  } = useTrendsData();

  const [refreshing, setRefreshing] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState<
    "start" | "end" | null
  >(null);

  const [tempStartDate, setTempStartDate] = useState(new Date());
  const [tempEndDate, setTempEndDate] = useState(new Date());
  const [showInfoModal, setShowInfoModal] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleCustomRangeSelect = () => {
    setTempStartDate(
      customStartDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    );
    setTempEndDate(customEndDate || new Date());
    setShowCustomPicker("start");
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowCustomPicker(null);
    }

    if (selectedDate) {
      if (showCustomPicker === "start") {
        setTempStartDate(selectedDate);
        setShowCustomPicker("end");
      } else if (showCustomPicker === "end") {
        setTempEndDate(selectedDate);
        if (tempStartDate && selectedDate > tempStartDate) {
          setCustomRange(tempStartDate, selectedDate);
        }
        setShowCustomPicker(null);
      }
    }
  };

  const formatDateRange = () => {
    if (timeRange === "custom" && customStartDate && customEndDate) {
      return `${customStartDate.toLocaleDateString()} - ${customEndDate.toLocaleDateString()}`;
    }
    return null;
  };

  return (
    <View style={VintageStyles.container}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={VintageStyles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[VintageColors.formAccent3]}
            tintColor={VintageColors.formAccent3}
          />
        }
      >
        {/* Header */}
        <View
          style={[
            VintageStyles.headerSection,
            { marginBottom: 0, paddingTop: 5 },
          ]}
        >
          <View style={VintageStyles.header}>
            <View style={VintageStyles.headerDecoration}>
              <View style={VintageStyles.headerLine} />
              <Text style={VintageStyles.headerTitle}>Trends Analysis</Text>
              <View style={VintageStyles.headerLine} />
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Feather
              name="trending-up"
              size={18}
              color={VintageColors.formAccent3}
            />
            <Text style={styles.infoTitle}>Analyze Patterns</Text>
          </View>
          <Text style={styles.infoText}>
            Discover insights from your glucose data over time. Choose a period
            to analyze.
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Feather name="alert-triangle" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Time Range Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Time Range</Text>
            <View style={styles.featherAccent}>
              <Feather
                name="calendar"
                size={16}
                color={VintageColors.primaryText}
              />
            </View>
          </View>
          <TimeRangeSelector
            currentRange={timeRange}
            onSelectRange={setRange}
            onCustomRangePress={handleCustomRangeSelect}
            isLoading={isLoading || isAnalyzing}
          />
        </View>

        {/* Custom Range Display */}
        {formatDateRange() && (
          <View style={styles.customRangeDisplay}>
            <Feather
              name="calendar"
              size={14}
              color={VintageColors.formAccent1}
            />
            <Text style={styles.customRangeText}>{formatDateRange()}</Text>
          </View>
        )}

        {/* Analysis Status */}
        {isAnalyzing && (
          <View style={styles.analyzingContainer}>
            <Feather
              name="loader"
              size={16}
              color={VintageColors.formAccent3}
              style={{ transform: [{ rotate: "0deg" }] }}
            />
            <Text style={styles.analyzingText}>Analyzing data patterns...</Text>
          </View>
        )}

        {/* Metrics and Charts */}
        {metrics && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Summary Metrics</Text>
                <View style={styles.featherAccent}>
                  <Feather
                    name="activity"
                    size={16}
                    color={VintageColors.primaryText}
                  />
                </View>
              </View>
              <TrendsMetrics metrics={metrics} />
            </View>

            {aggregatedData.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Daily Trends</Text>
                  <View style={styles.featherAccent}>
                    <Feather
                      name="bar-chart-2"
                      size={16}
                      color={VintageColors.primaryText}
                    />
                  </View>
                </View>
                <AggregatedChart data={aggregatedData} timeRange={timeRange} />
              </View>
            )}

            {Object.keys(hourlyAverages).length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Hourly Patterns</Text>
                  <View style={styles.featherAccent}>
                    <Feather
                      name="clock"
                      size={16}
                      color={VintageColors.primaryText}
                    />
                  </View>
                </View>
                <HourlyTrendsChart
                  hourlyAverages={hourlyAverages}
                  timeRange={timeRange}
                />
              </View>
            )}
          </>
        )}

        {/* Data Management Card */}
        <TouchableOpacity
          style={[VintageStyles.vintageCard, styles.dataCard]}
          onPress={clearCache}
          disabled={isLoading}
        >
          <View
            style={[
              VintageStyles.settingIcon,
              { backgroundColor: VintageColors.iconPurple },
            ]}
          >
            <Feather
              name="database"
              size={22}
              color={VintageColors.primaryText}
            />
          </View>
          <View style={VintageStyles.settingTextContainer}>
            <Text style={VintageStyles.settingText}>Data Management</Text>
            <Text style={VintageStyles.settingSubtext}>
              Clear cache & refresh analysis
            </Text>
          </View>
          <View style={VintageStyles.vintageArrow}>
            <Feather
              name="chevron-right"
              size={20}
              color={VintageColors.secondaryText}
            />
          </View>
        </TouchableOpacity>

        {/* How It Works Card */}
        <TouchableOpacity
          style={[VintageStyles.vintageCard, styles.infoHowCard]}
          onPress={() => setShowInfoModal(true)}
        >
          <View
            style={[
              VintageStyles.settingIcon,
              { backgroundColor: VintageColors.iconBlue },
            ]}
          >
            <Feather name="info" size={22} color={VintageColors.primaryText} />
          </View>
          <View style={VintageStyles.settingTextContainer}>
            <Text style={VintageStyles.settingText}>How Trends Work</Text>
            <Text style={VintageStyles.settingSubtext}>
              Learn about data analysis & caching
            </Text>
          </View>
          <View style={VintageStyles.vintageArrow}>
            <Feather
              name="chevron-right"
              size={20}
              color={VintageColors.secondaryText}
            />
          </View>
        </TouchableOpacity>

        <View style={VintageStyles.spacing60} />
      </ScrollView>

      <TrendsInfoModal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />

      {/* Date Pickers */}
      {showCustomPicker && (
        <DateTimePicker
          value={showCustomPicker === "start" ? tempStartDate : tempEndDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      <VintageAlertModal
        visible={largeDataWarning.visible}
        title={largeDataWarning.title}
        message={largeDataWarning.message}
        onConfirm={handleConfirmLargeFetch}
        onCancel={handleCancelLargeFetch}
        confirmText="Proceed"
        cancelText="Go Back"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  infoText: {
    fontSize: 13,
    color: VintageColors.secondaryText,
    lineHeight: 18,
    fontStyle: "italic",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    color: VintageColors.primaryText,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  featherAccent: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.2)",
  },
  errorText: {
    fontSize: 13,
    color: "#DC2626",
    marginLeft: 12,
    flex: 1,
  },
  customRangeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(139, 115, 85, 0.1)",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(139, 115, 85, 0.2)",
  },
  customRangeText: {
    fontSize: 13,
    color: VintageColors.formAccent1,
    fontWeight: "500",
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  analyzingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.2)",
  },
  analyzingText: {
    fontSize: 13,
    color: VintageColors.formAccent3,
    fontWeight: "500",
    marginLeft: 12,
    letterSpacing: 0.3,
  },
  dataCard: {
    marginBottom: 16,
  },
  infoHowCard: {
    marginBottom: 16,
  },
});

export default TrendsScreen;
