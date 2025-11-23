import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import { RootStackParamList } from "./types/navigation";
import HomeScreen from "./screens/HomeScreen";
import { useAuth } from "./hooks/useAuth";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const user = useAuth(); // TODO: use this to redirect if already logged in

  //TODO: implement so onlogged in users can access HomeScreen!!!

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
