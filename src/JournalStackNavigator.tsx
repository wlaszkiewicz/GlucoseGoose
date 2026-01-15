import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import JournalScreen from "./screens/JournalScreen";
import FoodScreen from "./screens/journal/FoodScreen"; // Updated component
import ActivitiesScreen from "./screens/journal/SportsScreen";
import NotesScreen from "./screens/journal/OtherEntriesScreen";
import { VintageColors } from "./themes/vintage/colors";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

export type JournalStackParamList = {
  JournalMain: undefined;
  Food: undefined;
  Activities: undefined;
  Notes: undefined;
};

const Stack = createNativeStackNavigator<JournalStackParamList>();

const JournalStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: VintageColors.cardBackground,
        },
        headerTintColor: VintageColors.primaryText,
        headerTitleStyle: {
          fontWeight: "600",
        },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerLeft: ({ canGoBack, tintColor }) =>
          canGoBack ? (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ padding: 8 }}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={tintColor || VintageColors.primaryText}
              />
            </TouchableOpacity>
          ) : null,
      })}
    >
      <Stack.Screen
        name="JournalMain"
        component={JournalScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Food"
        component={FoodScreen}
        options={{
          title: "Food & Meals",
        }}
      />
      <Stack.Screen
        name="Activities"
        component={ActivitiesScreen}
        options={{
          title: "Activities",
        }}
      />
      <Stack.Screen
        name="Notes"
        component={NotesScreen}
        options={{
          title: "Notes",
        }}
      />
    </Stack.Navigator>
  );
};

export default JournalStackNavigator;
