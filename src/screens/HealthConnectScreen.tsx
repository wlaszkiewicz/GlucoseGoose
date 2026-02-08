import React, { useState } from "react";
import { View, Text, Button, ScrollView } from "react-native";
import {
  initialize,
  requestPermission,
  readRecords,
} from "react-native-health-connect";

export default function HealthConnectScreen() {
  const [steps, setSteps] = useState<any[]>([]);
  const [heartRate, setHeartRate] = useState<any[]>([]);
  const [granted, setGranted] = useState(false);

  const loadData = async () => {
    const isInit = await initialize();
    if (!isInit) {
      console.log("Health Connect not available");
      return;
    }

    const grantedPermissions = await requestPermission([
      { accessType: "read", recordType: "Steps" },
      { accessType: "read", recordType: "HeartRate" },
    ]);

    setGranted(grantedPermissions.length > 0);

    if (grantedPermissions) {
      const start = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24h
      const end = new Date();

      const stepsResult = await readRecords("Steps", {
        timeRangeFilter: {
          operator: "between",
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        },
      });

      const hrResult = await readRecords("HeartRate", {
        timeRangeFilter: {
          operator: "between",
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        },
      });

      setSteps(stepsResult.records);
      setHeartRate(hrResult.records);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Button title="Request Permissions & Load Data" onPress={loadData} />
      <Text style={{ marginTop: 20 }}>
        Permissions Granted: {granted ? "Yes" : "No"}
      </Text>

      <Text style={{ marginTop: 20, fontWeight: "bold" }}>Steps Last 24h:</Text>
      {steps.map((s, i) => (
        <Text key={i}>
          {new Date(s.startTime).toLocaleString()} → {s.count} steps
        </Text>
      ))}

      <Text style={{ marginTop: 20, fontWeight: "bold" }}>
        Heart Rate Last 24h:
      </Text>
      {heartRate.map((h, i) => (
        <Text key={i}>
          {new Date(h.startTime).toLocaleString()} → {h.bpm} bpm
        </Text>
      ))}
    </ScrollView>
  );
}
