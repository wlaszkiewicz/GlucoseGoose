import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import SplashScreen from "./screens/SplashScreen";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NightscoutProvider } from "./contexts/NightscoutContext";
import MainTabNavigator from "./MainTabNavigator";
import { VintageColors } from "./themes/vintage/colors";
import { SafeAreaView } from "react-native-safe-area-context";

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const { firebaseUser, loading } = useAuth();

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
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NightscoutProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </NightscoutProvider>
    </AuthProvider>
  );
}
