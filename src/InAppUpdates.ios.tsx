import { Linking, Platform } from 'react-native';
import type { UpdateMode, UpdateInfo } from './specs/InappUpdates.nitro';

let appStoreInfo: UpdateInfo | null = null;

export async function checkForUpdate(options?: {
  bundleId?: string;
  version?: string;
  country?: string;
  minReleaseAgeHours?: number;
}): Promise<UpdateInfo | null> {
  if (!options?.bundleId || !options.version) {
    throw new Error('bundleId and version are required');
  }
  const appInfo = await getAppStoreInfo(options.bundleId, options.country);
  if (!appInfo || !compareVersions(options.version, appInfo.version)) {
    return null;
  }
  // Device can't install the new build, App Store would show "Open"
  if (compareVersions(String(Platform.Version), appInfo.minimumOsVersion)) {
    return null;
  }
  // Lookup API updates before the App Store CDN does, so give it time
  const releasedAt = Date.parse(appInfo.currentVersionReleaseDate);
  const minAgeMs = (options.minReleaseAgeHours ?? 24) * 60 * 60 * 1000;
  if (!Number.isNaN(releasedAt) && Date.now() - releasedAt < minAgeMs) {
    return null;
  }
  appStoreInfo = {
    version: appInfo.version,
    releaseNotes: appInfo.releaseNotes, // 👈 "What's New" text
    appUrl: appInfo.trackViewUrl, // App Store URL
  };
  return appStoreInfo;
}

export function startUpdate(_options?: {
  // Android only
  mode?: UpdateMode;
}): Promise<boolean> {
  if (!appStoreInfo || !appStoreInfo.appUrl) {
    return Promise.resolve(false);
  }
  return Linking.canOpenURL(appStoreInfo.appUrl).then((canOpen) => {
    if (canOpen) {
      Linking.openURL(appStoreInfo!.appUrl!).catch(() => {});
    }
    return true;
  });
}

export function completeUpdate(): Promise<boolean> {
  return Promise.resolve(false);
}

export function onProgress(_progress: (percent: number) => void): void {}

interface AppStoreLookupResult {
  version: string;
  releaseNotes?: string;
  trackViewUrl?: string;
  minimumOsVersion?: string;
  currentVersionReleaseDate: string;
}

async function getAppStoreInfo(
  bundleId: string,
  country?: string
): Promise<AppStoreLookupResult | null> {
  let url = `https://itunes.apple.com/lookup?bundleId=${bundleId}`;
  if (country) {
    url += `&country=${country}`;
  }
  const response = await fetch(url);
  const data = await response.json();

  if (data.resultCount > 0) {
    return data.results[0];
  }
  return null;
}

/**
 * Compare two version strings (major.minor.patch).
 */
function compareVersions(local?: string, remote?: string): boolean {
  if (!local || !remote) {
    return false;
  }
  const parse = (v: string) => v.split('.').map(Number);

  const localParts = parse(local);
  const remoteParts = parse(remote);

  // Normalize lengths (support major.minor vs major.minor.patch)
  const maxLen = Math.max(localParts.length, remoteParts.length);
  while (localParts.length < maxLen) localParts.push(0);
  while (remoteParts.length < maxLen) remoteParts.push(0);

  for (let i = 0; i < maxLen; i++) {
    if (localParts[i]! < remoteParts[i]!) return true;
    if (localParts[i]! > remoteParts[i]!) return false;
  }
  return false;
}
