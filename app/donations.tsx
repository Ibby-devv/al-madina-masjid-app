import { Redirect } from "expo-router";

// Alias route to handle alansar://donations deep links
// Redirects to the Donations tab entry screen
export default function DonationsAlias() {
  // Expo Router handles this automatically - just return the redirect
  return <Redirect href="/(tabs)/donate" />;
}
