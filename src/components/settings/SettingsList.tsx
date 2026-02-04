import React from "react";
import { View, Text } from "react-native";
import {
  Feather,
  Ionicons,
  MaterialIcons,
  FontAwesome5,
} from "@expo/vector-icons";

import { VintageStyles } from "../../themes/vintage/styles_vintage";
import { VintageColors } from "../../themes/vintage/colors";
import { SettingsCard } from "./SettingsCard";

type Props = {
  isDoctor: boolean;
  onAccountPress: () => void;
};

export const SettingsList: React.FC<Props> = ({ isDoctor, onAccountPress }) => {
  return (
    <View style={VintageStyles.settingsList}>
      <View style={VintageStyles.sectionHeader}>
        <Text style={VintageStyles.sectionTitle}>Settings & Preferences</Text>
        <View style={VintageStyles.featherAccent}>
          <FontAwesome5
            name="feather-alt"
            size={16}
            color={VintageColors.primaryText}
          />
        </View>
      </View>

      <SettingsCard
        onPress={onAccountPress}
        title="Account & Profile"
        subtitle={`Update personal ${isDoctor ? "and professional" : ""} information`}
        icon={
          <View
            style={[
              VintageStyles.settingIcon,
              { backgroundColor: VintageColors.iconGreen },
            ]}
          >
            <Feather name="user" size={22} color={VintageColors.primaryText} />
          </View>
        }
      />

      <SettingsCard
        title="Reminders & Alerts"
        subtitle="Glucose checks, medication"
        icon={
          <View
            style={[
              VintageStyles.settingIcon,
              { backgroundColor: VintageColors.iconYellow },
            ]}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={VintageColors.primaryText}
            />
          </View>
        }
      />

      <SettingsCard
        title="Health Data"
        subtitle="Connect devices & apps"
        icon={
          <View
            style={[
              VintageStyles.settingIcon,
              { backgroundColor: VintageColors.iconBlue },
            ]}
          >
            <Feather
              name="activity"
              size={22}
              color={VintageColors.primaryText}
            />
          </View>
        }
      />

      <SettingsCard
        title="Goose Support"
        subtitle="Help, FAQ & community"
        icon={
          <View
            style={[
              VintageStyles.settingIcon,
              { backgroundColor: VintageColors.iconPink },
            ]}
          >
            <MaterialIcons
              name="support-agent"
              size={22}
              color={VintageColors.primaryText}
            />
          </View>
        }
      />

      <SettingsCard
        title="Goose Features"
        subtitle="Themes & customization"
        icon={
          <View
            style={[
              VintageStyles.settingIcon,
              { backgroundColor: VintageColors.iconPurple },
            ]}
          >
            <Feather
              name="feather"
              size={22}
              color={VintageColors.primaryText}
            />
          </View>
        }
      />
    </View>
  );
};
