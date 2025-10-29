// Enable importing .svg files as React components in Expo/React Native
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Use react-native-svg-transformer for SVGs
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// Remove 'svg' from assetExts and add it to sourceExts so Metro treats them as source
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;
