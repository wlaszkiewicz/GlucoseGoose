import { StorageService } from "./localStorageService";

const DEVICE_ID_KEY = "deviceId" as const;

function randomId(): string {
  // good enough
  return `${Date.now()}_${Math.random().toString(16).slice(2)}_${Math.random().toString(16).slice(2)}`;
}

export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await StorageService.get(DEVICE_ID_KEY as any);
  if (existing) return existing;

  const id = randomId();
  await StorageService.set(DEVICE_ID_KEY as any, id, true);
  return id;
}
