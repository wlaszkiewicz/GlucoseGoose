import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, Feather, FontAwesome5 } from "@expo/vector-icons";
import { Text } from "react-native";
import HomeScreen from "./screens/HomeScreen";
import JournalScreen from "./screens/JournalScreen";
import TrendsScreen from "./screens/TrendsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import { MainTabParamList } from "./types/navigation";
import { VintageNavBarConfig } from "./themes/vintage/navBar_vintage";

const Tab = createBottomTabNavigator<MainTabParamList>();

const iconComponents: Record<string, any> = {
  Ionicons,
  Feather,
  FontAwesome5,
};

const MainTabNavigator = () => {
  const iconColor = VintageNavBarConfig.getIconColor();

  return (
    <Tab.Navigator
      screenOptions={VintageNavBarConfig.screenOptions}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={({ route }) => ({
          title: VintageNavBarConfig.getLabel("Home"),
          tabBarIcon: ({ focused, size }) => {
            const IconComponent = iconComponents[VintageNavBarConfig.getIconComponent("home")];
            return (
              <IconComponent 
                name={VintageNavBarConfig.getIconName(focused, "home")}
                size={VintageNavBarConfig.getIconSize(focused, size, "home")}
                color={iconColor} 
              />
            );
          },
          tabBarLabel: ({ focused }) => (
            <Text style={{
              fontSize: 11,
              fontWeight: focused ? '700' : '400',
              letterSpacing: 0.5,
              marginTop: 0,
              marginBottom: 2,
              fontFamily: 'System',
              color: iconColor, 
            }}>
              {VintageNavBarConfig.getLabel("Home")}
            </Text>
          ),
        })}
      />
      <Tab.Screen
        name="Journal"
        component={JournalScreen}
        options={({ route }) => ({
          title: VintageNavBarConfig.getLabel("Journal"),
          tabBarIcon: ({ focused, size }) => {
            const IconComponent = iconComponents[VintageNavBarConfig.getIconComponent("journal")];
            return (
              <IconComponent 
                name={VintageNavBarConfig.getIconName(focused, "journal")}
                size={VintageNavBarConfig.getIconSize(focused, size, "journal")}
                color={iconColor}
              />
            );
          },
          tabBarLabel: ({ focused }) => (
            <Text style={{
              fontSize: 11,
              fontWeight: focused ? '700' : '400',
              letterSpacing: 0.5,
              marginTop: 0,
              marginBottom: 2,
              fontFamily: 'System',
              color: iconColor,
            }}>
              {VintageNavBarConfig.getLabel("Journal")}
            </Text>
          ),
        })}
      />
      <Tab.Screen
        name="Trends"
        component={TrendsScreen}
        options={({ route }) => ({
          title: VintageNavBarConfig.getLabel("Trends"),
          tabBarIcon: ({ focused, size }) => {
            const IconComponent = iconComponents[VintageNavBarConfig.getIconComponent("trends")];
            return (
              <IconComponent 
                name={VintageNavBarConfig.getIconName(focused, "trends")}
                size={VintageNavBarConfig.getIconSize(focused, size, "trends")}
                color={iconColor}
              />
            );
          },
          tabBarLabel: ({ focused }) => (
            <Text style={{
              fontSize: 11,
              fontWeight: focused ? '700' : '400',
              letterSpacing: 0.5,
              marginTop: 0,
              marginBottom: 2,
              fontFamily: 'System',
              color: iconColor,
            }}>
              {VintageNavBarConfig.getLabel("Trends")}
            </Text>
          ),
        })}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={({ route }) => ({
          title: VintageNavBarConfig.getLabel("Settings"),
          tabBarIcon: ({ focused, size }) => {
            const IconComponent = iconComponents[VintageNavBarConfig.getIconComponent("profile")];
            return (
              <IconComponent 
                name={VintageNavBarConfig.getIconName(focused, "profile")}
                size={VintageNavBarConfig.getIconSize(focused, size, "profile")}
                color={iconColor}
              />
            );
          },
          tabBarLabel: ({ focused }) => (
            <Text style={{
              fontSize: 11,
              fontWeight: focused ? '700' : '400',
              letterSpacing: 0.5,
              marginTop: 0,
              marginBottom: 2,
              fontFamily: 'System',
              color: iconColor,
            }}>
              {VintageNavBarConfig.getLabel("Settings")}
            </Text>
          ),
        })}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;