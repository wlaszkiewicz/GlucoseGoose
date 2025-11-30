import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import SplashScreen from "./screens/SplashScreen";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NightscoutProvider } from "./context/NightscoutContext";
import MainTabNavigator from "./MainTabNavigator";
import { ActivityProvider } from "./context/ActivityContext";
import { FoodProvider } from "./context/FoodContext";

const Stack = createNativeStackNavigator();

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
};

const AppContent = () => {
  const { firebaseUser, loading } = useAuth();

  if (loading) return <SplashScreen />;

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={firebaseUser ? "Home" : "Login"}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Home" component={MainTabNavigator} />
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NightscoutProvider>
          <ActivityProvider>
            <FoodProvider>
              <NavigationContainer>
                <AppContent />
              </NavigationContainer>
            </FoodProvider>
          </ActivityProvider>
        </NightscoutProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
