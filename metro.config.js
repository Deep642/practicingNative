const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const defaultConfig = getDefaultConfig(__dirname);

// Polyfill for Node.js 'os', 'path', 'module', and 'fs' modules
defaultConfig.resolver.extraNodeModules = {
  os: path.resolve(__dirname, "node_modules/os-browserify"),
  path: path.resolve(__dirname, "node_modules/path-browserify"),
  module: path.resolve(__dirname, "node_modules/browserify"),
  fs: path.resolve(__dirname, "node_modules/browserify-fs")
};

defaultConfig.resolver.assetExts.push("cjs");
defaultConfig.resolver.unstable_enablePackageExports = true; // Update this to true for compatibility

module.exports = defaultConfig;