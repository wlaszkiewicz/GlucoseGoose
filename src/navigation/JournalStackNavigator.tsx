import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import JournalScreen from "../screens/JournalScreen";
import FoodScreen from "../screens/journal/FoodScreen";
import SportsScreen from "../screens/journal/SportsScreen";
import OtherEntriesScreen from "../screens/journal/OtherEntriesScreen";
import { JournalHeader } from "../components/journal/JournalNavHeader";
import { VintageColors } from "../themes/vintage/colors";
import HealthConnectScreen from "../screens/HealthConnectScreen";
export type JournalStackParamList = {
  JournalMain: undefined;
  Food: { selectedDate: string };
  Sports: { selectedDate: string };
  Other: { selectedDate: string };
};

const Stack = createNativeStackNavigator<JournalStackParamList>();

const JournalStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: VintageColors.background,
        },
        headerTintColor: VintageColors.primaryText,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: "300",
        },
        headerShadowVisible: false,
        headerBackVisible: false,
      }}
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
        options={({ navigation, route }) => ({
          header: () => (
            <JournalHeader
              title="Food & Meals"
              navigation={navigation}
              showBackButton={true}
            />
          ),
        })}
      />

      {/* <Stack.Screen
        name="Sports"
        component={SportsScreen}
        options={({ navigation }) => ({
          header: () => (
            <JournalHeader
              title="Sports"
              navigation={navigation}
              showBackButton={true}
            />
          ),
        })}
      /> */}

      <Stack.Screen
        name="Sports"
        component={HealthConnectScreen}
        options={({ navigation }) => ({
          header: () => (
            <JournalHeader
              title="Sports"
              navigation={navigation}
              showBackButton={true}
            />
          ),
        })}
      />

      <Stack.Screen
        name="Other"
        component={OtherEntriesScreen}
        options={({ navigation }) => ({
          header: () => (
            <JournalHeader
              title="Other"
              navigation={navigation}
              showBackButton={true}
            />
          ),
        })}
      />
    </Stack.Navigator>
  );
};

export default JournalStackNavigator;
