import React from "react";
import { View, Text, Switch } from "react-native";
import { VintageStyles } from "../../themes/vintage/styles_vintage";
import { VintageColors } from "../../themes/vintage/colors";

type Props = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export const SettingsToggleCard: React.FC<Props> = ({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
}) => {
  return (
    <View style={VintageStyles.vintageCard}>
      {icon}
      <View style={VintageStyles.settingTextContainer}>
        <Text style={VintageStyles.settingText}>{title}</Text>
        <Text style={VintageStyles.settingSubtext}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: VintageColors.border,
          true: VintageColors.iconGreen,
        }}
        thumbColor={value ? "#FFFFFF" : VintageColors.lightBackground}
      />
    </View>
  );
};
