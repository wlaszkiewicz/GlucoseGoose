import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { VintageStylesHome } from "../../themes/vintage/styles_vintage_home";
import { VintageColors } from "../../themes/vintage/colors_vintage";
import {
  getEventColor,
  getMealIcon,
  getActivityIcon,
  formatTime,
  getInsulinIcon,
  getInsulinColor,
  formatInsulinValue,
  formatTempBasalValue,
  getTargetIcon,
  getTargetColor,
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

  const isInsulinEvent =
    event.eventType?.includes("Bolus") || event.eventType === "Temp Basal";
  const isTargetEvent = event.eventType === "Temporary Target";

  const eventColor = isInsulinEvent
    ? getInsulinColor(event.eventType, event.percent, event.insulin)
    : isTargetEvent
    ? getTargetColor(event.reason)
    : getEventColor(event.type, event.eventType);

  const displayName = getEventDisplayName(event);

  const safeNumber = (value: any): number => {
    if (value === null || value === undefined || value === "") return 0;
    const num = Number(value);
    return !isNaN(num) && num > 0 ? num : 0;
  };

  const renderEventIcon = () => {
    if (isInsulinEvent) {
      return (
        <View style={VintageStylesHome.modalEventIconContainerCompact}>
          <View
            style={[
              VintageStylesHome.modalIconCircleCompact,
              { backgroundColor: eventColor },
            ]}
          >
            <Ionicons
              name={getInsulinIcon(event.eventType, event.insulin) as any}
              size={20}
              color="white"
            />
          </View>
        </View>
      );
    }

    if (isTargetEvent) {
      return (
        <View style={VintageStylesHome.modalEventIconContainerCompact}>
          <View
            style={[
              VintageStylesHome.modalIconCircleCompact,
              { backgroundColor: eventColor },
            ]}
          >
            <MaterialCommunityIcons
              name={getTargetIcon(event.reason) as any}
              size={20}
              color="white"
            />
          </View>
        </View>
      );
    }

    switch (event.type) {
      case "meal":
        return (
          <View style={VintageStylesHome.modalEventIconContainerCompact}>
            <View
              style={[
                VintageStylesHome.modalIconCircleCompact,
                { backgroundColor: eventColor },
              ]}
            >
              <Ionicons
                name={getMealIcon(event.eventType) as any}
                size={20}
                color="white"
              />
            </View>
          </View>
        );
      case "activity":
        return (
          <View style={VintageStylesHome.modalEventIconContainerCompact}>
            <View
              style={[
                VintageStylesHome.modalIconCircleCompact,
                { backgroundColor: eventColor },
              ]}
            >
              <Ionicons
                name={getActivityIcon(event.eventType) as any}
                size={20}
                color="white"
              />
            </View>
          </View>
        );
      default:
        return (
          <View style={VintageStylesHome.modalEventIconContainerCompact}>
            <View
              style={[
                VintageStylesHome.modalIconCircleCompact,
                { backgroundColor: eventColor },
              ]}
            >
              <Ionicons name="medical" size={20} color="white" />
            </View>
          </View>
        );
    }
  };

  const renderTargetInfo = () => {
    if (!isTargetEvent) return null;

    const targetColors = {
      value: VintageColors.iconGreen,
      duration: VintageColors.iconBlue,
      reason: VintageColors.iconPurple,
    };

    return (
      <View style={VintageStylesHome.modalSectionCompact}>
        <View style={VintageStylesHome.modalSectionHeaderCompact}>
          <View
            style={[
              VintageStylesHome.modalSectionIcon,
              { backgroundColor: targetColors.reason },
            ]}
          >
            <MaterialCommunityIcons
              name="target"
              size={16}
              color={VintageColors.primaryText}
            />
          </View>
          <Text style={VintageStylesHome.modalSectionTitleCompact}>
            Temporary Target
          </Text>
        </View>

        <View style={VintageStylesHome.modalTargetGrid}>
          <View
            style={[
              VintageStylesHome.modalTargetItem,
              { backgroundColor: targetColors.value },
            ]}
          >
            <Text style={VintageStylesHome.modalTargetValue}>
              {event.targetBottom || event.targetTop || "—"} mg/dL
            </Text>
            <Text style={VintageStylesHome.modalTargetLabel}>Target</Text>
          </View>

          {event.duration && (
            <View
              style={[
                VintageStylesHome.modalTargetItem,
                { backgroundColor: targetColors.duration },
              ]}
            >
              <Text style={VintageStylesHome.modalTargetValue}>
                {Math.round(event.duration / 60)}h
              </Text>
              <Text style={VintageStylesHome.modalTargetLabel}>Duration</Text>
            </View>
          )}

          {event.reason && (
            <View style={VintageStylesHome.modalTargetReason}>
              <Ionicons
                name="information-circle"
                size={16}
                color={VintageColors.secondaryText}
              />
              <Text style={VintageStylesHome.modalTargetReasonText}>
                {event.reason}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderInsulinInfo = () => {
    if (!isInsulinEvent) return null;

    const insulinColors = {
      bolus: VintageColors.iconPurple,
      rate: VintageColors.iconBlue,
      duration: VintageColors.iconGreen,
      change:
        event.percent < 0
          ? VintageColors.iconBlue
          : event.percent > 0
          ? VintageColors.iconPink
          : VintageColors.iconYellow,
    };

    return (
      <View style={VintageStylesHome.modalSectionCompact}>
        <View style={VintageStylesHome.modalSectionHeaderCompact}>
          <View
            style={[
              VintageStylesHome.modalSectionIcon,
              { backgroundColor: insulinColors.bolus },
            ]}
          >
            <Ionicons
              name="fitness"
              size={16}
              color={VintageColors.primaryText}
            />
          </View>
          <Text style={VintageStylesHome.modalSectionTitleCompact}>
            Insulin Details
          </Text>
        </View>

        <View style={VintageStylesHome.modalInsulinGridCompact}>
          {event.eventType.includes("Bolus") && event.insulin && (
            <View
              style={[
                VintageStylesHome.modalDataItem,
                { backgroundColor: VintageColors.iconPink },
              ]}
            >
              <View style={VintageStylesHome.modalDataItemIcon}>
                <Ionicons
                  name="water"
                  size={20}
                  color={VintageColors.primaryText}
                />
              </View>
              <View style={VintageStylesHome.modalDataItemContent}>
                <Text style={VintageStylesHome.modalDataItemValue}>
                  {formatInsulinValue(event.insulin)}
                </Text>
                <Text style={VintageStylesHome.modalDataItemLabel}>
                  {event.eventType.replace(" Bolus", "")}
                </Text>
              </View>
            </View>
          )}

          {event.eventType === "Temp Basal" && (
            <>
              {event.rate !== undefined && (
                <View
                  style={[
                    VintageStylesHome.modalDataItem,
                    { backgroundColor: insulinColors.rate },
                  ]}
                >
                  <View style={VintageStylesHome.modalDataItemIcon}>
                    <Ionicons
                      name="speedometer"
                      size={20}
                      color={VintageColors.primaryText}
                    />
                  </View>
                  <View style={VintageStylesHome.modalDataItemContent}>
                    <Text style={VintageStylesHome.modalDataItemValue}>
                      {formatTempBasalValue(event.rate, event.percent)}
                    </Text>
                    <Text style={VintageStylesHome.modalDataItemLabel}>
                      Rate
                    </Text>
                  </View>
                </View>
              )}

              {event.duration && (
                <View
                  style={[
                    VintageStylesHome.modalDataItem,
                    { backgroundColor: insulinColors.duration },
                  ]}
                >
                  <View style={VintageStylesHome.modalDataItemIcon}>
                    <Ionicons
                      name="timer"
                      size={20}
                      color={VintageColors.primaryText}
                    />
                  </View>
                  <View style={VintageStylesHome.modalDataItemContent}>
                    <Text style={VintageStylesHome.modalDataItemValue}>
                      {event.duration}m
                    </Text>
                    <Text style={VintageStylesHome.modalDataItemLabel}>
                      Duration
                    </Text>
                  </View>
                </View>
              )}

              {event.percent !== undefined && (
                <View
                  style={[
                    VintageStylesHome.modalDataItem,
                    { backgroundColor: insulinColors.change },
                  ]}
                >
                  <View style={VintageStylesHome.modalDataItemIcon}>
                    {event.percent !== 0 && (
                      <Ionicons
                        name={
                          event.percent < 0
                            ? "trending-down"
                            : event.percent > 0
                            ? "trending-up"
                            : "arrow-forward"
                        }
                        size={20}
                        color={VintageColors.primaryText}
                      />
                    )}
                    {event.percent === 0 && (
                      <MaterialIcons
                        name="trending-flat"
                        size={20}
                        color={VintageColors.primaryText}
                      />
                    )}
                  </View>
                  <View style={VintageStylesHome.modalDataItemContent}>
                    <Text style={VintageStylesHome.modalDataItemValue}>
                      {event.percent > 0 ? "+" : ""}
                      {event.percent}%
                    </Text>
                    <Text style={VintageStylesHome.modalDataItemLabel}>
                      Change
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  const renderNutritionInfo = () => {
    if (event.type !== "meal") return null;

    const safeCarbs = safeNumber(event.carbs);
    const safeProtein = safeNumber(event.protein);
    const safeFat = safeNumber(event.fat);

    const hasNutritionData = safeCarbs > 0 || safeProtein > 0 || safeFat > 0;
    if (!hasNutritionData) return null;

    return (
      <View style={VintageStylesHome.modalSectionCompact}>
        <View style={VintageStylesHome.modalSectionHeaderCompact}>
          <View
            style={[
              VintageStylesHome.modalSectionIcon,
              { backgroundColor: VintageColors.iconYellow },
            ]}
          >
            <Ionicons
              name="nutrition"
              size={16}
              color={VintageColors.primaryText}
            />
          </View>
          <Text style={VintageStylesHome.modalSectionTitleCompact}>
            Nutrition
          </Text>
        </View>

        <View style={VintageStylesHome.modalNutritionGridCompact}>
          {safeCarbs > 0 && (
            <View
              style={[
                VintageStylesHome.modalNutritionItemCompact,
                { backgroundColor: VintageColors.iconGreen },
              ]}
            >
              <Text style={VintageStylesHome.modalNutritionValueCompact}>
                {safeCarbs}g
              </Text>
              <Text style={VintageStylesHome.modalNutritionLabelCompact}>
                Carbs
              </Text>
            </View>
          )}
          {safeProtein > 0 && (
            <View
              style={[
                VintageStylesHome.modalNutritionItemCompact,
                { backgroundColor: VintageColors.iconBlue },
              ]}
            >
              <Text style={VintageStylesHome.modalNutritionValueCompact}>
                {safeProtein}g
              </Text>
              <Text style={VintageStylesHome.modalNutritionLabelCompact}>
                Protein
              </Text>
            </View>
          )}
          {safeFat > 0 && (
            <View
              style={[
                VintageStylesHome.modalNutritionItemCompact,
                { backgroundColor: VintageColors.iconPink },
              ]}
            >
              <Text style={VintageStylesHome.modalNutritionValueCompact}>
                {safeFat}g
              </Text>
              <Text style={VintageStylesHome.modalNutritionLabelCompact}>
                Fat
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderActivityInfo = () => {
    if (event.type !== "activity") return null;

    const safeDuration = safeNumber(event.duration);
    const safeCaloriesBurned = safeNumber(event.caloriesBurned);

    const activityColors = {
      duration: VintageColors.iconYellow,
      intensity: VintageColors.iconPink,
      calories: VintageColors.iconGreen,
    };

    return (
      <View style={VintageStylesHome.modalSectionCompact}>
        <View style={VintageStylesHome.modalSectionHeaderCompact}>
          <View
            style={[
              VintageStylesHome.modalSectionIcon,
              { backgroundColor: activityColors.duration },
            ]}
          >
            <Ionicons
              name="bicycle"
              size={16}
              color={VintageColors.primaryText}
            />
          </View>
          <Text style={VintageStylesHome.modalSectionTitleCompact}>
            Activity
          </Text>
        </View>

        <View style={VintageStylesHome.modalActivityGridCompact}>
          {safeDuration > 0 && (
            <View
              style={[
                VintageStylesHome.modalDataItem,
                { backgroundColor: activityColors.duration },
              ]}
            >
              <View style={VintageStylesHome.modalDataItemIcon}>
                <Ionicons
                  name="time"
                  size={20}
                  color={VintageColors.primaryText}
                />
              </View>
              <View style={VintageStylesHome.modalDataItemContent}>
                <Text style={VintageStylesHome.modalDataItemValue}>
                  {safeDuration}m
                </Text>
                <Text style={VintageStylesHome.modalDataItemLabel}>
                  Duration
                </Text>
              </View>
            </View>
          )}

          {event.intensity && (
            <View
              style={[
                VintageStylesHome.modalDataItem,
                { backgroundColor: activityColors.intensity },
              ]}
            >
              <View style={VintageStylesHome.modalDataItemIcon}>
                <Ionicons
                  name="speedometer"
                  size={20}
                  color={VintageColors.primaryText}
                />
              </View>
              <View style={VintageStylesHome.modalDataItemContent}>
                <Text style={VintageStylesHome.modalDataItemValue}>
                  {event.intensity}
                </Text>
                <Text style={VintageStylesHome.modalDataItemLabel}>
                  Intensity
                </Text>
              </View>
            </View>
          )}

          {safeCaloriesBurned > 0 && (
            <View
              style={[
                VintageStylesHome.modalDataItem,
                { backgroundColor: activityColors.calories },
              ]}
            >
              <View style={VintageStylesHome.modalDataItemIcon}>
                <Ionicons
                  name="flame"
                  size={20}
                  color={VintageColors.primaryText}
                />
              </View>
              <View style={VintageStylesHome.modalDataItemContent}>
                <Text style={VintageStylesHome.modalDataItemValue}>
                  {Math.round(safeCaloriesBurned)}
                </Text>
                <Text style={VintageStylesHome.modalDataItemLabel}>
                  Calories
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderNotes = () => {
    if (!event.notes || event.notes.trim() === "") return null;

    return (
      <View style={VintageStylesHome.modalSectionCompact}>
        <View style={VintageStylesHome.modalSectionHeaderCompact}>
          <View
            style={[
              VintageStylesHome.modalSectionIcon,
              { backgroundColor: VintageColors.iconPink },
            ]}
          >
            <Ionicons
              name="document-text"
              size={16}
              color={VintageColors.primaryText}
            />
          </View>
          <Text style={VintageStylesHome.modalSectionTitleCompact}>Notes</Text>
        </View>
        <View style={VintageStylesHome.modalNotesBoxCompact}>
          <Text style={VintageStylesHome.modalNotesTextCompact}>
            {event.notes}
          </Text>
        </View>
      </View>
    );
  };

  const formatEventTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatEventDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={VintageStylesHome.modalOverlay}>
        <View style={VintageStylesHome.modalContentCompact}>
          {/* Header */}
          <View style={VintageStylesHome.modalHeaderCompact}>
            <View style={VintageStylesHome.modalHeaderTop}>
              {renderEventIcon()}
              <View style={VintageStylesHome.modalHeaderInfo}>
                <Text style={VintageStylesHome.modalTitleCompact}>
                  {displayName}
                </Text>
                <View style={VintageStylesHome.modalEventTypeRow}></View>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={VintageStylesHome.closeButtonCompact}
            >
              <Ionicons
                name="close"
                size={20}
                color={VintageColors.primaryText}
              />
            </TouchableOpacity>
          </View>

          {/* Time Info */}
          <View style={VintageStylesHome.modalTimeInfo}>
            <View
              style={[
                VintageStylesHome.modalTimeBadge,
                { backgroundColor: VintageColors.lightBackground },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={14}
                color={VintageColors.primaryText}
              />
              <Text style={VintageStylesHome.modalTimeText}>
                {formatEventTime(new Date(event.created_at))}
              </Text>
            </View>
            <View
              style={[
                VintageStylesHome.modalTimeBadge,
                { backgroundColor: VintageColors.lightBackground },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={14}
                color={VintageColors.primaryText}
              />
              <Text style={VintageStylesHome.modalTimeText}>
                {formatEventDate(new Date(event.created_at))}
              </Text>
            </View>
            <View
              style={[
                VintageStylesHome.modalTimeBadge,
                {
                  backgroundColor: VintageColors.lightBackground,
                  minWidth: 0,
                },
              ]}
            >
              <FontAwesome5
                name="feather-alt"
                size={16}
                color={VintageColors.primaryText}
              />
            </View>
          </View>

          {/* Divider */}
          <View style={VintageStylesHome.modalDivider} />

          {/* Content */}
          <View style={VintageStylesHome.modalBodyCompact}>
            {/* Target Info */}
            {renderTargetInfo()}

            {/* Insulin Info */}
            {renderInsulinInfo()}

            {/* Nutrition Info */}
            {renderNutritionInfo()}

            {/* Activity Info */}
            {renderActivityInfo()}

            {/* Notes */}
            {renderNotes()}
          </View>

          {/* Footer */}
          <View style={VintageStylesHome.modalFooterCompact}>
            <View style={VintageStylesHome.modalFooterLine} />
          </View>
        </View>
      </View>
    </Modal>
  );
};
