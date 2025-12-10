const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname);

// Fix for AWS SDK and TurboModule compatibility
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-get-random-values': require.resolve('react-native-get-random-values'),
};

module.exports = withNativeWind(config, { input: './global.css' })