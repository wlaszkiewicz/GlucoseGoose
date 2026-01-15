import React from "react";
import { View, Text } from "react-native";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { VintageStyles } from "../../themes/vintage/styles_vintage";
import { VintageColors } from "../../themes/vintage/colors";

export const JournalHeader: React.FC = () => {
  return (
    <View
      style={[VintageStyles.headerSection, { marginBottom: 0, paddingTop: 5 }]}
    >
      <View style={VintageStyles.header}>
        <View style={VintageStyles.headerDecoration}>
          <View style={VintageStyles.headerLine} />
          <Text style={VintageStyles.headerTitle}>Daily Journal</Text>
          <View style={VintageStyles.headerLine} />
        </View>
      </View>
    </View>
  );
};
