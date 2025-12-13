import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons, Feather, FontAwesome5 } from "@expo/vector-icons";
import alert from "../../utils/alert";
import { VintageStyles } from "../../themes/vintage/styles_vintage";
import { VintageColors } from "../../themes/vintage/colors";
import { VintageStylesOther } from "../../themes/vintage/styles_vintage_other";
import Constants from "expo-constants";
import {
  addTreatment,
  updateTreatment,
  deleteTreatment,
} from "../../utils/cloudFunctions";
import { useAuth } from "../../contexts/AuthContext";
import { NightscoutTreatment } from "../../types/nightscout";
import { useNightscout } from "../../contexts/NightscoutContext";

interface OtherSectionProps {
  selectedDate: Date;
  otherEntries?: NightscoutTreatment[];
}

const OtherSection: React.FC<OtherSectionProps> = ({
  selectedDate,
  otherEntries: todayNotes,
}) => {
  const [otherInput, setOtherInput] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const CLOUD_FUNCTIONS_HOST = Constants.expoConfig?.extra?.cloudFunctionsHost;
  const { fetchTreatments } = useNightscout();

  const { firebaseUser, userData } = useAuth();

  const handleSaveNotes = async () => {
    if (!otherInput.trim()) {
      alert("Error", "Please enter some notes");
      return;
    }

    if (!userData?.nightscoutUrl) {
      alert("Error", "Nightscout URL not configured");
      return;
    }

    try {
      if (!userData.nightscoutUrl) {
        alert("Error", "User data not available");
        return;
      }
      if (!firebaseUser) {
        alert("Error", "User not authenticated");
        return;
      }
      const treatmentData: NightscoutTreatment = {
        eventType: "Note",
        created_at: new Date().toISOString(),
        notes: otherInput.trim(),
      };

      let success;

      if (editingNoteId) {
        treatmentData._id = editingNoteId;
        success = await updateTreatment(
          userData.nightscoutUrl,
          userData.nightscoutSecret ?? "",
          treatmentData
        );
      } else {
        // Add new note
        success = await addTreatment(
          userData.nightscoutUrl,
          userData.nightscoutSecret ?? "",
          treatmentData
        );
      }

      if (!success) {
        alert("Error", `Failed to ${editingNoteId ? "update" : "save"} notes`);
        return;
      }

      await fetchTreatments(selectedDate);

      setOtherInput("");
      setEditingNoteId(null);
      alert("Success", `Notes ${editingNoteId ? "updated" : "saved"}!`);
    } catch (error: any) {
      alert(
        "Error",
        `Failed to save notes: ${error.message || "Unknown error"}`
      );
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!userData?.nightscoutUrl) {
      alert("Error", "Nightscout URL not configured");
      return;
    }
    if (!firebaseUser) {
      alert("Error", "User not authenticated");
      return;
    }

    alert("Delete Note", "Are you sure you want to delete this note?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            if (!userData.nightscoutUrl) {
              alert("Error", "User data not available");
              return;
            }
            const success = await deleteTreatment(
              userData.nightscoutUrl,
              userData.nightscoutSecret ?? "",
              noteId
            );

            if (!success) {
              alert("Error", "Failed to delete note");
              return;
            }

            await fetchTreatments(selectedDate);

            if (editingNoteId === noteId) {
              setOtherInput("");
              setEditingNoteId(null);
            }

            alert("Success", "Note deleted!");
          } catch (error: any) {
            alert(
              "Error",
              `Failed to delete note: ${error.message || "Unknown error"}`
            );
          }
        },
      },
    ]);
  };

  const handleEditNote = (note: NightscoutTreatment) => {
    if (!note._id) {
      alert("Error", "Cannot edit note without ID");
      return;
    }

    setEditingNoteId(note._id);
    setOtherInput(note.notes || "");
  };

  const handleAddMood = () => {
    alert("Info", "Mood tracking will be implemented soon");
  };

  const handleAddMedication = () => {
    alert("Info", "Medication tracking will be implemented soon");
  };

  const handleAddSleep = () => {
    alert("Info", "Sleep tracking will be implemented soon");
  };

  const clearForm = () => {
    setOtherInput("");
    setEditingNoteId(null);
  };

  const renderNotesInput = () => (
    <View style={VintageStylesOther.sectionContainer}>
      <View style={VintageStyles.sectionHeader}>
        <Text style={VintageStyles.sectionTitle}>Daily Notes</Text>
        <View style={VintageStyles.featherAccent}>
          <Feather name="edit-3" size={16} color={VintageColors.primaryText} />
        </View>
      </View>

      <View style={VintageStylesOther.notesCard}>
        <TextInput
          style={VintageStylesOther.notesInput}
          placeholder="How are you feeling today? Any notes about sleep, stress, medication, or general well-being?"
          value={otherInput}
          onChangeText={setOtherInput}
          multiline
          numberOfLines={5}
          placeholderTextColor={VintageColors.secondaryText}
        />
      </View>
    </View>
  );

  const renderActionButtons = () => {
    const actionButtons = [
      {
        id: "mood",
        label: "Mood",
        icon: "happy",
        iconType: "ionicons",
        color: VintageColors.iconYellow,
        onPress: handleAddMood,
      },
      {
        id: "medication",
        label: "Medication",
        icon: "pills",
        iconType: "fontawesome5",
        color: VintageColors.iconBlue,
        onPress: handleAddMedication,
      },
      {
        id: "sleep",
        label: "Sleep",
        icon: "moon",
        iconType: "ionicons",
        color: VintageColors.iconPurple,
        onPress: handleAddSleep,
      },
    ];

    return (
      <View style={VintageStylesOther.sectionContainer}>
        <View style={VintageStylesOther.actionButtonsRow}>
          {actionButtons.map((button) => (
            <TouchableOpacity
              key={button.id}
              style={VintageStylesOther.actionButtonCard}
              onPress={button.onPress}
            >
              <View
                style={[
                  VintageStylesOther.actionButtonIconContainer,
                  { backgroundColor: button.color },
                ]}
              >
                {button.iconType === "ionicons" ? (
                  <Ionicons
                    name={button.icon as any}
                    size={20}
                    color={VintageColors.primaryText}
                  />
                ) : (
                  <FontAwesome5
                    name={button.icon as any}
                    size={18}
                    color={VintageColors.primaryText}
                  />
                )}
              </View>
              <Text style={VintageStylesOther.actionButtonLabel}>
                {button.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderSavedNotes = () => {
    if (!todayNotes || todayNotes.length === 0) {
      return (
        <View style={VintageStylesOther.sectionContainer}>
          <View style={VintageStylesOther.noNotesCard}>
            <View style={VintageStylesOther.noNotesIconContainer}>
              <Feather
                name="file-text"
                size={28}
                color={VintageColors.secondaryText}
              />
            </View>
            <Text style={VintageStylesOther.noNotesTitle}>No Notes Yet</Text>
            <Text style={VintageStylesOther.noNotesText}>
              Add your daily notes about mood, sleep, medication, or anything
              else you'd like to track.
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={VintageStylesOther.sectionContainer}>
        <View style={VintageStyles.sectionHeader}>
          <Text style={VintageStyles.sectionTitle}>Today's Notes</Text>
          <View style={VintageStylesOther.mealsCount}>
            <Text style={VintageStylesOther.mealsCountText}>
              {todayNotes.length}
            </Text>
          </View>
        </View>

        {todayNotes.map((entry) => (
          <TouchableOpacity
            key={entry._id || entry.created_at}
            style={VintageStylesOther.savedNotesCard}
            onPress={() => handleEditNote(entry)}
          >
            <View style={VintageStylesOther.mealHeader}>
              <View style={VintageStylesOther.mealHeaderLeft}>
                <View style={VintageStylesOther.mealTypeIcon}>
                  <Feather
                    name="file-text"
                    size={18}
                    color={VintageColors.primaryText}
                  />
                </View>
                <View>
                  <Text style={VintageStylesOther.mealCardType}>Note</Text>
                  <Text style={VintageStylesOther.mealTime}>
                    {new Date(entry.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
              <View style={VintageStylesOther.mealHeaderRight}>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    if (entry._id) {
                      handleDeleteNote(entry._id);
                    }
                  }}
                  style={VintageStylesOther.actionButton}
                >
                  <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={VintageStylesOther.mealDescription}>
              {entry.notes || "No content"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderSaveButton = () => (
    <View style={VintageStylesOther.sectionContainer}>
      <TouchableOpacity
        style={[
          VintageStylesOther.saveButton,
          editingNoteId && { backgroundColor: "#77b779ff" },
        ]}
        onPress={handleSaveNotes}
        disabled={!otherInput.trim()}
      >
        <View style={VintageStylesOther.saveButtonIcon}>
          <Feather
            name={editingNoteId ? "save" : "plus"}
            size={20}
            color="#FFFFFF"
          />
        </View>
        <Text style={VintageStylesOther.saveButtonText}>
          {editingNoteId ? "Update Note" : "Save Note"}
        </Text>
      </TouchableOpacity>

      {editingNoteId && (
        <TouchableOpacity
          style={VintageStylesOther.cancelButton}
          onPress={clearForm}
        >
          <Text style={VintageStylesOther.cancelButtonText}>Cancel Edit</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView
      style={VintageStylesOther.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {renderNotesInput()}
      {renderActionButtons()}
      {renderSaveButton()}
      {renderSavedNotes()}
      <View style={VintageStyles.spacing60} />
    </ScrollView>
  );
};

export default OtherSection;
