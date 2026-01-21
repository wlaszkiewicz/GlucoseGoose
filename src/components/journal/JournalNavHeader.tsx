import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { VintageColors } from "../../themes/vintage/colors";

interface JournalHeaderProps {
  title: string;
  navigation: any;
  showBackButton?: boolean;
}

export const JournalHeader: React.FC<JournalHeaderProps> = ({
  title,
  navigation,
  showBackButton = true,
}) => {
  return (
    <View
      style={{
        backgroundColor: VintageColors.background,
        paddingTop: 10,
        paddingBottom: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: VintageColors.border,
        shadowColor: VintageColors.lightBorder,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Back Button */}
        {showBackButton && navigation.canGoBack() ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              padding: 8,
              position: "absolute",
              left: 0,
              zIndex: 1,
            }}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={VintageColors.primaryText}
            />
          </TouchableOpacity>
        ) : null}

        <View style={{ flex: 1, alignItems: "center" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                backgroundColor: VintageColors.headerLine,
                marginRight: 12,
                width: 40,
                height: 1,
              }}
            />
            <Text
              style={{
                fontSize: 24,
                fontWeight: "300",
                color: VintageColors.headerTitle,
                letterSpacing: 2,
                fontFamily: "System",
                marginBottom: 8,
              }}
            >
              {title}
            </Text>
            <View
              style={{
                width: 40,
                height: 1,
                backgroundColor: VintageColors.headerLine,
                marginLeft: 12,
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};
