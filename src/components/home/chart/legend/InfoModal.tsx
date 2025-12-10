import React from "react";
import { Modal, TouchableOpacity, View, Text, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LegendItem } from "../../../../types/chart";
import { ColorGuide } from "./ColorGuide";
import { styles } from "../../../../themes/vintage/home/chart/legend";
import { VintageColors } from "../../../../themes/vintage/colors";
import {
  getCategoryColor,
  getCategoryDisplayName,
} from "../../../../utils/chartUtils/chartUtils";

interface InfoModalProps {
  itemId: string | null;
  legendItems: LegendItem[];
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  itemId,
  legendItems,
  onClose,
}) => {
  if (!itemId) return null;

  const item = legendItems.find((i) => i.id === itemId);
  if (!item) return null;

  const renderIcon = (iconName: string, size: number = 24) => {
    const iconProps = { size, color: "white" as const };

    const isMaterialIcon = [
      "target",
      "bullhorn",
      "run",
      "exclamation",
      "food-variant",
      "trending-down",
      "trending-up",
      "arrow-right",
    ].includes(iconName);

    if (isMaterialIcon) {
      return <MaterialCommunityIcons name={iconName as any} {...iconProps} />;
    } else {
      return <Ionicons name={iconName as any} {...iconProps} />;
    }
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.infoModalContent}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.infoHeader}>
            <View style={[styles.infoIcon, { backgroundColor: item.color }]}>
              {renderIcon(item.icon)}
            </View>
            <View style={styles.infoTitleContainer}>
              <Text style={styles.infoTitle}>{item.name}</Text>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: getCategoryColor(item.category as any) },
                ]}
              >
                <Text style={styles.categoryText}>
                  {getCategoryDisplayName(item.category as any)}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeInfoButton}>
              <Ionicons
                name="close"
                size={20}
                color={VintageColors.primaryText}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.infoBody}>
            <Text style={styles.infoDescription}>{item.description}</Text>

            {item.showColorExplanation && item.colorExplanation && (
              <ColorGuide colorExplanation={item.colorExplanation} />
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
