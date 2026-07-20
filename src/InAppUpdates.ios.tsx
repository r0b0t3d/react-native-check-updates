import { Linking } from 'react-native';
import type { UpdateMode, UpdateInfo } from './specs/InappUpdates.nitro';

let appStoreInfo: UpdateInfo | null = null;

export async function checkForUpdate(options?: {
  bundleId?: string;
  version?: string;
}): Promise<UpdateInfo | null> {
  if (!options?.bundleId || !options.version) {
    throw new Error('bundleId and version are required');
  }
  appStoreInfo = await getAppStoreInfo(options.bundleId);
  if (
    !appStoreInfo ||
    !compareVersions(options.version, appStoreInfo.version)
  ) {
    return null;
  }
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

async function getAppStoreInfo(bundleId: string): Promise<UpdateInfo | null> {
  const url = `https://itunes.apple.com/lookup?bundleId=${bundleId}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.resultCount > 0) {
    const appInfo = data.results[0];
    return {
      version: appInfo.version,
      releaseNotes: appInfo.releaseNotes, // 👈 "What's New" text
      appUrl: appInfo.trackViewUrl, // App Store URL
    };
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
