# react-native-check-updates

React Native library for handling in-app updates on Android (Google Play Store) and version checking on iOS.

## Installation


```sh
npm install react-native-check-updates react-native-nitro-modules

> `react-native-nitro-modules` is required as this library relies on [Nitro Modules](https://nitro.margelo.com/).
```


## Usage


```js
import { checkForUpdate, startUpdate, completeUpdate, onProgress } from 'react-native-check-updates';

// Check for available updates
const updateInfo = await checkForUpdate({ bundleId: 'com.example.app' });

if (updateInfo) {
  console.log('Update available:', updateInfo.version);
  console.log('Release notes:', updateInfo.releaseNotes);
  
  // Start the update process
  const updateStarted = await startUpdate({ mode: 'flexible' });
  
  // Monitor download progress (flexible updates only)
  onProgress((percent) => {
    console.log(`Download progress: ${percent}%`);
  });
  
  // Complete the update after download (flexible updates only)
  if (updateStarted) {
    await completeUpdate();
  }
}
```

## API Reference

### `checkForUpdate(options)`

Checks if an update is available for your app.

**Parameters:**
- `options` (object, optional)
  - `bundleId` (string, optional): The bundle ID to check for updates. If not provided, uses the current app's bundle ID.

**Returns:** `Promise<UpdateInfo | null>` - Returns update information if available, or `null` if no update is available.

**UpdateInfo object:**
```typescript
interface UpdateInfo {
  version?: string;              // Human-readable version string
  versionCode?: number;          // Android version code
  availableVersionCode?: number; // Available version code
  updatePriority?: number;       // Update priority (0-5, higher is more urgent)
  releaseNotes?: string;         // Release notes for the update
  appUrl?: string;               // URL to the app store listing
}
```

### `startUpdate(options)`

Starts the in-app update process (Android only).

**Parameters:**
- `options` (object, optional)
  - `mode` (string): Update mode, either `'immediate'` or `'flexible'`
    - `immediate`: Forces users to update immediately, blocking app usage
    - `flexible`: Allows users to continue using the app while the update downloads

**Returns:** `Promise<boolean>` - Returns `true` if the update process was started successfully.

### `completeUpdate()`

Completes a flexible update after it has been downloaded (Android only). This should be called after the flexible update download is complete.

**Returns:** `Promise<boolean>` - Returns `true` if the update was completed successfully.

### `onProgress(callback)`

Sets up a progress listener for flexible updates (Android only).

**Parameters:**
- `callback` (function): A function that receives the download progress percentage (0-100)

**Example:**
```js
onProgress((percent) => {
  console.log(`Download progress: ${percent}%`);
  // Update your UI with the progress
});
```

## Platform Support

- **Android**: Full support for in-app updates via Google Play Store
- **iOS**: Version checking only (you need to implement your own iTunes API integration)

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
