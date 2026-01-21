import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DoctorPatientsScreen from "../screens/doctor/DoctorPatientsScreen";
import DoctorPatientDetailScreen from "../screens/doctor/DoctorPatientDetailScreen";
import { VintageColors } from "../themes/vintage/colors";

export type DoctorPatientsStackParamList = {
  DoctorPatientsList: undefined;
  DoctorPatientDetail: { patient: any };
};

const Stack = createNativeStackNavigator<DoctorPatientsStackParamList>();

const DoctorPatientsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: VintageColors.background },
      }}
    >
      <Stack.Screen
        name="DoctorPatientsList"
        component={DoctorPatientsScreen}
      />
      <Stack.Screen
        name="DoctorPatientDetail"
        component={DoctorPatientDetailScreen}
      />
    </Stack.Navigator>
  );
};

export default DoctorPatientsStack;
