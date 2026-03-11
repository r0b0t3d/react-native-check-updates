import { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { checkForUpdate } from 'react-native-check-updates';
import type { UpdateInfo } from 'react-native-check-updates';

export default function App() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    checkForUpdate({
      bundleId: 'com.r0b0t3d.checkupdates',
    }).then((updateInfo) => {
      if (updateInfo) {
        console.log('New version available:', updateInfo);
      } else {
        console.log('No new version available');
      }
      setUpdateInfo(updateInfo);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text>Result: {updateInfo?.version}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
