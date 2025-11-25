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

interface OtherSectionProps {
  selectedDate: Date;
}

const OtherSection: React.FC<OtherSectionProps> = ({ selectedDate }) => {
  const [otherInput, setOtherInput] = useState("");
  const [dayEntries, setDayEntries] = useState<any[]>([]);

  const currentDayEntry = dayEntries.find(
    (entry) => entry.date === selectedDate.toISOString().split("T")[0]
  );

  const handleSaveNotes = () => {
    if (!otherInput.trim()) {
      Alert.alert("Error", "Please enter some notes");
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
          notes: otherInput,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            date: dateString,
            notes: otherInput,
          },
        ];
      }
    });

    setOtherInput("");
    Alert.alert("Success", "Notes saved!");
  };

  return (
    <View style={CommonStyles.journalContainer}>
      <Text style={CommonStyles.sectionLabel}>
        Notes (mood, sleep, medication, etc.)
      </Text>
      <TextInput
        style={CommonStyles.textInputLarge}
        placeholder="How are you feeling today? Any notes about sleep, stress, or medication?"
        value={otherInput}
        onChangeText={setOtherInput}
        multiline
        numberOfLines={5}
      />

      {currentDayEntry?.notes && (
        <View style={CommonStyles.previousEntry}>
          <Text style={CommonStyles.previousEntryTitle}>Today's Notes:</Text>
          <Text style={CommonStyles.previousEntryText}>
            {currentDayEntry.notes}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={CommonStyles.saveButton}
        onPress={handleSaveNotes}
      >
        <Text style={CommonStyles.saveButtonText}>Save Notes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Empty - using CommonStyles only
});

export default OtherSection;
