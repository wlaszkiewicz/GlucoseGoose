import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { VintageStylesHome } from "../../themes/vintage/styles_vintage_home";
import { VintageColors } from "../../themes/vintage/colors_vintage";
import {
  getEventColor,
  getMealIcon,
  getActivityIcon,
  formatTime,
} from "../../utils/chartUtils";
import { getEventDisplayName } from "../../utils/glucoseUtils";

interface EventModalProps {
  event: any;
  visible: boolean;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  visible,
  onClose,
}) => {
  if (!event) return null;

  const eventColor = getEventColor(event.type, event.eventType);
  const displayName = getEventDisplayName(event);

  const renderEventIcon = () => {
    const iconSize = 28;
    const iconContainerStyle = [
      VintageStylesHome.modalEventIconContainer,
      { backgroundColor: eventColor },
    ];

    switch (event.type) {
      case "meal":
        return (
          <View style={iconContainerStyle}>
            <Ionicons
              name={getMealIcon(event.eventType) as any}
              size={iconSize}
              color="white"
            />
          </View>
        );
      case "activity":
        return (
          <View style={iconContainerStyle}>
            <Ionicons
              name={getActivityIcon(event.eventType) as any}
              size={iconSize}
              color="white"
            />
          </View>
        );
      default:
        return (
          <View style={iconContainerStyle}>
            <Ionicons name="medical" size={iconSize} color="white" />
          </View>
        );
    }
  };

  const renderNutritionInfo = () => {
    if (event.type !== "meal") return null;

    return (
      <View style={VintageStylesHome.modalNutritionContainer}>
        <Text style={VintageStylesHome.modalNutritionTitle}>Nutrition:</Text>
        <View style={VintageStylesHome.modalNutritionGrid}>
          {event.carbs && event.carbs > 0 && (
            <View style={VintageStylesHome.modalNutritionItem}>
              <Text style={VintageStylesHome.modalNutritionValue}>
                {event.carbs}g
              </Text>
              <Text style={VintageStylesHome.modalNutritionLabel}>Carbs</Text>
            </View>
          )}
          {event.protein && event.protein > 0 && (
            <View style={VintageStylesHome.modalNutritionItem}>
              <Text style={VintageStylesHome.modalNutritionValue}>
                {event.protein}g
              </Text>
              <Text style={VintageStylesHome.modalNutritionLabel}>Protein</Text>
            </View>
          )}
          {event.fat && event.fat > 0 && (
            <View style={VintageStylesHome.modalNutritionItem}>
              <Text style={VintageStylesHome.modalNutritionValue}>
                {event.fat}g
              </Text>
              <Text style={VintageStylesHome.modalNutritionLabel}>Fat</Text>
            </View>
          )}
          {event.calories && event.calories > 0 && (
            <View style={VintageStylesHome.modalNutritionItem}>
              <Text style={VintageStylesHome.modalNutritionValue}>
                {event.calories}
              </Text>
              <Text style={VintageStylesHome.modalNutritionLabel}>
                Calories
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderActivityInfo = () => {
    if (event.type !== "activity" || !event.duration || event.duration <= 0)
      return null;

    return (
      <View style={VintageStylesHome.modalActivityContainer}>
        <Text style={VintageStylesHome.modalActivityTitle}>
          Activity Details:
        </Text>
        <View style={VintageStylesHome.modalDurationBadge}>
          <Ionicons name="time" size={16} color={eventColor} />
          <Text style={VintageStylesHome.modalDurationText}>
            {event.duration} minutes
          </Text>
        </View>
        {event.intensity && (
          <View style={VintageStylesHome.modalDurationBadge}>
            <Ionicons name="speedometer" size={16} color={eventColor} />
            <Text style={VintageStylesHome.modalDurationText}>
              {event.intensity} intensity
            </Text>
          </View>
        )}
        {event.caloriesBurned && (
          <View style={VintageStylesHome.modalDurationBadge}>
            <Ionicons name="flame" size={16} color={eventColor} />
            <Text style={VintageStylesHome.modalDurationText}>
              {event.caloriesBurned} calories burned
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderNotes = () => {
    if (!event.notes || event.notes.trim() === "") return null;

    return (
      <View style={VintageStylesHome.modalNotesContainer}>
        <Text style={VintageStylesHome.modalNotesLabel}>Notes:</Text>
        <Text style={VintageStylesHome.modalNotesText}>{event.notes}</Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={VintageStylesHome.modalOverlay}>
        <View style={VintageStylesHome.modalContent}>
          <View style={VintageStylesHome.modalHeader}>
            <Text style={VintageStylesHome.modalTitle}>{displayName}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={VintageStylesHome.closeButton}
            >
              <Ionicons
                name="close"
                size={24}
                color={VintageColors.primaryText}
              />
            </TouchableOpacity>
          </View>

          <View style={VintageStylesHome.modalBody}>
            {renderEventIcon()}

            <View style={VintageStylesHome.modalEventInfo}>
              {/* Time Info */}
              <View style={VintageStylesHome.modalInfoRow}>
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={VintageColors.secondaryText}
                />
                <Text style={VintageStylesHome.modalInfoText}>
                  {formatTime(new Date(event.created_at))}
                </Text>
              </View>

              {/* Date Info */}
              <View style={VintageStylesHome.modalInfoRow}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={VintageColors.secondaryText}
                />
                <Text style={VintageStylesHome.modalInfoText}>
                  {new Date(event.created_at).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>

              {/* Event Type Badge */}
              <View style={VintageStylesHome.modalInfoRow}>
                <Ionicons
                  name="pricetag-outline"
                  size={18}
                  color={VintageColors.secondaryText}
                />
                <Text
                  style={[
                    VintageStylesHome.modalEventTypeBadge,
                    { color: eventColor },
                  ]}
                >
                  {event.type?.toUpperCase()}
                </Text>
              </View>

              {/* Nutrition Info (for meals) */}
              {renderNutritionInfo()}

              {/* Activity Info (for activities) */}
              {renderActivityInfo()}

              {/* Notes */}
              {renderNotes()}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
