import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { regionalFunctions } from '../../firebase'; // Use existing export
import * as Linking from 'expo-linking';

export default function VerifyTokenScreen() {
  const { token } = useLocalSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      // Use regionalFunctions from firebase.ts
      const verifyManagementToken = regionalFunctions.httpsCallable('verifyManagementToken');

      const result = await verifyManagementToken({ token });
      const data = result.data as any;

      if (data.url) {
        setStatus('success');
        // Open Stripe Portal
        await Linking.openURL(data.url);
        // Go back after opening
        setTimeout(() => {
          router.replace('/(tabs)/donate');
        }, 1000);
      }
    } catch (error: any) {
      setStatus('error');
      Alert.alert('Error', error.message || 'Invalid or expired link', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/donate') }
      ]);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Verifying...',
          headerShown: true,
        }}
      />
      <View style={styles.container}>
        {status === 'verifying' && (
          <>
            <ActivityIndicator size="large" color="#1e3a8a" />
            <Text style={styles.text}>Verifying link...</Text>
          </>
        )}
        {status === 'success' && (
          <Text style={styles.text}>Opening Stripe Portal...</Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
});