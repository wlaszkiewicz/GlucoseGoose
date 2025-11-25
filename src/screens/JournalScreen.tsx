import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import { getPlatformStyles, CommonStyles } from "../themes/styles";
import { Ionicons } from "@expo/vector-icons";
import FoodSection from "../components/Journal/FoodSection";
import SportsSection from "../components/Journal/SportsSection";
import OtherSection from "../components/Journal/OtherSection";
import SimpleCalendar from "../components/Common/SimpleCalendar";

type Category = "Food" | "Sports" | "Other";

const categories: Category[] = ["Food", "Sports", "Other"];

const JournalScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>("Food");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const platformStyles = getPlatformStyles();

  return (
    <SafeAreaView style={[platformStyles.container, styles.container]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={CommonStyles.appTitle}>Food Journal</Text>

          {/* Date Selector */}
          <View style={styles.dateSection}>
            <TouchableOpacity
              style={CommonStyles.dateSelector}
              onPress={() => setShowCalendar(true)}
            >
              <Ionicons name="calendar" size={20} color="#007AFF" />
              <Text style={CommonStyles.dateText}>
                {formatDate(selectedDate)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Tabs */}
        <View style={CommonStyles.categoryTabs}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                CommonStyles.categoryTab,
                selectedCategory === cat && CommonStyles.categoryTabSelected,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  CommonStyles.categoryTabText,
                  selectedCategory === cat &&
                    CommonStyles.categoryTabTextSelected,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {selectedCategory === "Food" && (
            <FoodSection selectedDate={selectedDate} />
          )}

          {selectedCategory === "Sports" && (
            <SportsSection selectedDate={selectedDate} />
          )}

          {selectedCategory === "Other" && (
            <OtherSection selectedDate={selectedDate} />
          )}
        </View>
      </ScrollView>

      {/* Calendar Modal */}
      <SimpleCalendar
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
      />
    </SafeAreaView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerSection: {
    marginBottom: 24,
  },
  dateSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mainContent: {
    flex: 1,
  },
});

export default JournalScreen;
