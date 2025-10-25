import { StripeProvider } from '@stripe/stripe-react-native';
import { Stack } from 'expo-router';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../hooks/useAuth';
import { useFCM } from '../hooks/useFCM';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SIKZ2LsKTjvYA4a7qJKDuUEIi0cosiLMk4VSxeMy2DXkHCzjJiwBsk5wpp6NXsBo5dwp0bwUoeMXupsvvZxLuxz008S6hj6Ej';

export default function RootLayout() {
  const { initializing, isAuthenticated, userId } = useAuth();
  const { fcmToken } = useFCM(userId);

  if (initializing) {
    return <LoadingScreen />;
  }

  console.log('🔐 Authenticated:', isAuthenticated, 'UserID:', userId);
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </StripeProvider>
  );
}