import React from "react";
import {
  ScrollView,
  View,
  RefreshControl,
  ActivityIndicator,
  Text,
} from "react-native";
import { HomeScreenProps } from "../types/navigation";
import { VintageStylesHome } from "../themes/vintage/styles_vintage_home";
import { VintageColors } from "../themes/vintage/colors";
import { useHomeScreenData } from "../hooks/useHomeScreenData";
import { CurrentGlucoseCard } from "../components/home/CurrentGlucoseCard";
import { TimeFilter } from "../components/home/TimeFilter";
import { GlucoseChart } from "../components/home/chart/GlucoseChart";
import { EventModal } from "../components/home/chart/eventModal/EventModal";
import { VintageStyles } from "../themes/vintage/styles_vintage";

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
    //  handleRefresh,
    handleEventPress,
    setShowEventModal,
  } = useHomeScreenData();

  if (!isLoading && filteredEntries.length === 0) {
    return (
      <View style={[VintageStyles.container, { justifyContent: "center" }]}>
        <View style={VintageStylesHome.emptyContainer}>
          <Text style={VintageStylesHome.emptyText}>
            No glucose data available.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={VintageStyles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={VintageStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        //</View> refreshControl={
        // <RefreshControl
        //   refreshing={isRefreshing}
        //   onRefresh={handleRefresh}
        //   colors={[VintageColors.primaryText]}
        //   tintColor={VintageColors.primaryText}
        // />
        //   }
      >
        <View style={[VintageStyles.headerSection]}>
          <View style={VintageStyles.headerDecoration}>
            <View style={VintageStyles.headerLine} />
            <Text style={VintageStyles.headerTitle}>Glucose Overview</Text>
            <View style={VintageStyles.headerLine} />
          </View>
        </View>

        {filteredEntries.length > 0 && (
          <CurrentGlucoseCard entries={filteredEntries} />
        )}
        {filteredEntries.length > 0 && (
          <TimeFilter
            timeFilter={timeFilter}
            onTimeFilterChange={handleTimeFilterChange}
            isRefreshing={isRefreshing}
          />
        )}

        {error && (
          <View style={VintageStylesHome.errorContainer}>
            <Text style={VintageStylesHome.errorText}>{error}</Text>
          </View>
        )}

        {isLoading && filteredEntries.length === 0 && (
          <View style={VintageStylesHome.loadingContainer}>
            <ActivityIndicator size="large" color={VintageColors.primaryText} />
            <Text style={VintageStylesHome.loadingText}>Loading data...</Text>
          </View>
        )}

        {filteredEntries.length > 0 && (
          <GlucoseChart
            entries={filteredEntries}
            events={filteredEvents}
            timeFilter={timeFilter}
            onEventPress={handleEventPress}
          />
        )}
      </ScrollView>

      <EventModal
        event={selectedEvent}
        visible={showEventModal}
        onClose={() => setShowEventModal(false)}
      />
    </View>
  );
};

export default HomeScreen;
