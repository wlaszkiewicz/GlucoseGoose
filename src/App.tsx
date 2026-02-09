import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import SplashScreen from "./screens/SplashScreen";
import HealthConnectScreen from "./screens/HealthConnectScreen";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NightscoutProvider } from "./contexts/NightscoutContext";

import MainTabNavigator from "./navigation/MainTabNavigator";
import { VintageColors } from "./themes/vintage/colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import DoctorTabNavigator from "./navigation/DoctorTabNavigator";
import { DoctorProvider } from "./contexts/DoctorContext";
import * as Notifications from "expo-notifications";
import { StatusBar } from "react-native";
import { TrendsProvider } from "./contexts/TrendsContext";
import { useHealthConnectAutoSync } from "./hooks/useHealthConnectAutoSync";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // iOS banner
    shouldShowList: true, // iOS Notification Center list
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const { firebaseUser, loading, userData } = useAuth();
  useHealthConnectAutoSync();

  if (loading) return <SplashScreen />;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: VintageColors.background },
      }}
      initialRouteName={firebaseUser ? "MainTabs" : "Login"}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="HealthConnect" component={HealthConnectScreen} />

      {userData?.role === "doctor" ? (
        <Stack.Screen
          name="MainTabs"
          component={DoctorTabNavigator}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NightscoutProvider>
        <DoctorProvider>
          <TrendsProvider>
            <NavigationContainer>
              <SafeAreaProvider>
                <>
                  <StatusBar
                    barStyle="dark-content"
                    backgroundColor={VintageColors.background}
                  />
                  {/* 
                <SafeAreaView
                  //edges={["top", "left", "right"]}
                  style={{ backgroundColor: VintageColors.background }}
                /> */}

                  <SafeAreaView
                    //   edges={["bottom"]}
                    style={{
                      flex: 1,
                      backgroundColor: VintageColors.background,
                    }}
                  >
                    <AppContent />
                  </SafeAreaView>
                </>
              </SafeAreaProvider>
            </NavigationContainer>
          </TrendsProvider>
        </DoctorProvider>
      </NightscoutProvider>
    </AuthProvider>
  );
}
