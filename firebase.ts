// React Native Firebase Configuration
// Replaces Web SDK with native Firebase modules

import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';

// Firestore instance
export const db = firestore();

// Functions instance for australia-southeast1 region
// Correct syntax: functions().app.functions('region')
export const regionalFunctions = functions().app.functions('australia-southeast1');

// Note: React Native Firebase doesn't need explicit initialization
// The native modules are configured via google-services.json
