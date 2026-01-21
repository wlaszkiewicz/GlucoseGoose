import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Animated, View, StyleSheet, Settings } from "react-native";
import { VintageColors } from "../themes/vintage/colors";
import DoctorDashboardScreen from "../screens/doctor/DoctorDashboardScreen";
import DoctorPatientsScreen from "../screens/doctor/DoctorPatientsScreen";
import DoctorAnalyticsScreen from "../screens/doctor/DoctorAnalyticsScreen";
import SettingsScreen from "../screens/SettingsScreen";

import DoctorPatientsStack from "./DoctorPatientsStack";

const Tab = createBottomTabNavigator();

const CustomTabBarLabel = ({
  focused,
  label,
  color,
}: {
  focused: boolean;
  label: string;
  color: string;
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.05,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused]);

  return (
    <View style={styles.labelContainer}>
      <Animated.Text
        style={[styles.label, { color, transform: [{ scale: scaleAnim }] }]}
      >
        {label}
      </Animated.Text>
      <Animated.View
        style={[
          styles.underline,
          { opacity: opacityAnim, backgroundColor: color },
        ]}
      />
    </View>
  );
};

const DoctorTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        title: "GlucoseGoose MD",
        tabBarStyle: {
          backgroundColor: VintageColors.cardBackground,
          borderTopWidth: 1,
          borderTopColor: VintageColors.border,
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
          borderRadius: 30,
        },
        tabBarActiveTintColor: VintageColors.primaryText,
        tabBarInactiveTintColor: VintageColors.secondaryText,
      }}
    >
      <Tab.Screen
        name="DoctorDashboard"
        component={DoctorDashboardScreen}
        options={{
          title: "Dashboard",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "speedometer" : "speedometer-outline"}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: (props) => (
            <CustomTabBarLabel {...props} label="Dashboard" />
          ),
        }}
      />
      <Tab.Screen
        name="DoctorPatients"
        component={DoctorPatientsStack}
        options={{
          title: "Patients",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: (props) => (
            <CustomTabBarLabel {...props} label="Patients" />
          ),
        }}
      />
      <Tab.Screen
        name="DoctorAnalytics"
        component={DoctorAnalyticsScreen}
        options={{
          title: "Analytics",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "analytics" : "analytics-outline"}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: (props) => (
            <CustomTabBarLabel {...props} label="Analytics" />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: (props) => (
            <CustomTabBarLabel {...props} label="Settings" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  labelContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
    textAlign: "center",
  },
  underline: {
    width: 24,
    height: 2,
    borderRadius: 1,
    marginTop: 4,
  },
});

export default DoctorTabNavigator;
