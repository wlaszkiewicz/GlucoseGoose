import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useDoctor } from "../../contexts/DoctorContext";
import { VintageStyles } from "../../themes/vintage/styles_vintage";
import { VintageColors } from "../../themes/vintage/colors";

const DoctorPatientsScreen = () => {
  const { patients, loadingPatients } = useDoctor();
  const navigation = useNavigation<any>();

  return (
    <View style={VintageStyles.container}>
      <StatusBar style="auto" />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={VintageStyles.scrollContent}
      >
        <View style={[VintageStyles.headerSection, { marginBottom: 8 }]}>
          <View style={VintageStyles.header}>
            <View style={VintageStyles.headerDecoration}>
              <View style={VintageStyles.headerLine} />
              <Text style={VintageStyles.headerTitle}>My Patients</Text>
              <View style={VintageStyles.headerLine} />
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {loadingPatients ? "Loading…" : `Patients (${patients.length})`}
          </Text>
          <View style={styles.featherAccent}>
            <Feather name="users" size={16} color={VintageColors.primaryText} />
          </View>
        </View>

        {loadingPatients && patients.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Fetching patient list…</Text>
            <Text style={styles.emptySubtext}>
              This should only take a moment.
            </Text>
          </View>
        ) : patients.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No patients yet</Text>
            <Text style={styles.emptySubtext}>
              When you add patients, they’ll appear here.
            </Text>
          </View>
        ) : (
          patients.map((p) => (
            <TouchableOpacity
              key={p.uid}
              style={styles.patientCard}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate("DoctorPatientDetail", { patient: p })
              }
            >
              <View style={styles.iconBox}>
                <Feather
                  name="user"
                  size={18}
                  color={VintageColors.primaryText}
                />
              </View>

              <View style={styles.textCol}>
                <Text style={styles.patientTitle}>
                  {"Mrs. " + (p.displayName || "Patient")}
                </Text>

                <Text style={styles.meta}>
                  <Text style={styles.metaLabel}>uid: </Text>
                  {p.uid}
                </Text>

                <Text style={styles.meta} numberOfLines={2}>
                  <Text style={styles.metaLabel}>nightscoutUrl: </Text>
                  {p.nightscoutUrl}
                </Text>
              </View>

              <View style={styles.arrowCircle}>
                <Feather
                  name="chevron-right"
                  size={16}
                  color={VintageColors.primaryText}
                />
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    color: VintageColors.primaryText,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  featherAccent: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  patientCard: {
    backgroundColor: VintageColors.cardBackground,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
    backgroundColor: VintageColors.lightBackground,
  },
  textCol: { flex: 1 },
  patientTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  meta: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    marginBottom: 2,
    lineHeight: 16,
  },
  metaLabel: {
    color: VintageColors.primaryText,
    fontWeight: "600",
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
    marginLeft: 10,
  },

  emptyCard: {
    backgroundColor: VintageColors.cardBackground,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    lineHeight: 16,
  },
});

export default DoctorPatientsScreen;
