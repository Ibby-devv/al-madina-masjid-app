import { Stack } from 'expo-router';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';

export default function SettingsScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Settings',
          headerBackTitle: 'Home',
          headerStyle: {
            backgroundColor: '#1e3a8a',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <NotificationSettingsScreen />
    </>
  );
}