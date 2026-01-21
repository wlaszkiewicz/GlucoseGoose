import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import SplashScreen from "./screens/SplashScreen";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NightscoutProvider } from "./contexts/NightscoutContext";

import MainTabNavigator from "./navigation/MainTabNavigator";
import { VintageColors } from "./themes/vintage/colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import DoctorTabNavigator from "./navigation/DoctorTabNavigator";
import { DoctorProvider } from "./contexts/DoctorContext";

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const { firebaseUser, loading, userData } = useAuth();

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
          <NavigationContainer>
            <SafeAreaProvider>
              <>
                <SafeAreaView
                  edges={["top", "left", "right"]}
                  style={{ backgroundColor: VintageColors.background }}
                />

                <SafeAreaView
                  edges={["bottom"]}
                  style={{
                    flex: 1,
                    backgroundColor: VintageColors.cardBackground,
                  }}
                >
                  <AppContent />
                </SafeAreaView>
              </>
            </SafeAreaProvider>
          </NavigationContainer>
        </DoctorProvider>
      </NightscoutProvider>
    </AuthProvider>
  );
}
