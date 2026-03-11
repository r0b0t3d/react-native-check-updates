import { NitroModules } from 'react-native-nitro-modules';
import type { InappUpdates, UpdateMode } from './specs/InappUpdates.nitro';
import type { UpdateInfo } from './specs/InappUpdates.nitro';

export type { UpdateInfo };

const InappUpdatesHybridObject =
  NitroModules.createHybridObject<InappUpdates>('InappUpdates');

export async function checkForUpdate(_options: {
  bundleId?: string;
}): Promise<UpdateInfo | null> {
  const result = await InappUpdatesHybridObject.checkForUpdate();
  if (result.available) {
    return result.info || null;
  }
  return null;
}

export function startUpdate(options?: {
  // Android only
  mode?: UpdateMode;
}): Promise<boolean> {
  return InappUpdatesHybridObject.startUpdate(options?.mode || 'immediate');
}

export function completeUpdate(): Promise<boolean> {
  return InappUpdatesHybridObject.completeUpdate();
}

export function onProgress(progress: (percent: number) => void): void {
  InappUpdatesHybridObject.onProgress?.(progress);
}
