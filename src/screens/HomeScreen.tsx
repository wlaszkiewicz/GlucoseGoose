import React from "react";
import {
  ScrollView,
  View,
  RefreshControl,
  ActivityIndicator,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HomeScreenProps } from "../types/navigation";
import { VintageStylesHome } from "../themes/vintage/styles_vintage_home";
import { VintageColors } from "../themes/vintage/colors_vintage";
import { useHomeScreenData } from "../hooks/useHomeScreenData";
import { CurrentGlucoseCard } from "../components/home/CurrentGlucoseCard";
import { TimeFilter } from "../components/home/TimeFilter";
import { GlucoseChart } from "../components/home/GlucoseChart";
import { EventModal } from "../components/home/EventModal";
import { Platform } from "react-native";

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const {
    filteredEntries,
    filteredEvents,
    timeFilter,
    isLoading,
    isRefreshing,
    error,
    showEventModal,
    selectedEvent,
    handleTimeFilterChange,
    handleRefresh,
    handleEventPress,
    setShowEventModal,
  } = useHomeScreenData();

  if (!isLoading && filteredEntries.length === 0) {
    return (
      <SafeAreaView style={VintageStylesHome.container}>
        <View style={VintageStylesHome.emptyContainer}>
          <Text style={VintageStylesHome.emptyText}>
            No glucose data available.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={VintageStylesHome.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={VintageStylesHome.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[VintageColors.primaryText]}
            tintColor={VintageColors.primaryText}
          />
        }
      >
        {/* Header Section */}
        <View style={VintageStylesHome.headerSection}>
          <View style={VintageStylesHome.headerDecoration}>
            <View style={VintageStylesHome.headerLine} />
            <Text style={VintageStylesHome.headerTitle}>Glucose Overview</Text>
            <View style={VintageStylesHome.headerLine} />
          </View>
        </View>

        {/* Current Glucose Card */}
        {filteredEntries.length > 0 && (
          <CurrentGlucoseCard entries={filteredEntries} />
        )}

        {/* Time Filter */}
        <TimeFilter
          timeFilter={timeFilter}
          onTimeFilterChange={handleTimeFilterChange}
          isRefreshing={isRefreshing}
        />

        {/* Error Display */}
        {error && (
          <View style={VintageStylesHome.errorContainer}>
            <Text style={VintageStylesHome.errorText}>{error}</Text>
          </View>
        )}

        {/* Loading State */}
        {isLoading && (
          <View style={VintageStylesHome.loadingContainer}>
            <ActivityIndicator size="large" color={VintageColors.primaryText} />
            <Text style={VintageStylesHome.loadingText}>Loading data...</Text>
          </View>
        )}

        {/* Chart */}
        {filteredEntries.length > 0 && (
          <GlucoseChart
            entries={filteredEntries}
            events={filteredEvents}
            timeFilter={timeFilter}
            onEventPress={handleEventPress}
          />
        )}
      </ScrollView>

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        visible={showEventModal}
        onClose={() => setShowEventModal(false)}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
