import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { CommonStyles } from "../../themes/styles";

interface SportsSectionProps {
  selectedDate: Date;
}

const SportsSection: React.FC<SportsSectionProps> = ({ selectedDate }) => {
  const [sportsInput, setSportsInput] = useState("");
  const [dayEntries, setDayEntries] = useState<any[]>([]);

  const currentDayEntry = dayEntries.find(
    (entry) => entry.date === selectedDate.toISOString().split("T")[0]
  );

  const handleSaveSports = () => {
    if (!sportsInput.trim()) {
      Alert.alert("Error", "Please describe your activity");
      return;
    }

    const dateString = selectedDate.toISOString().split("T")[0];

    setDayEntries((prev) => {
      const existingDayIndex = prev.findIndex(
        (entry: any) => entry.date === dateString
      );

      if (existingDayIndex >= 0) {
        const updated = [...prev];
        updated[existingDayIndex] = {
          ...updated[existingDayIndex],
          sports: sportsInput,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            date: dateString,
            sports: sportsInput,
          },
        ];
      }
    });

    setSportsInput("");
    Alert.alert("Success", "Sports activity saved!");
  };

  return (
    <View style={CommonStyles.journalContainer}>
      <Text style={CommonStyles.sectionLabel}>
        What exercise did you do today?
      </Text>
      <TextInput
        style={CommonStyles.textInputLarge}
        placeholder="Describe your activity (e.g., '30 minutes running, 15 minutes weight training')"
        value={sportsInput}
        onChangeText={setSportsInput}
        multiline
        numberOfLines={4}
      />

      {currentDayEntry?.sports && (
        <View style={CommonStyles.previousEntry}>
          <Text style={CommonStyles.previousEntryTitle}>Today's Activity:</Text>
          <Text style={CommonStyles.previousEntryText}>
            {currentDayEntry.sports}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={CommonStyles.saveButton}
        onPress={handleSaveSports}
      >
        <Text style={CommonStyles.saveButtonText}>Save Activity</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Empty - using CommonStyles only
});

export default SportsSection;
