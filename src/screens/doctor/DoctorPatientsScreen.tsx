import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useDoctor } from "../../contexts/DoctorContext";
import { VintageStyles } from "../../themes/vintage/styles_vintage";
import { VintageColors } from "../../themes/vintage/colors";

const { width } = Dimensions.get("window");

const DoctorPatientsScreen = () => {
  const { patients, loadingPatients } = useDoctor();
  const navigation = useNavigation<any>();

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2) || "PT"
    );
  };

  return (
    <View style={VintageStyles.container}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={VintageStyles.scrollContent}
      >
        {/* Header */}
        <View style={[VintageStyles.headerSection, { marginBottom: 8 }]}>
          <View style={VintageStyles.header}>
            <View style={VintageStyles.headerDecoration}>
              <View style={VintageStyles.headerLine} />
              <Text style={VintageStyles.headerTitle}>My Patients</Text>
              <View style={VintageStyles.headerLine} />
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{patients.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {patients.filter((p) => p.displayName).length}
            </Text>
            <Text style={styles.statLabel}>Named</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {patients.filter((p) => !p.displayName).length}
            </Text>
            <Text style={styles.statLabel}>Unnamed</Text>
          </View>
        </View>

        {/* Patient List Section */}
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
            <View style={styles.emptyIcon}>
              <Feather
                name="loader"
                size={24}
                color={VintageColors.secondaryText}
              />
            </View>
            <Text style={styles.emptyTitle}>Fetching patient list…</Text>
            <Text style={styles.emptySubtext}>
              This should only take a moment.
            </Text>
          </View>
        ) : patients.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Feather
                name="user-plus"
                size={32}
                color={VintageColors.secondaryText}
              />
            </View>
            <Text style={styles.emptyTitle}>No patients yet</Text>
            <Text style={styles.emptySubtext}>
              When you add patients, they'll appear here.
            </Text>
            <TouchableOpacity style={styles.addButton}>
              <Feather
                name="plus"
                size={16}
                color={VintageColors.primaryText}
              />
              <Text style={styles.addButtonText}>Add Patient</Text>
            </TouchableOpacity>
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
                <Text style={styles.patientInitials}>
                  {getInitials(p.displayName || "Patient")}
                </Text>
              </View>

              <View style={styles.textCol}>
                <Text style={styles.patientTitle}>
                  {p.displayName || "Unnamed Patient"}
                </Text>

                <View style={styles.metaRow}>
                  <Feather
                    name="link"
                    size={12}
                    color={VintageColors.secondaryText}
                  />
                  <Text style={styles.meta} numberOfLines={1}>
                    {p.nightscoutUrl}
                  </Text>
                </View>

                <Text style={styles.patientId}>
                  ID: {p.uid.substring(0, 8)}...
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

        <View style={VintageStyles.spacing60} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "400",
    color: VintageColors.primaryText,
    marginBottom: 4,
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: VintageColors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
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
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
    backgroundColor: VintageColors.lightBackground,
  },
  patientInitials: {
    fontSize: 14,
    fontWeight: "600",
    color: VintageColors.primaryText,
  },
  textCol: {
    flex: 1,
  },
  patientTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  meta: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    lineHeight: 16,
    flex: 1,
  },
  patientId: {
    fontSize: 11,
    color: VintageColors.secondaryText,
    fontFamily: "monospace",
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
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: VintageColors.border,
    alignItems: "center",
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    lineHeight: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
    backgroundColor: VintageColors.lightBackground,
  },
  addButtonText: {
    fontSize: 12,
    color: VintageColors.primaryText,
    fontWeight: "600",
  },
});

export default DoctorPatientsScreen;
