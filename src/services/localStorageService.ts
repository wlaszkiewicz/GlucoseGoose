import * as SecureStore from "expo-secure-store";

export type StorageKey =
  | "nightscoutSecret"
  | "rememberMe"
  | "nightscoutUrl"
  | "geminiAPIKey"
  | `nightscoutSecret_${string}`;
//   | "openAiKey"

const isWeb =
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";
const isElectron = !!(process && process.versions && process.versions.electron);
const isMobile = !isWeb && !isElectron && typeof SecureStore !== "undefined";

export const StorageService = {
  async set(key: StorageKey, value: string, rememberMe: boolean = true) {
    if (isWeb || isElectron) {
      if (rememberMe) {
        window.localStorage.setItem(key, value);
      } else {
        window.sessionStorage.setItem(key, value);
      }
    } else if (isMobile) {
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
    }
  },

  async get(key: StorageKey): Promise<string | null> {
    if (isWeb || isElectron) {
      return (
        window.sessionStorage.getItem(key) ?? window.localStorage.getItem(key)
      );
    } else if (isMobile) {
      return await SecureStore.getItemAsync(key);
    }
    return null;
  },

  async clear(key: StorageKey) {
    if (isWeb || isElectron) {
      window.localStorage.removeItem(key);
    } else if (isMobile) {
      await SecureStore.deleteItemAsync(key);
    }
  },

  async clearAll() {
    if (isWeb || isElectron) {
      Object.keys(localStorage).forEach((k) => localStorage.removeItem(k));
      Object.keys(sessionStorage).forEach((k) => sessionStorage.removeItem(k));
    } else if (isMobile) {
      const keys: StorageKey[] = [
        "nightscoutSecret",
        "rememberMe",
        "nightscoutUrl",
        "geminiAPIKey",
      ];
      await Promise.all(keys.map((k) => SecureStore.deleteItemAsync(k)));
    }
  },
  patientSecretKey(patientUid: string): StorageKey {
    const safeUid = patientUid.replace(/[^a-zA-Z0-9._-]/g, "_");
    return `nightscoutSecret_${safeUid}` as StorageKey;
  },

  async getPatientSecret(patientUid: string) {
    return await this.get(this.patientSecretKey(patientUid));
  },

  async setPatientSecret(patientUid: string, secret: string) {
    return await this.set(this.patientSecretKey(patientUid), secret, true);
  },

  async clearPatientSecret(patientUid: string) {
    return await this.clear(this.patientSecretKey(patientUid));
  },
};
