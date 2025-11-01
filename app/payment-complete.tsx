import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";

// Handle alansar://payment-complete deep link
// You can enhance this to read query params and show a receipt/confirmation.
export default function PaymentComplete() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    // If needed, you can pass params on to the donate screen
    router.replace({ pathname: "/(tabs)/donate", params: { from: "payment-complete", ...params } });
  }, [router, params]);

  return <Redirect href={{ pathname: "/(tabs)/donate", params: { from: "payment-complete", ...params } }} />;
}
