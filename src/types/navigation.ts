import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  HealthConnect: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Journal: undefined;
  Trends: undefined;
  Settings: undefined;
};

export type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;
export type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Register"
>;

export type HomeScreenNavigationProp = BottomTabNavigationProp<
  MainTabParamList,
  "Home"
>;

export interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

export interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

export interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}
