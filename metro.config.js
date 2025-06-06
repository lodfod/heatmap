const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push("cjs"); // Add .cjs for firebase/auth compat
// The line below is what will fix it!
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
