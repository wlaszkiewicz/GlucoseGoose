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

  const getAvatarColor = (index: number) => {
    const colors = [
      VintageColors.iconGreen,
      VintageColors.iconBlue,
      VintageColors.iconPurple,
      VintageColors.iconPink,
      VintageColors.iconOrange,
      VintageColors.iconRed,
    ];
    return colors[index % colors.length];
  };

  return (
    <View style={VintageStyles.container}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={VintageStyles.scrollContent}
      >
        {/* Header */}
        <View style={[VintageStyles.headerSection, { marginBottom: 24 }]}>
          <View style={VintageStyles.header}>
            <View style={VintageStyles.headerDecoration}>
              <View style={VintageStyles.headerLine} />
              <Text style={VintageStyles.headerTitle}>My Patients</Text>
              <View style={VintageStyles.headerLine} />
            </View>
          </View>
        </View>

        {/* Patient List Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconContainer}>
            <Feather name="list" size={20} color={VintageColors.primaryText} />
          </View>
          <Text style={styles.sectionTitle}>Patient List</Text>
          <View style={styles.patientCount}>
            <Text style={styles.patientCountText}>{patients.length}</Text>
          </View>
        </View>

        {loadingPatients && patients.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Feather
                name="loader"
                size={32}
                color={VintageColors.secondaryText}
              />
            </View>
            <Text style={styles.emptyTitle}>Loading patients...</Text>
            <Text style={styles.emptySubtext}>
              Please wait while we fetch your patient list
            </Text>
          </View>
        ) : patients.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Feather
                name="users"
                size={32}
                color={VintageColors.secondaryText}
              />
            </View>
            <Text style={styles.emptyTitle}>No patients yet</Text>
            <Text style={styles.emptySubtext}>
              Your patients will appear here once added
            </Text>
          </View>
        ) : (
          patients.map((p, index) => (
            <TouchableOpacity
              key={p.uid}
              style={styles.patientCard}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate("DoctorPatientDetail", { patient: p })
              }
            >
              {/* Patient Avatar with Color */}
              <View 
                style={[
                  styles.avatarContainer,
                  { backgroundColor: getAvatarColor(index) }
                ]}
              >
                <Text style={styles.avatarText}>
                  {getInitials(p.displayName || "Patient")}
                </Text>
              </View>

              {/* Patient Info */}
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>
                  {p.displayName || "Unnamed Patient"}
                </Text>
                
                <View style={styles.urlRow}>
                  <Feather
                    name="link"
                    size={12}
                    color={VintageColors.secondaryText}
                  />
                  <Text style={styles.urlText} numberOfLines={1}>
                    {p.nightscoutUrl.replace('https://', '').replace('http://', '')}
                  </Text>
                </View>
              </View>

              {/* Arrow */}
              <Feather
                name="chevron-right"
                size={20}
                color={VintageColors.secondaryText}
              />
            </TouchableOpacity>
          ))
        )}

        <View style={VintageStyles.spacing60} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  
  sectionTitle: {
    fontSize: 18,
    color: VintageColors.primaryText,
    fontWeight: "600",
    letterSpacing: 0.3,
    flex: 1,
  },
  
  patientCount: {
    backgroundColor: VintageColors.lightBackground,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  
  patientCountText: {
    fontSize: 14,
    fontWeight: "600",
    color: VintageColors.primaryText,
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
  
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: VintageColors.primaryText,
  },
  
  patientInfo: {
    flex: 1,
  },
  
  patientName: {
    fontSize: 16,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 6,
  },
  
  urlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  
  urlText: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    flex: 1,
  },
  
  emptyCard: {
    backgroundColor: VintageColors.cardBackground,
    padding: 40,
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
    textAlign: "center",
  },
  
  emptySubtext: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    textAlign: "center",
    lineHeight: 16,
  },
});

export default DoctorPatientsScreen;