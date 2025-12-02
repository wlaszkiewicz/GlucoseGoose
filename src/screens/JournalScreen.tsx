import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { getPlatformStyles } from "../themes/styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import FoodSection from "../components/Journal/FoodSection";
import SportsSection from "../components/Journal/SportsSection";
import OtherSection from "../components/Journal/OtherSection";
import SimpleCalendar from "../components/Common/SimpleCalendar";
import { VintageColors } from "../themes/vintage/colors_vintage";
import { VintageStyles } from "../themes/vintage/styles_vintage";
import { VintageStylesJournal } from "../themes/vintage/styles_vintage_journal";

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

  const getCategoryIcon = (category: Category, isSelected: boolean) => {
    const iconColor = isSelected ? '#FFFFFF' : VintageColors.primaryText;
    const iconSize = 26;

    switch (category) {
      case "Food":
        return <Ionicons name="restaurant-outline" size={iconSize} color={iconColor} />;
      case "Sports":
        return <Ionicons name="fitness-outline" size={iconSize} color={iconColor} />;
      case "Other":
        return <Ionicons name="ellipsis-horizontal-outline" size={iconSize} color={iconColor} />;
      default:
        return <Ionicons name="help-circle-outline" size={iconSize} color={iconColor} />;
    }
  };

  const getCategoryColor = (isSelected: boolean) => {
    return isSelected ? '#774622ff' : '#D2B48C'; 
  };

  return (
    <SafeAreaView style={[platformStyles.container, VintageStylesJournal.container]}>
      <ScrollView
        contentContainerStyle={VintageStylesJournal.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section*/}
        <View style={VintageStylesJournal.headerSection}>
          <View style={VintageStyles.header}>
            <View style={VintageStyles.headerDecoration}>
              <View style={VintageStyles.headerLine} />
              <Text style={VintageStyles.headerTitle}>Daily Journal</Text>
              <View style={VintageStyles.headerLine} />
            </View>
          </View>

          {/* Date Selector */}
          <View style={VintageStylesJournal.dateSection}>
            <TouchableOpacity
              style={VintageStylesJournal.dateSelector}
              onPress={() => setShowCalendar(true)}
            >
              <View style={VintageStylesJournal.dateIconContainer}>
                <Feather name="calendar" size={20} color={VintageColors.primaryText} />
              </View>
              <View style={VintageStylesJournal.dateTextContainer}>
                <Text style={VintageStylesJournal.dateText}>
                  {formatDate(selectedDate)}
                </Text>
                <Text style={VintageStylesJournal.dateSubtext}>
                  Tap to change date
                </Text>
              </View>
              <View style={VintageStylesJournal.dateArrow}>
                <Feather name="chevron-right" size={20} color={VintageColors.secondaryText} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Tabs*/}
        <View style={VintageStylesJournal.categoryTabs}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const backgroundColor = getCategoryColor(isSelected);
            
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  VintageStylesJournal.categoryTab,
                  isSelected && VintageStylesJournal.categoryTabSelected,
                  { borderColor: backgroundColor }
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <View style={[
                  VintageStylesJournal.categoryIconContainer,
                  { backgroundColor },
                  isSelected && VintageStylesJournal.categoryIconContainerSelected,
                ]}>
                  {getCategoryIcon(cat, isSelected)}
                </View>
                <Text
                  style={[
                    VintageStylesJournal.categoryTabText,
                    isSelected && VintageStylesJournal.categoryTabTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Main Content */}
        <View style={VintageStylesJournal.mainContent}>
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
export default JournalScreen;