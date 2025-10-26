// React Native Firebase Configuration
// Replaces Web SDK with native Firebase modules

import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';

// Firestore instance (auto-initialized, no config needed)
export const db = firestore();

// Functions instance configured for Australia region
const functionsInstance = functions();
export const regionalFunctions = functionsInstance.app.functions('australia-southeast1');

// For backwards compatibility, export functions instance
export const functions = functionsInstance;

// Note: React Native Firebase doesn't need explicit initialization
// The native modules are configured via google-services.json
