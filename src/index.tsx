import { NitroModules } from 'react-native-nitro-modules';
import type { CheckUpdates } from './CheckUpdates.nitro';

const CheckUpdatesHybridObject =
  NitroModules.createHybridObject<CheckUpdates>('CheckUpdates');

export function multiply(a: number, b: number): number {
  return CheckUpdatesHybridObject.multiply(a, b);
}
