import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";

import { VintageStyles } from "../../themes/vintage/styles_vintage";
import { VintageColors } from "../../themes/vintage/colors";
import { StorageService } from "../../services/localStorageService";
import { useNightscoutData } from "../../hooks/useNightscoutData";
import { useNavigation } from "@react-navigation/native";
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
        <StatusBar style="auto" />
        <ScrollView
          contentContainerStyle={[
            VintageStyles.scrollContent,
            { paddingTop: 40 },
          ]}
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Missing patient data</Text>
            <Text style={styles.cardSub}>
              This screen needs navigation params:{"\n"}
              <Text style={styles.metaLabel}>patient.uid</Text> and{" "}
              <Text style={styles.metaLabel}>patient.nightscoutUrl</Text>.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  const [secret, setSecret] = useState<string>("");
  const [secretLoaded, setSecretLoaded] = useState(false);

  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretDraft, setSecretDraft] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setSecretLoaded(false);

        const saved = await StorageService.getPatientSecret(patient.uid);
        if (!mounted) return;

        if (saved && saved.trim()) {
          setSecret(saved);
          setShowSecretModal(false);
        } else {
          setSecret("");
          setShowSecretModal(true);
        }
      } catch (e) {
        console.error("Failed to load patient secret:", e);
        setSecret("");
        setShowSecretModal(true);
      } finally {
        if (mounted) setSecretLoaded(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [patient.uid]);

  const ns = useNightscoutData(patient.nightscoutUrl, secret);

  useEffect(() => {
    if (!secretLoaded) return;
    if (!secret?.trim()) return;

    ns.reset();
    ns.loadFullDay();
  }, [patient.uid, secretLoaded, secret]);

  const onSaveSecret = async () => {
    try {
      const raw = (secretDraft ?? "").trim();
      if (!raw) return;

      const hashed = sha1.sha1(raw);

      await StorageService.setPatientSecret(patient.uid, hashed);

      setSecret(hashed);
      setSecretDraft("");
      setShowSecretModal(false);

      console.log("Saved hashed secret length:", hashed.length);
    } catch (e) {
      console.error("Saving secret failed:", e);
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

  return (
    <View style={VintageStyles.container}>
      <StatusBar style="auto" />

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
              <Text style={styles.label}>API Secret</Text>

              <TextInput
                value={secretDraft}
                onChangeText={(t) => setSecretDraft(t)}
                placeholder="paste api-secret here"
                placeholderTextColor={VintageColors.secondaryText}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                style={styles.input}
              />

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
                >
                  <Text style={styles.btnPrimaryText}>Save</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalHint}>
                Tip: if this patient’s Nightscout is public, you can keep it
                empty — but in your case you need a secret.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={VintageStyles.scrollContent}
      >
        <View style={[VintageStyles.headerSection, { marginBottom: 8 }]}>
          <View style={styles.headerRow}>
            {/* Back arrow (absolute, does NOT affect centering) */}
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

            {/* Centered header */}
            <View style={styles.headerCenter}>
              <View style={VintageStyles.headerDecoration}>
                <View style={VintageStyles.headerLine} />
                <Text style={VintageStyles.headerTitle}>Patient Details</Text>
                <View style={VintageStyles.headerLine} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.iconBox}>
            <Feather name="user" size={18} color={VintageColors.primaryText} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>
              {patient.displayName ?? "Patient"}
            </Text>
            <Text style={styles.heroSub} numberOfLines={1}>
              <Text style={styles.metaLabel}>URL: </Text>
              {patient.nightscoutUrl}
            </Text>
          </View>

          <View style={styles.secretPill}>
            <Feather
              name={secret?.trim() ? "check" : "alert-circle"}
              size={14}
              color={VintageColors.primaryText}
            />
            <Text style={styles.secretPillText}>
              {secret?.trim() ? "secret set" : "needs secret"}
            </Text>
          </View>
        </View>

        {!secret?.trim() ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Secret required</Text>
            <Text style={styles.cardSub}>
              To fetch glucose & insulin for this patient, enter their API
              secret.
            </Text>

            <TouchableOpacity
              style={[styles.smallBtn, { marginTop: 12 }]}
              onPress={() => setShowSecretModal(true)}
              activeOpacity={0.85}
            >
              <Feather name="key" size={14} color={VintageColors.primaryText} />
              <Text style={styles.smallBtnText}>Enter secret</Text>
            </TouchableOpacity>
          </View>
        ) : ns.isLoading ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Loading…</Text>
            <Text style={styles.cardSub}>Fetching glucose & insulin</Text>
          </View>
        ) : ns.error ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Couldn’t load Nightscout</Text>
            <Text style={styles.cardSub}>{ns.error}</Text>

            <TouchableOpacity
              style={[styles.smallBtn, { marginTop: 12 }]}
              onPress={() => setShowSecretModal(true)}
              activeOpacity={0.85}
            >
              <Feather name="key" size={14} color={VintageColors.primaryText} />
              <Text style={styles.smallBtnText}>Update secret</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Latest glucose</Text>
            <Text style={styles.big}>
              {latest?.sgv != null ? `${latest.sgv} mg/dL` : "—"}
            </Text>
            <Text style={styles.cardSub}>
              {latest?.date
                ? new Date(Number(latest.date)).toLocaleString()
                : "No recent entry"}
            </Text>

            <View style={{ height: 10 }} />

            <Text style={styles.cardSub}>
              Entries loaded:{" "}
              <Text style={styles.metaLabel}>{ns.entries.length}</Text>
            </Text>
            <Text style={styles.cardSub}>
              Treatments loaded:{" "}
              <Text style={styles.metaLabel}>{totalTreatments}</Text>
            </Text>

            <TouchableOpacity
              style={[styles.smallBtn, { marginTop: 12 }]}
              onPress={() => setShowSecretModal(true)}
              activeOpacity={0.85}
            >
              <Feather name="key" size={14} color={VintageColors.primaryText} />
              <Text style={styles.smallBtnText}>Change secret</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    height: 44,
    justifyContent: "center",
  },

  headerCenter: {
    alignItems: "center",
  },

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
  heroTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 12,
    color: VintageColors.secondaryText,
  },
  metaLabel: {
    color: VintageColors.primaryText,
    fontWeight: "600",
  },
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

  card: {
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
    marginBottom: 6,
  },
  cardSub: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    lineHeight: 16,
  },
  big: {
    fontSize: 24,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginTop: 6,
    marginBottom: 4,
  },

  smallBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
    backgroundColor: VintageColors.lightBackground,
  },
  smallBtnText: {
    fontSize: 12,
    color: VintageColors.primaryText,
    fontWeight: "600",
  },

  modalSub: {
    marginTop: 10,
    fontSize: 12,
    color: VintageColors.secondaryText,
    lineHeight: 16,
    textAlign: "center",
  },
  modalBold: {
    color: VintageColors.primaryText,
    fontWeight: "700",
  },
  modalHint: {
    marginTop: 12,
    fontSize: 11,
    color: VintageColors.secondaryText,
    lineHeight: 15,
    textAlign: "center",
  },
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
  btnRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 10,
  },
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
  btnPrimaryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: VintageColors.cardBackground,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  backText: {
    fontSize: 13,
    fontWeight: "700",
    color: VintageColors.primaryText,
  },
});

export default DoctorPatientDetailScreen;
