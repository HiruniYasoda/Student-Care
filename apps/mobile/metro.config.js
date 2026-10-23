const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Monorepo root directory
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch monorepo root and shared packages
config.watchFolders = [monorepoRoot];

// 2. Resolve packages from mobile node_modules and root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
