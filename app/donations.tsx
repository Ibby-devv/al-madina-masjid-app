import { Redirect, useRouter } from "expo-router";
import { useEffect } from "react";

// Alias route to handle alansar://donations deep links
// Redirects to the Donations tab entry screen
export default function DonationsAlias() {
  const router = useRouter();

  useEffect(() => {
    // Replace so the alias isn't left in the history stack
    router.replace("/(tabs)/donate");
  }, [router]);

  // Fallback in case useEffect hasn't run yet
  return <Redirect href="/(tabs)/donate" />;
}
