import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { VintageStyles } from "../../themes/vintage/styles_vintage";
import { VintageColors } from "../../themes/vintage/colors";

type Props = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress?: () => void;
};

export const SettingsCard: React.FC<Props> = ({
  icon,
  title,
  subtitle,
  onPress,
}) => {
  return (
    <TouchableOpacity style={VintageStyles.vintageCard} onPress={onPress}>
      {icon}
      <View style={VintageStyles.settingTextContainer}>
        <Text style={VintageStyles.settingText}>{title}</Text>
        <Text style={VintageStyles.settingSubtext}>{subtitle}</Text>
      </View>
      <View style={VintageStyles.vintageArrow}>
        <Feather
          name="chevron-right"
          size={20}
          color={VintageColors.secondaryText}
        />
      </View>
    </TouchableOpacity>
  );
};
