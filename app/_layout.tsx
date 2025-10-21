import { Stack } from 'expo-router';
import { StripeProvider } from '@stripe/stripe-react-native';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SIKZ2LsKTjvYA4a7qJKDuUEIi0cosiLMk4VSxeMy2DXkHCzjJiwBsk5wpp6NXsBo5dwp0bwUoeMXupsvvZxLuxz008S6hj6Ej';

export default function RootLayout() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </StripeProvider>
  );
}