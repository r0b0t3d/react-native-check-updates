import type { HybridObject } from 'react-native-nitro-modules';

export type UpdateMode = 'immediate' | 'flexible';

export interface InappUpdates
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  /**
   * Check if an update is available (Android only).
   * On iOS you should fetch from iTunes API manually.
   */
  checkForUpdate(): Promise<UpdateResult>;

  /**
   * Start an in-app update (Android only).
   */
  startUpdate(mode: UpdateMode): Promise<boolean>;

  /**
   * Complete a flexible update after download (Android only).
   */
  completeUpdate(): Promise<boolean>;

  /**
   * Listen to flexible update progress (0-100).
   */
  onProgress?(progress: (percent: number) => void): void;
}

export interface UpdateInfo {
  versionCode?: number;
  availableVersionCode?: number;
  updatePriority?: number;

  version?: string;
  releaseNotes?: string;
  appUrl?: string;
}

export interface UpdateResult {
  available: boolean;
  info?: UpdateInfo;
}
