import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { VintageStyles } from "../../themes/vintage/styles_vintage";
import { VintageColors } from "../../themes/vintage/colors";
import { useDoctor } from "../../contexts/DoctorContext";
import { StorageService } from "../../services/localStorageService";
import { fetchBundleDirect } from "../../utils/cloudFunctions";

const { width } = Dimensions.get("window");

type SystemActivity = {
  type: "system" | "info" | "tip";
  message: string;
  time: string;
  icon: string;
  color: string;
};

type PatientActivity = {
  type: "patient";
  patient: string;
  action: string;
  time: string;
  icon: string;
  color: string;
  patientId: string;
};

type Activity = SystemActivity | PatientActivity;

interface PatientData {
  uid: string;
  nightscoutUrl: string;
  displayName?: string;
  entries: any[];
  treatments: any[];
  loading: boolean;
  error: string | null;
  isPublic?: boolean;
}

const DoctorDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { patients, loadingPatients } = useDoctor();
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [patientSecrets, setPatientSecrets] = useState<{
    [key: string]: string;
  }>({});
  const [patientData, setPatientData] = useState<{
    [key: string]: PatientData;
  }>({});
  const [patientAccessStatus, setPatientAccessStatus] = useState<{
    [key: string]: {
      hasSecret: boolean;
      isPublic: boolean;
      isAccessible: boolean;
    };
  }>({});

  useEffect(() => {
    const loadPatientSecrets = async () => {
      const secrets: { [key: string]: string } = {};
      for (const patient of patients) {
        const secret = await StorageService.getPatientSecret(patient.uid);
        secrets[patient.uid] = secret || "";
      }
      setPatientSecrets(secrets);
      setDashboardLoading(false);
    };

    if (!loadingPatients) {
      loadPatientSecrets();
    }
  }, [patients, loadingPatients]);

  // Check patient access status (public vs private)
  useEffect(() => {
    const checkPatientAccess = async () => {
      const accessStatus: {
        [key: string]: {
          hasSecret: boolean;
          isPublic: boolean;
          isAccessible: boolean;
        };
      } = {};

      for (const patient of patients) {
        const secret = patientSecrets[patient.uid] || "";
        const hasSecret = !!secret;

        if (hasSecret) {
          // Has secret, definitely accessible
          accessStatus[patient.uid] = {
            hasSecret: true,
            isPublic: false,
            isAccessible: true,
          };
        } else {
          // No secret, check if Nightscout is public
          try {
            // Try to fetch data without secret (test if public)
            const minutes = 1; // Just test with minimal data
            try {
              await fetchBundleDirect(patient.nightscoutUrl, "", minutes);
              // If successful without secret, it's public
              accessStatus[patient.uid] = {
                hasSecret: false,
                isPublic: true,
                isAccessible: true,
              };
            } catch (error: any) {
              if (
                error.message === "AUTH_REQUIRED" ||
                error.code === "AUTH_REQUIRED"
              ) {
                // Authentication required, not public
                accessStatus[patient.uid] = {
                  hasSecret: false,
                  isPublic: false,
                  isAccessible: false,
                };
              } else {
                // Other error, might be network or server issue
                accessStatus[patient.uid] = {
                  hasSecret: false,
                  isPublic: false,
                  isAccessible: false,
                };
              }
            }
          } catch {
            // Network error or other issue
            accessStatus[patient.uid] = {
              hasSecret: false,
              isPublic: false,
              isAccessible: false,
            };
          }
        }
      }

      setPatientAccessStatus(accessStatus);
    };

    if (Object.keys(patientSecrets).length > 0) {
      checkPatientAccess();
    }
  }, [patients, patientSecrets]);

  useEffect(() => {
    const loadPatientData = async () => {
      const newPatientData: { [key: string]: PatientData } = {};

      for (const patient of patients) {
        const secret = patientSecrets[patient.uid] || "";
        const accessStatus = patientAccessStatus[patient.uid];

        // Only try to load data if patient is accessible (has secret OR is public)
        if (accessStatus?.isAccessible) {
          // Initialize patient data structure
          newPatientData[patient.uid] = {
            uid: patient.uid,
            nightscoutUrl: patient.nightscoutUrl,
            displayName: patient.displayName,
            entries: [],
            treatments: [],
            loading: true,
            error: null,
            isPublic: accessStatus.isPublic,
          };

          try {
            // Fetch bundle (entries + treatments) - get last 24 hours
            const minutes = 24 * 60; // 24 hours

            // Use empty string for public Nightscouts, secret for private ones
            const bundleSecret = accessStatus.hasSecret ? secret : "";

            const bundle = await fetchBundleDirect(
              patient.nightscoutUrl,
              bundleSecret,
              minutes,
            );

            newPatientData[patient.uid] = {
              ...newPatientData[patient.uid],
              entries: bundle.entries || [],
              treatments: [
                ...(bundle.meals || []),
                ...(bundle.activities || []),
                ...(bundle.otherTreatments || []),
              ],
              loading: false,
              error: null,
              isPublic: accessStatus.isPublic,
            };
          } catch (error: any) {
            console.error(
              `Error loading data for patient ${patient.uid}:`,
              error,
            );
            newPatientData[patient.uid] = {
              ...newPatientData[patient.uid],
              loading: false,
              error: error?.message || "Failed to load data from Nightscout",
              isPublic: accessStatus.isPublic,
            };
          }
        } else {
          // Not accessible
          const hasSecret = !!patientSecrets[patient.uid];
          newPatientData[patient.uid] = {
            uid: patient.uid,
            nightscoutUrl: patient.nightscoutUrl,
            displayName: patient.displayName,
            entries: [],
            treatments: [],
            loading: false,
            error: hasSecret ? "Check API secret" : "No API secret configured",
            isPublic: false,
          };
        }
      }

      setPatientData(newPatientData);
    };

    if (
      Object.keys(patientSecrets).length > 0 &&
      Object.keys(patientAccessStatus).length > 0
    ) {
      loadPatientData();
    }
  }, [patients, patientSecrets, patientAccessStatus]);

  // Calculate real stats based on actual data
  const calculateRealStats = useMemo(() => {
    if (patients.length === 0) {
      return [
        {
          label: "Active Patients",
          value: "0",
          icon: "users",
          color: VintageColors.secondaryText,
          subtext: "No patients yet",
        },
        {
          label: "Data Coverage",
          value: "0%",
          icon: "database",
          color: VintageColors.secondaryText,
          subtext: "No data available",
        },
        {
          label: "Avg Glucose",
          value: "--",
          icon: "droplet",
          color: VintageColors.secondaryText,
          subtext: "No readings",
        },
        {
          label: "Alerts",
          value: "0",
          icon: "bell",
          color: VintageColors.secondaryText,
          subtext: "All clear",
        },
      ];
    }

    // Calculate patients with data
    const patientsWithData = Object.values(patientData).filter(
      (patient: PatientData) => patient.entries && patient.entries.length > 0,
    ).length;

    // Calculate overall average glucose from all patients with data
    let totalGlucose = 0;
    let totalReadings = 0;
    let hypoAlerts = 0;

    Object.values(patientData).forEach((patient: PatientData) => {
      if (patient.entries && patient.entries.length > 0) {
        patient.entries.forEach((entry: any) => {
          if (entry.sgv) {
            totalGlucose += entry.sgv;
            totalReadings++;

            // Count hypoglycemia alerts (< 70 mg/dL)
            if (entry.sgv < 70) {
              hypoAlerts++;
            }
          }
        });
      }
    });

    const avgGlucose =
      totalReadings > 0 ? Math.round(totalGlucose / totalReadings) : 0;
    const dataCoverage =
      patients.length > 0
        ? Math.round((patientsWithData / patients.length) * 100)
        : 0;

    return [
      {
        label: "Active Patients",
        value: patients.length.toString(),
        icon: "users",
        color: VintageColors.iconGreen,
        subtext: `${patientsWithData} with data`,
      },
      {
        label: "Data Coverage",
        value: `${dataCoverage}%`,
        icon: "database",
        color:
          dataCoverage >= 50
            ? VintageColors.iconBlue
            : VintageColors.iconOrange,
        subtext:
          patientsWithData === patients.length
            ? "Full access"
            : "Limited access",
      },
      {
        label: "Avg Glucose",
        value: avgGlucose > 0 ? `${avgGlucose} mg/dL` : "--",
        icon: "droplet",
        color:
          avgGlucose > 0
            ? VintageColors.iconPurple
            : VintageColors.secondaryText,
        subtext:
          patientsWithData > 0
            ? `From ${patientsWithData} patient${patientsWithData !== 1 ? "s" : ""}`
            : "No readings",
      },
      {
        label: "Alerts",
        value: hypoAlerts.toString(),
        icon: "bell",
        color: hypoAlerts > 0 ? VintageColors.iconRed : VintageColors.iconGreen,
        subtext: hypoAlerts > 0 ? `${hypoAlerts} low glucose` : "All clear",
      },
    ];
  }, [patients, patientData]);

  const stats = calculateRealStats;

  // Generate recent activities based on actual patient data
  const getRecentActivities = useMemo((): Activity[] => {
    if (patients.length === 0) {
      return [
        {
          type: "info",
          message: "Welcome to your dashboard!",
          time: "Just now",
          icon: "info",
          color: VintageColors.iconBlue,
        },
        {
          type: "tip",
          message: "Add your first patient to get started",
          time: "Today",
          icon: "user-plus",
          color: VintageColors.iconGreen,
        },
      ];
    }

    const activities: Activity[] = [];
    const now = new Date();

    // Add system activity for patient count
    activities.push({
      type: "system",
      message: `You have ${patients.length} active patient${patients.length !== 1 ? "s" : ""}`,
      time: "Today",
      icon: "users",
      color: VintageColors.iconBlue,
    });

    // Add patient-specific activities based on real data
    patients.slice(0, 3).forEach((patient, index) => {
      const patientDataObj = patientData[patient.uid];
      const accessStatus = patientAccessStatus[patient.uid];
      const hasSecret = !!patientSecrets[patient.uid];

      if (!accessStatus?.isAccessible) {
        // Patient not accessible
        activities.push({
          type: "patient",
          patient: patient.displayName || `Patient ${index + 1}`,
          action: "Needs API secret configuration",
          time: index === 0 ? "Recently" : `A while ago`,
          icon: "key",
          color: VintageColors.iconOrange,
          patientId: patient.uid,
        });
      } else if (patientDataObj?.loading) {
        // Still loading data
        activities.push({
          type: "patient",
          patient: patient.displayName || `Patient ${index + 1}`,
          action: "Loading data...",
          time: index === 0 ? "Just now" : `Recently`,
          icon: "refresh-cw",
          color: VintageColors.iconBlue,
          patientId: patient.uid,
        });
      } else if (patientDataObj?.error) {
        // Error loading data
        activities.push({
          type: "patient",
          patient: patient.displayName || `Patient ${index + 1}`,
          action: "Failed to load data",
          time: index === 0 ? "Just now" : `Recently`,
          icon: "alert-circle",
          color: VintageColors.iconRed,
          patientId: patient.uid,
        });
      } else if (patientDataObj?.entries && patientDataObj.entries.length > 0) {
        // Has data - show latest reading
        const latestEntry = patientDataObj.entries.reduce(
          (latest: any, entry: any) => {
            const entryTime = new Date(
              entry.dateString || entry.timestamp || entry.date || 0,
            );
            const latestTime = latest
              ? new Date(
                  latest.dateString || latest.timestamp || latest.date || 0,
                )
              : 0;
            return entryTime > latestTime ? entry : latest;
          },
          null,
        );

        if (latestEntry) {
          const entryTime = new Date(
            latestEntry.dateString ||
              latestEntry.timestamp ||
              latestEntry.date ||
              0,
          );
          const hoursAgo = Math.floor(
            (now.getTime() - entryTime.getTime()) / (1000 * 60 * 60),
          );

          let timeText = "Just now";
          if (hoursAgo === 1) timeText = "1 hour ago";
          else if (hoursAgo > 1 && hoursAgo < 24)
            timeText = `${hoursAgo} hours ago`;
          else if (hoursAgo >= 24)
            timeText = `${Math.floor(hoursAgo / 24)} days ago`;

          const glucoseStatus =
            latestEntry.sgv < 70
              ? "Low"
              : latestEntry.sgv > 180
                ? "High"
                : "Normal";

          activities.push({
            type: "patient",
            patient: patient.displayName || `Patient ${index + 1}`,
            action: `${latestEntry.sgv} mg/dL (${glucoseStatus})`,
            time: timeText,
            icon: "droplet",
            color:
              latestEntry.sgv < 70
                ? VintageColors.iconRed
                : latestEntry.sgv > 180
                  ? VintageColors.iconOrange
                  : VintageColors.iconGreen,
            patientId: patient.uid,
          });
        }
      } else {
        // No data but accessible
        activities.push({
          type: "patient",
          patient: patient.displayName || `Patient ${index + 1}`,
          action: "No recent glucose data",
          time: index === 0 ? "Recently" : `A while ago`,
          icon: "database",
          color: VintageColors.iconBlue,
          patientId: patient.uid,
        });
      }
    });

    return activities.slice(0, 4); // Limit to 4 activities
  }, [patients, patientData, patientAccessStatus, patientSecrets]);

  const recentActivities = getRecentActivities;

  // Generate patient highlights based on actual data
  const getPatientHighlights = useMemo(() => {
    if (patients.length === 0) {
      return {
        bestControlled: null,
        needsAttention: null,
        recentAddition: null,
      };
    }

    const highlights: any = {};

    // Find patient with best time in range
    let bestPatient: any = null;
    let bestTimeInRange = 0;

    Object.values(patientData).forEach((patient: PatientData) => {
      if (patient.entries && patient.entries.length > 0) {
        let inRange = 0;
        let totalReadings = 0;

        patient.entries.forEach((entry: any) => {
          if (entry.sgv) {
            totalReadings++;
            if (entry.sgv >= 70 && entry.sgv <= 180) {
              inRange++;
            }
          }
        });

        const timeInRangePercent =
          totalReadings > 0 ? Math.round((inRange / totalReadings) * 100) : 0;

        if (timeInRangePercent > bestTimeInRange) {
          bestTimeInRange = timeInRangePercent;
          bestPatient = patient;
        }
      }
    });

    if (bestPatient) {
      highlights.bestControlled = {
        name: bestPatient.displayName || "Patient",
        metric: `${bestTimeInRange}% in range`,
        days: "Last 24h",
      };
    }

    // Find patient needing attention (no data or errors)
    const patientsNeedingAttention = patients.filter((patient) => {
      const patientDataObj = patientData[patient.uid];
      const accessStatus = patientAccessStatus[patient.uid];

      return (
        !accessStatus?.isAccessible ||
        patientDataObj?.error ||
        (patientDataObj?.entries && patientDataObj.entries.length === 0)
      );
    });

    if (patientsNeedingAttention.length > 0) {
      const patient = patientsNeedingAttention[0];
      const patientDataObj = patientData[patient.uid];
      const accessStatus = patientAccessStatus[patient.uid];

      let reason = "Needs attention";
      if (!accessStatus?.isAccessible) {
        reason = "API secret needed";
      } else if (patientDataObj?.error) {
        reason = "Data error";
      } else if (
        patientDataObj?.entries &&
        patientDataObj.entries.length === 0
      ) {
        reason = "No glucose data";
      }

      highlights.needsAttention = {
        name: patient.displayName || `Patient ${patients.indexOf(patient) + 1}`,
        reason: reason,
        action: "Configure now",
      };
    }

    // Most recent addition (last in array)
    if (patients.length > 0) {
      const lastPatient = patients[patients.length - 1];
      highlights.recentAddition = {
        name: lastPatient.displayName || `Patient ${patients.length}`,
        time: "Added recently",
        status: "New",
      };
    }

    return highlights;
  }, [patients, patientData, patientAccessStatus]);

  const patientHighlights = getPatientHighlights;

  // Calculate practice health metrics
  const practiceHealthMetrics = useMemo(() => {
    const totalPatients = patients.length;
    const patientsWithData = Object.values(patientData).filter(
      (patient: PatientData) => patient.entries && patient.entries.length > 0,
    ).length;

    const patientsAccessible = Object.values(patientAccessStatus).filter(
      (status) => status?.isAccessible,
    ).length;

    let overallStatus = "Good";
    if (patientsAccessible === 0 && totalPatients > 0)
      overallStatus = "Setup needed";
    else if (patientsAccessible < totalPatients)
      overallStatus = "Needs attention";
    else if (patientsWithData < totalPatients)
      overallStatus = "Data incomplete";

    return {
      patientsWithData,
      totalPatients,
      patientsAccessible,
      overallStatus,
    };
  }, [patients, patientData, patientAccessStatus]);

  const handlePatientPress = (patientId?: string) => {
    if (patientId) {
      const patient = patients.find((p) => p.uid === patientId);
      if (patient) {
        navigation.navigate("DoctorPatientDetail", { patient });
      }
    }
  };

  const handleActivityPress = (activity: Activity) => {
    if (activity.type === "patient") {
      handlePatientPress(activity.patientId);
    }
  };

  // Check if any patient data is still loading
  const isAnyPatientLoading = Object.values(patientData).some(
    (patient: PatientData) => patient.loading,
  );

  if (loadingPatients || dashboardLoading || isAnyPatientLoading) {
    return (
      <View style={VintageStyles.container}>
        <StatusBar style="auto" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={VintageColors.primaryText} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
          {isAnyPatientLoading && (
            <Text style={styles.loadingSubtext}>
              Fetching patient data from Nightscout
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={VintageStyles.container}>
      <StatusBar style="auto" />

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
              <Text style={VintageStyles.headerTitle}>Doctor Dashboard</Text>
              <View style={VintageStyles.headerLine} />
            </View>
          </View>

          <Text style={styles.welcomeText}>Welcome back, Doctor</Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>

          {/* Practice Status Badge */}
          <View style={styles.practiceStatus}>
            <Feather
              name={patients.length > 0 ? "check-circle" : "info"}
              size={14}
              color={
                patients.length > 0
                  ? VintageColors.iconGreen
                  : VintageColors.iconBlue
              }
            />
            <Text style={styles.practiceStatusText}>
              {patients.length === 0
                ? "Ready for first patient"
                : `${patients.length} patient${patients.length !== 1 ? "s" : ""} in care`}
            </Text>
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statIconRow}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: `${stat.color}20` },
                  ]}
                >
                  <Feather
                    name={stat.icon as any}
                    size={20}
                    color={stat.color}
                  />
                </View>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statSubtext}>{stat.subtext}</Text>
            </View>
          ))}
        </View>

        {/* Practice Health Summary */}
        {patients.length > 0 && (
          <View style={styles.healthSummary}>
            <View style={styles.healthSummaryHeader}>
              <Feather name="heart" size={18} color={VintageColors.iconGreen} />
              <Text style={styles.healthSummaryTitle}>Practice Health</Text>
            </View>
            <View style={styles.healthSummaryContent}>
              <View style={styles.healthMetric}>
                <Text style={styles.healthMetricValue}>
                  {practiceHealthMetrics.patientsWithData}/
                  {practiceHealthMetrics.totalPatients}
                </Text>
                <Text style={styles.healthMetricLabel}>Patients with data</Text>
              </View>
              <View style={styles.healthDivider} />
              <View style={styles.healthMetric}>
                <Text style={styles.healthMetricValue}>
                  {practiceHealthMetrics.patientsAccessible}
                </Text>
                <Text style={styles.healthMetricLabel}>Accessible</Text>
              </View>
              <View style={styles.healthDivider} />
              <View style={styles.healthMetric}>
                <Text style={styles.healthMetricValue}>
                  {practiceHealthMetrics.overallStatus}
                </Text>
                <Text style={styles.healthMetricLabel}>Overall status</Text>
              </View>
            </View>
          </View>
        )}

        {/* Recent Activities */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate("DoctorPatients")}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Feather
              name="chevron-right"
              size={12}
              color={VintageColors.primaryText}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.activitiesCard}>
          {recentActivities.length === 0 ? (
            <View style={styles.noActivities}>
              <Feather
                name="activity"
                size={32}
                color={VintageColors.secondaryText}
              />
              <Text style={styles.noActivitiesText}>No recent activities</Text>
              <Text style={styles.noActivitiesSubtext}>
                Activities will appear as you interact with patients
              </Text>
            </View>
          ) : (
            recentActivities.map((activity, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.activityItem,
                  index < recentActivities.length - 1 &&
                    styles.activityItemBorder,
                ]}
                onPress={() => handleActivityPress(activity)}
                activeOpacity={activity.type === "patient" ? 0.85 : 1}
              >
                <View
                  style={[
                    styles.activityIconContainer,
                    {
                      backgroundColor: `${activity.color}20`,
                      borderColor: activity.color,
                    },
                  ]}
                >
                  <Feather
                    name={activity.icon as any}
                    size={18}
                    color={activity.color}
                  />
                </View>

                <View style={styles.activityContent}>
                  {activity.type === "patient" ? (
                    <>
                      <Text style={styles.activityText}>
                        <Text style={styles.patientName}>
                          {activity.patient}
                        </Text>{" "}
                        {activity.action}
                      </Text>
                      <Text style={styles.activityTime}>{activity.time}</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.activityText}>
                        {activity.message}
                      </Text>
                      <Text style={styles.activityTime}>{activity.time}</Text>
                    </>
                  )}
                </View>

                {activity.type === "patient" && (
                  <TouchableOpacity style={styles.activityAction}>
                    <Feather
                      name="chevron-right"
                      size={18}
                      color={VintageColors.secondaryText}
                    />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Patient Highlights */}
        {patients.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Patient Highlights</Text>
              <View style={styles.featherAccent}>
                <Feather
                  name="star"
                  size={16}
                  color={VintageColors.primaryText}
                />
              </View>
            </View>

            <View style={styles.highlightsCard}>
              {patientHighlights.bestControlled && (
                <TouchableOpacity
                  style={styles.highlightItem}
                  onPress={() => {
                    const patient = patients.find(
                      (p) =>
                        p.displayName ===
                          patientHighlights.bestControlled.name ||
                        p.displayName?.includes(
                          patientHighlights.bestControlled.name,
                        ),
                    );
                    if (patient) handlePatientPress(patient.uid);
                  }}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.highlightIcon,
                      { backgroundColor: `${VintageColors.iconYellow}20` },
                    ]}
                  >
                    <Ionicons
                      name="trophy"
                      size={20}
                      color={VintageColors.iconYellow}
                    />
                  </View>
                  <View style={styles.highlightContent}>
                    <Text style={styles.highlightTitle}>Best Controlled</Text>
                    <Text style={styles.highlightValue}>
                      {patientHighlights.bestControlled.name} •{" "}
                      {patientHighlights.bestControlled.metric}
                    </Text>
                  </View>
                  <Feather
                    name="chevron-right"
                    size={16}
                    color={VintageColors.secondaryText}
                  />
                </TouchableOpacity>
              )}

              {patientHighlights.needsAttention && (
                <>
                  {patientHighlights.bestControlled && (
                    <View style={styles.highlightDivider} />
                  )}
                  <TouchableOpacity
                    style={styles.highlightItem}
                    onPress={() => {
                      const patient = patients.find(
                        (p) =>
                          p.displayName ===
                            patientHighlights.needsAttention.name ||
                          p.displayName?.includes(
                            patientHighlights.needsAttention.name,
                          ),
                      );
                      if (patient) handlePatientPress(patient.uid);
                    }}
                    activeOpacity={0.85}
                  >
                    <View
                      style={[
                        styles.highlightIcon,
                        { backgroundColor: `${VintageColors.iconOrange}20` },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="progress-alert"
                        size={20}
                        color={VintageColors.iconOrange}
                      />
                    </View>
                    <View style={styles.highlightContent}>
                      <Text style={styles.highlightTitle}>Needs Attention</Text>
                      <Text style={styles.highlightValue}>
                        {patientHighlights.needsAttention.name} •{" "}
                        {patientHighlights.needsAttention.reason}
                      </Text>
                    </View>
                    <Feather
                      name="chevron-right"
                      size={16}
                      color={VintageColors.secondaryText}
                    />
                  </TouchableOpacity>
                </>
              )}

              {patientHighlights.recentAddition && (
                <>
                  {(patientHighlights.bestControlled ||
                    patientHighlights.needsAttention) && (
                    <View style={styles.highlightDivider} />
                  )}
                  <TouchableOpacity
                    style={styles.highlightItem}
                    onPress={() =>
                      handlePatientPress(patients[patients.length - 1]?.uid)
                    }
                    activeOpacity={0.85}
                  >
                    <View
                      style={[
                        styles.highlightIcon,
                        { backgroundColor: `${VintageColors.iconBlue}20` },
                      ]}
                    >
                      <Feather
                        name="user-plus"
                        size={20}
                        color={VintageColors.iconBlue}
                      />
                    </View>
                    <View style={styles.highlightContent}>
                      <Text style={styles.highlightTitle}>Recent Addition</Text>
                      <Text style={styles.highlightValue}>
                        {patientHighlights.recentAddition.name} •{" "}
                        {patientHighlights.recentAddition.time}
                      </Text>
                    </View>
                    <Feather
                      name="chevron-right"
                      size={16}
                      color={VintageColors.secondaryText}
                    />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </>
        )}

        {/* Quick Navigation */}
        <View style={styles.navigationSection}>
          <Text style={styles.navigationTitle}>Quick Navigation</Text>
          <View style={styles.navigationGrid}>
            <TouchableOpacity
              style={styles.navigationCard}
              onPress={() => navigation.navigate("DoctorAnalytics")}
            >
              <View style={styles.navigationIcon}>
                <Feather
                  name="bar-chart-2"
                  size={24}
                  color={VintageColors.primaryText}
                />
              </View>
              <Text style={styles.navigationText}>Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navigationCard}
              onPress={() => navigation.navigate("DoctorPatients")}
            >
              <View style={styles.navigationIcon}>
                <Feather
                  name="users"
                  size={24}
                  color={VintageColors.primaryText}
                />
              </View>
              <Text style={styles.navigationText}>Patients</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navigationCard}
              onPress={() => navigation.navigate("Settings")}
            >
              <View style={styles.navigationIcon}>
                <Feather
                  name="settings"
                  size={24}
                  color={VintageColors.primaryText}
                />
              </View>
              <Text style={styles.navigationText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={VintageStyles.spacing60} />
      </ScrollView>
    </View>
  );
};

