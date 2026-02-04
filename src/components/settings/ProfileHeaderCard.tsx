import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

import { VintageStyles } from "../../themes/vintage/styles_vintage";
import { VintageColors } from "../../themes/vintage/colors";
import { getLocalAvatarImage } from "../../utils/avatarHelper";

type Props = {
  username: string;
  specialization?: string;
  selectedAvatarId: string;
  onPressAvatar: () => void;
};

export const ProfileHeaderCard: React.FC<Props> = ({
  username,
  specialization,
  selectedAvatarId,
  onPressAvatar,
}) => {
  return (
    <View style={VintageStyles.profileSection}>
      <TouchableOpacity
        style={VintageStyles.gooseAvatarCircle}
        onPress={onPressAvatar}
      >
        <Image
          source={getLocalAvatarImage(selectedAvatarId)}
          style={VintageStyles.gooseAvatarImage}
          resizeMode="cover"
        />
        <View style={VintageStyles.editAvatarIcon}>
          <Feather name="edit-2" size={16} color={VintageColors.primaryText} />
        </View>
      </TouchableOpacity>

      <Text style={VintageStyles.profileName}>{username}</Text>

      {specialization ? (
        <Text
          style={[
            VintageStyles.profileSpecialization,
            {
              color: VintageColors.secondaryText,
              fontStyle: "italic",
              marginTop: 4,
            },
          ]}
        >
          {specialization}
        </Text>
      ) : null}

      <View style={VintageStyles.spacing10} />

      <View style={VintageStyles.vintageStats}>
        <View style={VintageStyles.statItem}>
          <View style={VintageStyles.statIconContainer}>
            <Feather name="droplet" size={18} color={VintageColors.statIcon} />
          </View>
          <Text style={VintageStyles.statValue}>5.8</Text>
          <Text style={VintageStyles.statLabel}>glucose</Text>
        </View>

        <View style={VintageStyles.statDivider} />

        <View style={VintageStyles.statItem}>
          <View style={VintageStyles.statIconContainer}>
            <Ionicons name="flower" size={18} color={VintageColors.statIcon} />
          </View>
          <Text style={VintageStyles.statValue}>85%</Text>
          <Text style={VintageStyles.statLabel}>in range</Text>
        </View>

        <View style={VintageStyles.statDivider} />

        <View style={VintageStyles.statItem}>
          <View style={VintageStyles.statIconContainer}>
            <Feather name="sun" size={18} color={VintageColors.statIcon} />
          </View>
          <Text style={VintageStyles.statValue}>28</Text>
          <Text style={VintageStyles.statLabel}>days</Text>
        </View>
      </View>
    </View>
  );
};
