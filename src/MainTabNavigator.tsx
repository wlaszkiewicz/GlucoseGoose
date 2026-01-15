import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Animated, View, StyleSheet } from "react-native";
import HomeScreen from "./screens/HomeScreen";
import JournalScreen from "./screens/JournalScreen";
import TrendsScreen from "./screens/TrendsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import { MainTabParamList } from "./types/navigation";
import { VintageColors } from "./themes/vintage/colors";
import JournalStackNavigator from "./JournalStackNavigator";

const Tab = createBottomTabNavigator<MainTabParamList>();

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

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        title: "GlucoseGoose",
        tabBarStyle: {
          backgroundColor: VintageColors.cardBackground,
          borderTopWidth: 1,
          borderTopColor: VintageColors.border,
          height: 70,
          paddingTop: 10,
          borderRadius: 30,
        },
        tabBarActiveTintColor: VintageColors.primaryText,
        tabBarInactiveTintColor: VintageColors.secondaryText,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color, size }) => {
            const scaleAnim = React.useRef(new Animated.Value(1)).current;

            React.useEffect(() => {
              Animated.spring(scaleAnim, {
                toValue: focused ? 1.1 : 1,
                tension: 150,
                friction: 5,
                useNativeDriver: true,
              }).start();
            }, [focused]);

            return (
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  size={size}
                  color={color}
                />
              </Animated.View>
            );
          },
          tabBarLabel: (props) => <CustomTabBarLabel {...props} label="Home" />,
        }}
      />
      <Tab.Screen
        name="Journal"
        component={JournalStackNavigator}
        options={{
          title: "Journal",
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            const scaleAnim = React.useRef(new Animated.Value(1)).current;

            React.useEffect(() => {
              Animated.spring(scaleAnim, {
                toValue: focused ? 1.1 : 1,
                tension: 150,
                friction: 5,
                useNativeDriver: true,
              }).start();
            }, [focused]);

            return (
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons
                  name={focused ? "journal" : "journal-outline"}
                  size={size}
                  color={color}
                />
              </Animated.View>
            );
          },
          tabBarLabel: (props) => (
            <CustomTabBarLabel {...props} label="Journal" />
          ),
        }}
      />
      <Tab.Screen
        name="Trends"
        component={TrendsScreen}
        options={{
          title: "Trends",
          tabBarIcon: ({ focused, color, size }) => {
            const scaleAnim = React.useRef(new Animated.Value(1)).current;

            React.useEffect(() => {
              Animated.spring(scaleAnim, {
                toValue: focused ? 1.1 : 1,
                tension: 150,
                friction: 5,
                useNativeDriver: true,
              }).start();
            }, [focused]);

            return (
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons
                  name={focused ? "trending-up" : "trending-up-outline"}
                  size={size}
                  color={color}
                />
              </Animated.View>
            );
          },
          tabBarLabel: (props) => (
            <CustomTabBarLabel {...props} label="Trends" />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          tabBarIcon: ({ focused, color, size }) => {
            const scaleAnim = React.useRef(new Animated.Value(1)).current;

            React.useEffect(() => {
              Animated.spring(scaleAnim, {
                toValue: focused ? 1.1 : 1,
                tension: 150,
                friction: 5,
                useNativeDriver: true,
              }).start();
            }, [focused]);

            return (
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons
                  name={focused ? "settings" : "settings-outline"}
                  size={size}
                  color={color}
                />
              </Animated.View>
            );
          },
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

export default MainTabNavigator;