// Add new styles
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: VintageColors.primaryText,
    fontStyle: "italic",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 12,
    color: VintageColors.secondaryText,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "600",
    color: VintageColors.primaryText,
    textAlign: "center",
    marginTop: 8,
    letterSpacing: 0.3,
  },
  dateText: {
    fontSize: 14,
    color: VintageColors.secondaryText,
    textAlign: "center",
    marginTop: 4,
    fontStyle: "italic",
  },
  practiceStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
    alignSelf: "center",
  },
  practiceStatusText: {
    fontSize: 12,
    fontWeight: "500",
    color: VintageColors.primaryText,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 48) / 2 - 6,
    backgroundColor: VintageColors.cardBackground,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  statIconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 4,
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    fontWeight: "500",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 10,
    color: VintageColors.secondaryText,
    fontStyle: "italic",
  },

  healthSummary: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: VintageColors.border,
    padding: 16,
  },
  healthSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  healthSummaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: VintageColors.primaryText,
  },
  healthSummaryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  healthMetric: {
    flex: 1,
    alignItems: "center",
  },
  healthMetricValue: {
    fontSize: 20,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 4,
  },
  healthMetricLabel: {
    fontSize: 11,
    color: VintageColors.secondaryText,
    textAlign: "center",
  },
  healthDivider: {
    width: 1,
    height: 32,
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

  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: VintageColors.lightBackground,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  viewAllText: {
    fontSize: 11,
    color: VintageColors.primaryText,
    fontWeight: "500",
  },

  activitiesCard: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: VintageColors.border,
    minHeight: 200,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: VintageColors.border,
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 13,
    color: VintageColors.primaryText,
    lineHeight: 18,
    marginBottom: 4,
  },
  patientName: {
    fontWeight: "600",
  },
  activityTime: {
    fontSize: 11,
    color: VintageColors.secondaryText,
  },
  activityAction: {
    padding: 4,
  },
  noActivities: {
    padding: 40,
    alignItems: "center",
  },
  noActivitiesText: {
    fontSize: 16,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginTop: 16,
    marginBottom: 8,
  },
  noActivitiesSubtext: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    textAlign: "center",
    lineHeight: 16,
  },

  highlightsCard: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: VintageColors.border,
    marginBottom: 24,
  },
  highlightItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  highlightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  highlightContent: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 4,
  },
  highlightValue: {
    fontSize: 12,
    color: VintageColors.secondaryText,
  },
  highlightDivider: {
    height: 1,
    backgroundColor: VintageColors.border,
    marginVertical: 8,
  },

  navigationSection: {
    marginBottom: 24,
  },
  navigationTitle: {
    fontSize: 18,
    color: VintageColors.primaryText,
    fontWeight: "500",
    letterSpacing: 0.3,
    marginBottom: 16,
  },
  navigationGrid: {
    flexDirection: "row",
    gap: 12,
  },
  navigationCard: {
    flex: 1,
    backgroundColor: VintageColors.cardBackground,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: VintageColors.border,
    alignItems: "center",
  },
  navigationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  navigationText: {
    fontSize: 14,
    fontWeight: "600",
    color: VintageColors.primaryText,
    textAlign: "center",
  },
});

export default DoctorDashboardScreen;
