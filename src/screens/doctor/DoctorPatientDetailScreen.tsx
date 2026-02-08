import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";

import { VintageStyles } from "../../themes/vintage/styles_vintage";
import { VintageColors } from "../../themes/vintage/colors";
import { StorageService } from "../../services/localStorageService";
import { useNightscoutData } from "../../hooks/useNightscoutData";

import * as sha1 from "js-sha1";

type PatientParam = {
  uid: string;
  displayName?: string;
  nightscoutUrl: string;
};

const DoctorPatientDetailScreen = () => {
  const route = useRoute<any>();
  const patient = route.params?.patient as PatientParam | undefined;
  const navigation = useNavigation<any>();

  if (!patient?.uid || !patient?.nightscoutUrl) {
    return (
      <View style={VintageStyles.container}>
        <ScrollView
          contentContainerStyle={[
            VintageStyles.scrollContent,
            { paddingTop: 40 },
          ]}
        >
          <View style={styles.errorCard}>
            <Feather
              name="alert-circle"
              size={32}
              color={VintageColors.secondaryText}
            />
            <Text style={styles.errorTitle}>Missing patient data</Text>
            <Text style={styles.errorText}>
              This screen needs navigation params.
            </Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Feather
                name="arrow-left"
                size={16}
                color={VintageColors.primaryText}
              />
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  const [secret, setSecret] = useState<string>(""); // store RAW by default
  const [secretLoaded, setSecretLoaded] = useState(false);

  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretDraft, setSecretDraft] = useState("");
  const [savingSecret, setSavingSecret] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setSecretLoaded(false);
        const saved = await StorageService.getPatientSecret(patient.uid);
        if (!mounted) return;

        setSecret(saved?.trim() ? saved : "");
        setShowSecretModal(false);
      } catch (e) {
        console.error("Failed to load patient secret:", e);
        if (!mounted) return;
        setSecret("");
        setShowSecretModal(false);
      } finally {
        if (mounted) setSecretLoaded(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [patient.uid]);

  const ns = useNightscoutData(patient.nightscoutUrl, secret);
  const authRequired = ns.error === "AUTH_REQUIRED";

  useEffect(() => {
    if (!secretLoaded) return;
    ns.reset();
    ns.loadFullDay();
  }, [patient.uid, secretLoaded, secret]);

  useEffect(() => {
    if (authRequired) setShowSecretModal(true);
  }, [authRequired]);

  const onSaveSecret = async () => {
    try {
      setSavingSecret(true);
      const raw = (secretDraft ?? "").trim();

      const valueToStore = raw ? sha1.sha1(raw) : "";

      await StorageService.setPatientSecret(patient.uid, valueToStore);
      setSecret(valueToStore);
      setSecretDraft("");
      setShowSecretModal(false);
    } catch (e) {
      console.error("Saving secret failed:", e);
    } finally {
      setSavingSecret(false);
    }
  };

  const latest = useMemo(() => {
    const arr: any[] = ns.entries ?? [];
    if (!arr.length) return null;
    return arr.reduce(
      (best, cur) =>
        Number(cur?.date ?? 0) > Number(best?.date ?? 0) ? cur : best,
      arr[0],
    );
  }, [ns.entries]);

  const totalTreatments =
    (ns.meals?.length ?? 0) +
    (ns.activities?.length ?? 0) +
    (ns.otherEntries?.length ?? 0);

  const getInitials = (name: string) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "PT";

  const getGlucoseStatus = (sgv: number) => {
    if (sgv < 70) return "Low";
    if (sgv > 180) return "High";
    return "In Range";
  };

  const getGlucoseColor = (sgv: number) => {
    if (sgv < 70) return VintageColors.iconRed;
    if (sgv > 180) return VintageColors.iconOrange;
    return VintageColors.iconGreen;
  };

  return (
    <View style={VintageStyles.container}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={VintageStyles.scrollContent}
      >
        {/* Header with Back Button */}
        <View style={[VintageStyles.headerSection, { marginBottom: 8 }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.75}
              style={styles.backArrow}
            >
              <Feather
                name="chevron-left"
                size={20}
                color={VintageColors.primaryText}
              />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <View style={VintageStyles.headerDecoration}>
                <View style={VintageStyles.headerLine} />
                <Text style={VintageStyles.headerTitle}>Patient Details</Text>
                <View style={VintageStyles.headerLine} />
              </View>
            </View>
          </View>
        </View>

        {/* Patient Info Card */}
        <View style={styles.heroCard}>
          <View style={styles.iconBox}>
            <Text style={styles.patientInitials}>
              {getInitials(patient.displayName || "Patient")}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>
              {patient.displayName ?? "Patient"}
            </Text>
            <View style={styles.urlRow}>
              <Feather
                name="link"
                size={12}
                color={VintageColors.secondaryText}
              />
              <Text style={styles.heroSub} numberOfLines={1}>
                {patient.nightscoutUrl}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.secretPill}
            onPress={() => setShowSecretModal(true)}
            activeOpacity={0.85}
          >
            <Feather
              name={secret?.trim() ? "lock" : authRequired ? "unlock" : "globe"}
              size={14}
              color={VintageColors.primaryText}
            />
            <Text style={styles.secretPillText}>
              {secret?.trim()
                ? "secret set"
                : authRequired
                  ? "needs secret"
                  : "public"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status Section */}
        {ns.isLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={VintageColors.primaryText} />
            <Text style={styles.loadingText}>Loading…</Text>
          </View>
        ) : authRequired ? (
          <View style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <Feather name="lock" size={20} color={VintageColors.iconOrange} />
              <Text style={styles.warningTitle}>Private Nightscout</Text>
            </View>
            <Text style={styles.warningText}>
              This Nightscout requires an API secret to access
              entries/treatments.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setShowSecretModal(true)}
              activeOpacity={0.85}
            >
              <Feather name="key" size={14} color={VintageColors.primaryText} />
              <Text style={styles.primaryButtonText}>Enter secret</Text>
            </TouchableOpacity>
          </View>
        ) : ns.error ? (
          <View style={styles.errorCard}>
            <View style={styles.errorHeader}>
              <Feather
                name="wifi-off"
                size={20}
                color={VintageColors.iconRed}
              />
              <Text style={styles.errorTitle}>Couldn't load Nightscout</Text>
            </View>
            <Text style={styles.errorText}>{ns.error}</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => ns.loadFullDay()}
              >
                <Feather
                  name="refresh-cw"
                  size={14}
                  color={VintageColors.primaryText}
                />
                <Text style={styles.secondaryButtonText}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setShowSecretModal(true)}
              >
                <Feather
                  name="edit"
                  size={14}
                  color={VintageColors.primaryText}
                />
                <Text style={styles.secondaryButtonText}>Update secret</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* Glucose Card */}
            <View style={styles.glucoseCard}>
              <Text style={styles.cardTitle}>Current glucose</Text>
              <View style={styles.glucoseRow}>
                <Text style={styles.glucoseValue}>
                  {latest?.sgv != null ? latest.sgv : "—"}
                </Text>
                <Text style={styles.glucoseUnit}>mg/dL</Text>
              </View>

              {latest?.sgv != null && (
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getGlucoseColor(latest.sgv) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getGlucoseStatus(latest.sgv)}
                    </Text>
                  </View>

                  {latest?.direction && (
                    <View style={styles.trendContainer}>
                      <Feather
                        name={
                          latest.direction === "DoubleUp"
                            ? "arrow-up"
                            : latest.direction === "SingleUp"
                              ? "arrow-up"
                              : latest.direction === "FortyFiveUp"
                                ? "arrow-up-right"
                                : latest.direction === "Flat"
                                  ? "minus"
                                  : latest.direction === "FortyFiveDown"
                                    ? "arrow-down-right"
                                    : latest.direction === "SingleDown"
                                      ? "arrow-down"
                                      : "arrow-down"
                        }
                        size={16}
                        color={VintageColors.primaryText}
                      />
                      <Text style={styles.trendText}>
                        {latest.direction.replace(/([A-Z])/g, " $1").trim()}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {latest?.date && (
                <Text style={styles.glucoseTime}>
                  {new Date(Number(latest.date)).toLocaleString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              )}
            </View>

            {/* Data Summary */}
            <View style={styles.dataCard}>
              <Text style={styles.cardTitle}>Data summary</Text>
              <View style={styles.dataGrid}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataValue}>{ns.entries.length}</Text>
                  <Text style={styles.dataLabel}>Readings</Text>
                </View>
                <View style={styles.dataDivider} />
                <View style={styles.dataItem}>
                  <Text style={styles.dataValue}>{totalTreatments}</Text>
                  <Text style={styles.dataLabel}>Treatments</Text>
                </View>
                <View style={styles.dataDivider} />
                <View style={styles.dataItem}>
                  <Text style={styles.dataValue}>{ns.meals?.length || 0}</Text>
                  <Text style={styles.dataLabel}>Meals</Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsCard}>
              <Text style={styles.cardTitle}>Actions</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setShowSecretModal(true)}
                >
                  <View style={styles.actionIcon}>
                    <Feather
                      name="key"
                      size={20}
                      color={VintageColors.primaryText}
                    />
                  </View>
                  <Text style={styles.actionButtonText}>Change secret</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => ns.loadFullDay()}
                >
                  <View style={styles.actionIcon}>
                    <Feather
                      name="refresh-cw"
                      size={20}
                      color={VintageColors.primaryText}
                    />
                  </View>
                  <Text style={styles.actionButtonText}>Refresh data</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        <View style={VintageStyles.spacing60} />
      </ScrollView>

      {/* Secret Modal */}
      <Modal
        visible={showSecretModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSecretModal(false)}
      >
        <View style={VintageStyles.modalOverlay}>
          <View style={VintageStyles.modalContentCenter}>
            <View style={VintageStyles.modalProfileSection}>
              <View style={VintageStyles.modalIconCircle}>
                <View style={VintageStyles.modalIconContainer}>
                  <Feather
                    name="lock"
                    size={26}
                    color={VintageColors.primaryText}
                  />
                </View>
              </View>

              <Text style={VintageStyles.modalProfileTitle}>
                Nightscout Secret
              </Text>

              <Text style={styles.modalSub}>
                Enter the secret for{" "}
                <Text style={styles.modalBold}>
                  {patient.displayName ?? "this patient"}
                </Text>
                .{"\n"}It will be saved only on this device.
              </Text>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingBottom: 20,
              }}
            >
              <View style={styles.formGroup}>
                <Text style={styles.label}>API Secret</Text>
                <TextInput
                  value={secretDraft}
                  onChangeText={setSecretDraft}
                  placeholder="paste api-secret here"
                  placeholderTextColor={VintageColors.secondaryText}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  style={styles.input}
                />
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnGhost]}
                  activeOpacity={0.85}
                  onPress={() => setShowSecretModal(false)}
                >
                  <Text style={styles.btnGhostText}>Not now</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary]}
                  activeOpacity={0.85}
                  onPress={onSaveSecret}
                  disabled={savingSecret}
                >
                  {savingSecret ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.btnPrimaryText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.modalHint}>
                If the Nightscout is public, you can keep this empty. If it’s
                private, you’ll get prompted after an auth error.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: { height: 44, justifyContent: "center" },
  headerCenter: { alignItems: "center" },

  backArrow: {
    position: "absolute",
    left: 0,
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: VintageColors.lightBackground,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  heroCard: {
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
  heroTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 6,
  },
  urlRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroSub: { fontSize: 12, color: VintageColors.secondaryText, flex: 1 },

  secretPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: VintageColors.lightBackground,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  secretPillText: {
    fontSize: 11,
    color: VintageColors.primaryText,
    fontWeight: "600",
  },

  warningCard: {
    backgroundColor: VintageColors.cardBackground,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: VintageColors.primaryText,
  },
  warningText: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    lineHeight: 16,
    marginBottom: 12,
  },

  loadingCard: {
    backgroundColor: VintageColors.cardBackground,
    padding: 32,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginTop: 16,
  },

  errorCard: {
    backgroundColor: VintageColors.cardBackground,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  errorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: VintageColors.primaryText,
  },
  errorText: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    lineHeight: 16,
    marginBottom: 12,
  },

  actionRow: { flexDirection: "row", gap: 12 },

  glucoseCard: {
    backgroundColor: VintageColors.cardBackground,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 12,
  },
  glucoseRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  glucoseValue: {
    fontSize: 36,
    fontWeight: "600",
    color: VintageColors.primaryText,
  },
  glucoseUnit: {
    fontSize: 16,
    color: VintageColors.secondaryText,
    marginLeft: 8,
    fontWeight: "500",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  trendContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  trendText: { fontSize: 13, color: VintageColors.secondaryText },

  glucoseTime: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: VintageColors.border,
  },

  dataCard: {
    backgroundColor: VintageColors.cardBackground,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  dataGrid: { flexDirection: "row", alignItems: "center" },
  dataItem: { flex: 1, alignItems: "center" },
  dataValue: {
    fontSize: 24,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 4,
  },
  dataLabel: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  dataDivider: { width: 1, height: 24, backgroundColor: VintageColors.border },

  actionsCard: {
    backgroundColor: VintageColors.cardBackground,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  actionButtons: { flexDirection: "row", gap: 12 },
  actionButton: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: VintageColors.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: VintageColors.primaryText,
  },

  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
    backgroundColor: VintageColors.lightBackground,
  },
  primaryButtonText: {
    fontSize: 12,
    color: VintageColors.primaryText,
    fontWeight: "600",
  },

  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
    backgroundColor: VintageColors.lightBackground,
    flex: 1,
  },
  secondaryButtonText: {
    fontSize: 12,
    color: VintageColors.primaryText,
    fontWeight: "600",
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
    backgroundColor: VintageColors.lightBackground,
    marginTop: 12,
  },
  backButtonText: {
    fontSize: 12,
    color: VintageColors.primaryText,
    fontWeight: "600",
  },

  formGroup: { marginBottom: 16 },
  label: {
    fontSize: 14,
    color: VintageColors.primaryText,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: VintageColors.cardBackground,
    borderWidth: 1,
    borderColor: VintageColors.border,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: VintageColors.primaryText,
  },
  modalSub: {
    marginTop: 10,
    fontSize: 12,
    color: VintageColors.secondaryText,
    lineHeight: 16,
    textAlign: "center",
  },
  modalBold: { color: VintageColors.primaryText, fontWeight: "700" },
  modalHint: {
    marginTop: 12,
    fontSize: 11,
    color: VintageColors.secondaryText,
    lineHeight: 15,
    textAlign: "center",
  },

  btnRow: { flexDirection: "row", marginTop: 16, gap: 10 },
  btn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  btnGhost: {
    backgroundColor: VintageColors.cardBackground,
    borderColor: VintageColors.border,
  },
  btnPrimary: {
    backgroundColor: VintageColors.signOutButton,
    borderColor: VintageColors.iconPink,
  },
  btnGhostText: {
    color: VintageColors.primaryText,
    fontSize: 14,
    fontWeight: "600",
  },
  btnPrimaryText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});

export default DoctorPatientDetailScreen;
